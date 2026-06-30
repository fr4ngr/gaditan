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
        const getRes = await fetch(`https://api.github.com/repos/${repo}/contents/src/data/system-prompt.md`, { headers });
        if (!getRes.ok) throw new Error("Fallo al obtener el archivo system-prompt.md");
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

        const dateStr = new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' });
        const dateHeader = `> [!NOTE]\n> **Leyes aplicadas desde:** ${dateStr}\n\n`;
        
        let finalContent = content;
        // Check if there's already a date header block
        const dateHeaderRegex = /^> \[!NOTE\]\n> \*\*Leyes aplicadas desde:\*\*.*\n\n/;
        if (dateHeaderRegex.test(finalContent)) {
            finalContent = finalContent.replace(dateHeaderRegex, dateHeader);
        } else {
            finalContent = dateHeader + finalContent;
        }

        const getRes = await fetch(`https://api.github.com/repos/${repo}/contents/src/data/system-prompt.md`, { headers });
        let sha = null;
        if (getRes.ok) {
            const getJson = await getRes.json();
            sha = getJson.sha;
        }

        const putBody = {
            message: `chore: update system prompt`,
            content: encodeUtf8Base64(finalContent),
            branch: 'main'
        };
        if (sha) putBody.sha = sha;

        const putRes = await fetch(`https://api.github.com/repos/${repo}/contents/src/data/system-prompt.md`, {
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
