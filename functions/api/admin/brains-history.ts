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

export async function onRequestGet(context) {
    try {
        const { repo, headers } = await authAndGetRepo(context);
        const url = new URL(context.request.url);
        const action = url.searchParams.get('action'); // 'list' or 'get'
        const pathParam = url.searchParams.get('path'); // e.g. turismo/A_oficial/file
        
        if (!pathParam) {
            throw new Error("Ruta no especificada");
        }
        
        const targetPath = `src/data/brains/${pathParam}.md`;

        if (action === 'get') {
            // Get content of a specific version (ref=sha)
            const ref = url.searchParams.get('ref');
            if (!ref) throw new Error("SHA no especificado");
            
            const getRes = await fetch(`https://api.github.com/repos/${repo}/contents/${targetPath}?ref=${ref}`, { headers });
            if (!getRes.ok) throw new Error("Fallo al obtener la versión del archivo");
            
            const getJson = await getRes.json();
            const content = decodeBase64Utf8(getJson.content);
            return new Response(JSON.stringify({ content, sha: getJson.sha }), { status: 200, headers: { 'Content-Type': 'application/json' }});
            
        } else if (action === 'list') {
            // List commit history for the file
            const getRes = await fetch(`https://api.github.com/repos/${repo}/commits?path=${targetPath}`, { headers });
            if (!getRes.ok) throw new Error("Fallo al listar el historial");
            
            const commits = await getRes.json();
            
            const result = commits.map((c: any) => ({
                sha: c.sha,
                message: c.commit.message,
                date: c.commit.committer.date,
                author: c.commit.author.name
            }));
            
            return new Response(JSON.stringify(result), { status: 200, headers: { 'Content-Type': 'application/json' }});
        } else {
             throw new Error("Acción no válida");
        }
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
