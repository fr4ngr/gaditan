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
        
        // Fetch A
        let contentA = "";
        try {
            const resA = await fetch(`https://api.github.com/repos/${repo}/contents/src/data/system-prompt-a.md`, { headers });
            if (resA.ok) contentA = decodeBase64Utf8((await resA.json()).content);
            else {
                // fallback to old system-prompt.md
                const resOld = await fetch(`https://api.github.com/repos/${repo}/contents/src/data/system-prompt.md`, { headers });
                if (resOld.ok) contentA = decodeBase64Utf8((await resOld.json()).content);
            }
        } catch(e) {}

        // Fetch B
        let contentB = "";
        try {
            const resB = await fetch(`https://api.github.com/repos/${repo}/contents/src/data/system-prompt-b.md`, { headers });
            if (resB.ok) contentB = decodeBase64Utf8((await resB.json()).content);
        } catch(e) {}

        // Fetch Config
        let config = { active: false, trafficA: 50 };
        try {
            const resC = await fetch(`https://api.github.com/repos/${repo}/contents/src/data/ab-config.json`, { headers });
            if (resC.ok) config = JSON.parse(decodeBase64Utf8((await resC.json()).content));
        } catch(e) {}

        return new Response(JSON.stringify({ contentA, contentB, config }), { status: 200, headers: { 'Content-Type': 'application/json' }});
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: err.message === "No autorizado." ? 401 : 500 });
    }
}

export async function onRequestPost(context) {
    try {
        const { repo, headers } = await authAndGetRepo(context);
        const body = await context.request.json();
        const { contentA, contentB, config } = body;
        
        if (contentA === undefined) return new Response(JSON.stringify({ error: "Faltan datos" }), { status: 400 });

        const dateStr = new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' });
        const dateHeader = `> [!NOTE]\n> **Leyes aplicadas desde:** ${dateStr}\n\n`;
        
        const formatContent = (c) => {
            if (!c) return "";
            const dateHeaderRegex = /^> \[!NOTE\]\n> \*\*Leyes aplicadas desde:\*\*.*\n\n/;
            return dateHeaderRegex.test(c) ? c.replace(dateHeaderRegex, dateHeader) : dateHeader + c;
        };

        const finalA = formatContent(contentA);
        const finalB = formatContent(contentB);
        const finalConfig = JSON.stringify(config || { active: false, trafficA: 50 }, null, 2);

        // 1. Get branch ref
        const refRes = await fetch(`https://api.github.com/repos/${repo}/git/refs/heads/main`, { headers });
        if (!refRes.ok) throw new Error("No se pudo obtener ref main");
        const refData = await refRes.json();
        const commitSha = refData.object.sha;

        // 2. Get commit
        const commitRes = await fetch(`https://api.github.com/repos/${repo}/git/commits/${commitSha}`, { headers });
        const commitData = await commitRes.json();
        const baseTreeSha = commitData.tree.sha;

        // 3. Create Tree
        const treeRes = await fetch(`https://api.github.com/repos/${repo}/git/trees`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                base_tree: baseTreeSha,
                tree: [
                    { path: 'src/data/system-prompt-a.md', mode: '100644', type: 'blob', content: finalA },
                    { path: 'src/data/system-prompt-b.md', mode: '100644', type: 'blob', content: finalB },
                    { path: 'src/data/ab-config.json', mode: '100644', type: 'blob', content: finalConfig }
                ]
            })
        });
        if (!treeRes.ok) throw new Error("No se pudo crear el tree");
        const treeData = await treeRes.json();

        // 4. Create Commit
        const createCommitRes = await fetch(`https://api.github.com/repos/${repo}/git/commits`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                message: 'chore(admin): update system prompts A/B via Admin Panel',
                tree: treeData.sha,
                parents: [commitSha]
            })
        });
        if (!createCommitRes.ok) throw new Error("No se pudo crear commit");
        const createCommitData = await createCommitRes.json();

        // 5. Update Ref
        const updateRefRes = await fetch(`https://api.github.com/repos/${repo}/git/refs/heads/main`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({ sha: createCommitData.sha })
        });
        if (!updateRefRes.ok) throw new Error("No se pudo actualizar main");

        return new Response(JSON.stringify({ message: "Guardado con éxito" }), { status: 200, headers: { 'Content-Type': 'application/json' }});
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: err.message === "No autorizado." ? 401 : 500 });
    }
}
