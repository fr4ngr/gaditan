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
        const getRes = await fetch(`https://api.github.com/repos/${repo}/contents/src/data/theme.json`, { headers });
        if (!getRes.ok) {
            // Si no existe, devolvemos un valor por defecto
            if (getRes.status === 404) {
                 return new Response(JSON.stringify({ content: JSON.stringify({primary: "#3b82f6", radius: "12px"}), sha: null }), { status: 200, headers: { 'Content-Type': 'application/json' }});
            }
            throw new Error("Fallo al obtener el archivo theme.json");
        }
        const getJson = await getRes.json();
        const content = decodeBase64Utf8(getJson.content);
        return new Response(JSON.stringify({ content, sha: getJson.sha }), { status: 200, headers: { 'Content-Type': 'application/json' }});
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: err.message === "No autorizado." ? 401 : 500 });
    }
}

export async function onRequestPost(context) {
    try {
        const { repo, headers } = await authAndGetRepo(context);
        const body = await context.request.json();
        const content = body.content;
        
        if (!content) {
            return new Response(JSON.stringify({ error: "Faltan datos" }), { status: 400 });
        }

        const getRes = await fetch(`https://api.github.com/repos/${repo}/contents/src/data/theme.json`, { headers });
        let sha = null;
        if (getRes.ok) {
            const getJson = await getRes.json();
            sha = getJson.sha;
        }

        const putBody = {
            message: `chore: update global theme from admin panel`,
            content: encodeUtf8Base64(content),
            branch: 'main'
        };
        if (sha) putBody.sha = sha;

        const putRes = await fetch(`https://api.github.com/repos/${repo}/contents/src/data/theme.json`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(putBody)
        });

        if (!putRes.ok) throw new Error("Fallo al guardar en GitHub: " + await putRes.text());

        return new Response(JSON.stringify({ message: "Tema guardado con éxito" }), { status: 200, headers: { 'Content-Type': 'application/json' }});
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: err.message === "No autorizado." ? 401 : 500 });
    }
}
