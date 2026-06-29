export async function onRequestPost(context) {
    try {
        const { request, env } = context;
        
        // 1. Autenticación básica
        const authHeader = request.headers.get('Authorization');
        if (!env.ADMIN_PASSWORD) {
            return new Response(JSON.stringify({ error: "ADMIN_PASSWORD no configurada en entorno" }), { status: 500 });
        }
        
        if (!authHeader || authHeader !== `Bearer ${env.ADMIN_PASSWORD}`) {
            return new Response(JSON.stringify({ error: "No autorizado. Contraseña incorrecta." }), { status: 401 });
        }

        // 2. Extraer contenido
        const body = await request.json();
        const newKnowledgeText = body.content;
        
        if (!newKnowledgeText) {
            return new Response(JSON.stringify({ error: "El contenido está vacío." }), { status: 400 });
        }

        // 3. Preparar nuevo archivo .ts
        // Escapamos comillas invertidas (backticks) y $ para evitar que rompan el template string
        const safeText = newKnowledgeText.replace(/`/g, '\\`').replace(/\$/g, '\\$');
        const newFileContent = `// Archivo autogenerado por el Panel de Administración\nexport const knowledgeBase = \`\n${safeText}\n\`;\n`;

        // 4. Subir a GitHub
        if (!env.GITHUB_TOKEN) {
            return new Response(JSON.stringify({ error: "GITHUB_TOKEN no configurado en entorno." }), { status: 500 });
        }

        const repo = 'fr4ngr/cadiz.taxi';
        const path = 'src/data/taxi-knowledge.ts';
        const apiUrl = `https://api.github.com/repos/${repo}/contents/${path}`;
        
        const headers = {
            'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Cadiz-Taxi-Admin-Panel'
        };

        // 4.1 Obtener el SHA actual del archivo (necesario para hacer update en Github)
        let sha = '';
        const getRes = await fetch(apiUrl, { headers });
        if (getRes.ok) {
            const getJson = await getRes.json();
            sha = getJson.sha;
        } else if (getRes.status !== 404) {
            return new Response(JSON.stringify({ error: "Fallo al obtener SHA de GitHub: " + await getRes.text() }), { status: 500 });
        }

        // 4.2 Hacer el PUT
        // NOTA: btoa en Cloudflare Workers requiere un string binario si hay caracteres utf8 (como acentos)
        // Usamos este truco para UTF-8 base64
        const utf8Bytes = new TextEncoder().encode(newFileContent);
        const base64Content = btoa(String.fromCharCode(...utf8Bytes));

        const putBody = {
            message: 'chore: update taxi knowledge base from admin panel',
            content: base64Content,
            branch: 'main'
        };
        
        if (sha) {
            putBody.sha = sha;
        }

        const putRes = await fetch(apiUrl, {
            method: 'PUT',
            headers: headers,
            body: JSON.stringify(putBody)
        });

        if (!putRes.ok) {
            const errText = await putRes.text();
            return new Response(JSON.stringify({ error: "Fallo al guardar en GitHub: " + errText }), { status: 500 });
        }

        return new Response(JSON.stringify({ message: "La base de conocimientos se ha actualizado. Cloudflare desplegará la web en 1-2 minutos." }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: "Error interno del servidor: " + err.message }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function onRequestGet(context) {
    try {
        const { request, env } = context;
        
        // 1. Autenticación básica
        const authHeader = request.headers.get('Authorization');
        if (!env.ADMIN_PASSWORD) {
            return new Response(JSON.stringify({ error: "ADMIN_PASSWORD no configurada en entorno" }), { status: 500 });
        }
        
        if (!authHeader || authHeader !== `Bearer ${env.ADMIN_PASSWORD}`) {
            return new Response(JSON.stringify({ error: "No autorizado. Contraseña incorrecta." }), { status: 401 });
        }

        if (!env.GITHUB_TOKEN) {
            return new Response(JSON.stringify({ error: "GITHUB_TOKEN no configurado en entorno." }), { status: 500 });
        }

        const repo = 'fr4ngr/cadiz.taxi';
        const path = 'src/data/taxi-knowledge.ts';
        const apiUrl = `https://api.github.com/repos/${repo}/contents/${path}`;
        
        const headers = {
            'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Cadiz-Taxi-Admin-Panel'
        };

        const getRes = await fetch(apiUrl, { headers });
        if (!getRes.ok) {
            return new Response(JSON.stringify({ error: "Fallo al obtener de GitHub." }), { status: 500 });
        }

        const getJson = await getRes.json();
        
        // Base64 to UTF-8
        const binString = atob(getJson.content.replace(/\s/g, ''));
        const bytes = new Uint8Array(binString.length);
        for (let i = 0; i < binString.length; i++) {
            bytes[i] = binString.charCodeAt(i);
        }
        const content = new TextDecoder('utf-8').decode(bytes);

        // Extraer el contenido dentro de las comillas invertidas
        const match = content.match(/export const knowledgeBase = `([\s\S]*?)`;/);
        let text = match ? match[1] : content;
        
        // Quitar escapado previo
        text = text.replace(/\\`/g, '`').replace(/\\\$/g, '$').trim();

        return new Response(JSON.stringify({ content: text }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: "Error interno: " + err.message }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
