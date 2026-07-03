import { brains } from '../compiled-brains.js';

export async function onRequestGet(context) {
    const { env, request } = context;
    const url = new URL(request.url);
    
    // 1. Verificación de Seguridad
    const secret = url.searchParams.get('secret');
    if (secret !== env.CRON_SECRET) {
        return new Response(JSON.stringify({ error: "No autorizado" }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        let processed = 0;
        let errors = 0;
        let lastError = "";

        for (const brain of brains) {
            // Ignoramos archivos meta vacíos
            if (brain.fileName === '_meta') continue;

            try {
                // Separar el contenido en trozos más pequeños (por doble salto de línea)
                const chunks = brain.content.split('\\n\\n').filter(c => c.trim().length > 10);
                
                for (let i = 0; i < chunks.length; i++) {
                    const chunk = chunks[i];
                    const docId = crypto.randomUUID();

                    // 2. Generar el Embedding Vectorial
                    const aiResponse = await env.AI.run('@cf/baai/bge-large-en-v1.5', { 
                        text: [chunk] 
                    });
                    const vector = aiResponse.data[0];

                    // 3. Guardar en Base de Datos D1 (El contenido real)
                    await env.DB.prepare(
                        `INSERT INTO knowledge_base (id, tipo, materia, content) VALUES (?, ?, ?, ?)`
                    ).bind(docId, brain.tipo || 'N/A', brain.materia || 'N/A', chunk).run();

                    // 4. Guardar en Vectorize (El índice matemático)
                    await env.VECTORIZE_INDEX.upsert([{
                        id: docId,
                        values: vector,
                        metadata: {
                            tipo: brain.tipo || 'N/A',
                            materia: brain.materia || 'N/A'
                        }
                    }]);

                    processed++;
                }
            } catch (err) {
                console.error(`Error processing brain ${brain.fileName}:`, err);
                errors++;
                lastError = err.message || err.toString();
            }
        }

        return new Response(JSON.stringify({ 
            success: true, 
            message: `Vectorización completada. Procesados: ${processed}, Errores: ${errors}. Detalles: ${lastError}` 
        }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (e) {
        console.error("Vectorize sync error:", e);
        return new Response(JSON.stringify({ error: e.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
