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

        const deleteQuery = `DELETE FROM bookmarks WHERE user_id = ? AND content = ?`;
        await env.DB.prepare(deleteQuery).bind(session.user_id, body.content).run();

        return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });

    } catch (e) {
        console.error("Bookmark remove error:", e);
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
