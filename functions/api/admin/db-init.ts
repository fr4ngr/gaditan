export async function onRequestPost(context) {
    try {
        const { env, request } = context;
        
        // Basic auth check
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || authHeader !== `Bearer ${env.ADMIN_PASSWORD}`) {
            return new Response('Unauthorized', { status: 401 });
        }

        if (!env.DB) {
            return new Response(JSON.stringify({ error: "La base de datos D1 no está configurada (Falta el binding 'DB')." }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Crear la tabla si no existe
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS chat_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                user_message TEXT,
                bot_response TEXT,
                intent_category TEXT
            );
        `;

        await env.DB.prepare(createTableQuery).run();

        return new Response(JSON.stringify({ success: true, message: "Tabla chat_logs creada o verificada correctamente." }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
