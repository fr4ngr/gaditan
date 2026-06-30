async function authAndGetRepo(context) {
    const { env, request } = context;
    const authHeader = request.headers.get('Authorization');
    
    if (!env.ADMIN_PASSWORD || !authHeader || authHeader !== `Bearer ${env.ADMIN_PASSWORD}`) {
        throw new Error("No autorizado.");
    }
    if (!env.GITHUB_TOKEN) {
        throw new Error("GITHUB_TOKEN no configurado.");
    }
    
    return {
        repo: 'fr4ngr/cadiz.taxi',
        headers: {
            'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Cadiz-Taxi-Admin-Panel'
        }
    };
}

function decodeBase64Utf8(base64) {
    const binString = atob(base64.replace(/\s/g, ''));
    const bytes = new Uint8Array(binString.length);
    for (let i = 0; i < binString.length; i++) {
        bytes[i] = binString.charCodeAt(i);
    }
    return new TextDecoder('utf-8').decode(bytes);
}

function encodeUtf8Base64(str) {
    const utf8Bytes = new TextEncoder().encode(str);
    let binary = '';
    const chunkSize = 8192;
    for (let i = 0; i < utf8Bytes.length; i += chunkSize) {
        binary += String.fromCharCode.apply(null, utf8Bytes.subarray(i, i + chunkSize));
    }
    return btoa(binary);
}

export async function onRequestGet(context) {
    try {
        const { repo, headers } = await authAndGetRepo(context);
        const url = new URL(context.request.url);
        const action = url.searchParams.get('action'); // 'list' or 'get'
        const pathParam = url.searchParams.get('path') || '';

        if (action === 'get') {
            // Obtener el contenido de un archivo Markdown específico
            const getRes = await fetch(`https://api.github.com/repos/${repo}/contents/src/data/brains/${pathParam}.md`, { headers });
            if (!getRes.ok) throw new Error("Fallo al obtener el archivo");
            const getJson = await getRes.json();
            const content = decodeBase64Utf8(getJson.content);
            return new Response(JSON.stringify({ content, sha: getJson.sha }), { status: 200, headers: { 'Content-Type': 'application/json' }});
        } else {
            // Listar el directorio especificado en pathParam (o la raíz de brains si está vacío)
            const targetPath = pathParam ? `src/data/brains/${pathParam}` : `src/data/brains`;
            const getRes = await fetch(`https://api.github.com/repos/${repo}/contents/${targetPath}`, { headers });
            if (!getRes.ok) {
                if (getRes.status === 404) return new Response(JSON.stringify([]), { status: 200, headers: { 'Content-Type': 'application/json' }});
                throw new Error("Fallo al listar el directorio");
            }
            const items = await getRes.json();
            
            // Si es un archivo, la API de GitHub devuelve un objeto, si es directorio devuelve array. Aseguramos array.
            if (!Array.isArray(items)) {
                throw new Error("La ruta no es un directorio");
            }

            const result = items.map(f => ({
                name: f.name,
                type: f.type, // 'file' or 'dir'
                sha: f.sha
            }));
            return new Response(JSON.stringify(result), { status: 200, headers: { 'Content-Type': 'application/json' }});
        }
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: err.message === "No autorizado." ? 401 : 500 });
    }
}

export async function onRequestPost(context) {
    try {
        const { repo, headers } = await authAndGetRepo(context);
        const body = await context.request.json();
        
        const filePath = body.path; // e.g., "Materia/A_oficial/documento"
        const content = body.content;
        
        if (!filePath || !content) {
            return new Response(JSON.stringify({ error: "Faltan datos" }), { status: 400 });
        }

        // Obtener el SHA actual (si existe) para poder hacer update
        const getRes = await fetch(`https://api.github.com/repos/${repo}/contents/src/data/brains/${filePath}.md`, { headers });
        let sha = null;
        if (getRes.ok) {
            const getJson = await getRes.json();
            sha = getJson.sha;
        }

        const putBody = {
            message: `chore: update brain document ${filePath}`,
            content: encodeUtf8Base64(content),
            branch: 'main'
        };
        if (sha) putBody.sha = sha;

        const putRes = await fetch(`https://api.github.com/repos/${repo}/contents/src/data/brains/${filePath}.md`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(putBody)
        });

        if (!putRes.ok) throw new Error("Fallo al guardar en GitHub: " + await putRes.text());

        return new Response(JSON.stringify({ message: "Guardado con éxito" }), { status: 200, headers: { 'Content-Type': 'application/json' }});
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: err.message === "No autorizado." ? 401 : 500 });
    }
}

export async function onRequestDelete(context) {
    try {
        const { repo, headers } = await authAndGetRepo(context);
        const body = await context.request.json();
        const filePath = body.path;
        const sha = body.sha;

        if (!filePath || !sha) return new Response(JSON.stringify({ error: "Faltan datos" }), { status: 400 });

        const delRes = await fetch(`https://api.github.com/repos/${repo}/contents/src/data/brains/${filePath}.md`, {
            method: 'DELETE',
            headers,
            body: JSON.stringify({
                message: `chore: delete brain document ${filePath}`,
                sha: sha,
                branch: 'main'
            })
        });

        if (!delRes.ok) throw new Error("Fallo al eliminar en GitHub: " + await delRes.text());

        return new Response(JSON.stringify({ message: "Eliminado con éxito" }), { status: 200, headers: { 'Content-Type': 'application/json' }});
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: err.message === "No autorizado." ? 401 : 500 });
    }
}
