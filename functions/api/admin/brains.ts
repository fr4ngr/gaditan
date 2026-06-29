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
    return btoa(String.fromCharCode(...utf8Bytes));
}

export async function onRequestGet(context) {
    try {
        const { repo, headers } = await authAndGetRepo(context);
        const url = new URL(context.request.url);
        const filename = url.searchParams.get('file');

        if (filename) {
            // Obtener un cerebro específico
            const getRes = await fetch(`https://api.github.com/repos/${repo}/contents/src/data/brains/${filename}.md`, { headers });
            if (!getRes.ok) throw new Error("Fallo al obtener el archivo");
            const getJson = await getRes.json();
            const content = decodeBase64Utf8(getJson.content);
            return new Response(JSON.stringify({ content, sha: getJson.sha }), { status: 200, headers: { 'Content-Type': 'application/json' }});
        } else {
            // Listar todos
            const getRes = await fetch(`https://api.github.com/repos/${repo}/contents/src/data/brains`, { headers });
            if (!getRes.ok) {
                if (getRes.status === 404) return new Response(JSON.stringify([]), { status: 200, headers: { 'Content-Type': 'application/json' }});
                throw new Error("Fallo al listar archivos");
            }
            const files = await getRes.json();
            const brains = files.filter(f => f.name.endsWith('.md')).map(f => ({
                name: f.name.replace('.md', ''),
                sha: f.sha
            }));
            return new Response(JSON.stringify(brains), { status: 200, headers: { 'Content-Type': 'application/json' }});
        }
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: err.message === "No autorizado." ? 401 : 500 });
    }
}

export async function onRequestPost(context) {
    try {
        const { repo, headers } = await authAndGetRepo(context);
        const body = await context.request.json();
        
        const filename = body.filename;
        const content = body.content;
        
        if (!filename || !content) {
            return new Response(JSON.stringify({ error: "Faltan datos" }), { status: 400 });
        }

        // Obtener el SHA actual (si existe) para poder hacer update
        const getRes = await fetch(`https://api.github.com/repos/${repo}/contents/src/data/brains/${filename}.md`, { headers });
        let sha = null;
        if (getRes.ok) {
            const getJson = await getRes.json();
            sha = getJson.sha;
        }

        const putBody = {
            message: `chore: update brain ${filename}`,
            content: encodeUtf8Base64(content),
            branch: 'main'
        };
        if (sha) putBody.sha = sha;

        const putRes = await fetch(`https://api.github.com/repos/${repo}/contents/src/data/brains/${filename}.md`, {
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
        const filename = body.filename;
        const sha = body.sha;

        if (!filename || !sha) return new Response(JSON.stringify({ error: "Faltan datos" }), { status: 400 });

        const delRes = await fetch(`https://api.github.com/repos/${repo}/contents/src/data/brains/${filename}.md`, {
            method: 'DELETE',
            headers,
            body: JSON.stringify({
                message: `chore: delete brain ${filename}`,
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
