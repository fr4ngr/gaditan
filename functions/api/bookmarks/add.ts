export async function onRequestPost(context) {
    const { env, request } = context;
    
    try {
        const cookieHeader = request.headers.get('Cookie');
        if (!cookieHeader) return new Response('Unauthorized', { status: 401 });

        const match = cookieHeader.match(/auth_session=([^;]+)/);
        if (!match) return new Response('Unauthorized', { status: 401 });

        const sessionId = match[1];

        const userQuery = `SELECT user_id FROM sessions WHERE id = ? AND expires_at > CURRENT_TIMESTAMP`;
        const session = await env.DB.prepare(userQuery).bind(sessionId).first();
        if (!session) return new Response('Unauthorized', { status: 401 });

        const body = await request.json();
        if (!body.content) return new Response('Bad Request', { status: 400 });

        const id = crypto.randomUUID();
        
        const checkQuery = `SELECT id FROM bookmarks WHERE user_id = ? AND content = ?`;
        const exists = await env.DB.prepare(checkQuery).bind(session.user_id, body.content).first();
        
        if (!exists) {
            const insertQuery = `INSERT INTO bookmarks (id, user_id, content) VALUES (?, ?, ?)`;
            await env.DB.prepare(insertQuery).bind(id, session.user_id, body.content).run();
        }

        return new Response(JSON.stringify({ success: true, id: exists ? exists.id : id }), { status: 200, headers: { 'Content-Type': 'application/json' } });

    } catch (e) {
        console.error("Bookmark add error:", e);
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
