export async function onRequestGet(context) {
    const { env, request } = context;
    
    try {
        const cookieHeader = request.headers.get('Cookie');
        if (!cookieHeader) return new Response(JSON.stringify([]), { status: 200, headers: { 'Content-Type': 'application/json' } });

        const match = cookieHeader.match(/auth_session=([^;]+)/);
        if (!match) return new Response(JSON.stringify([]), { status: 200, headers: { 'Content-Type': 'application/json' } });

        const sessionId = match[1];

        const userQuery = `SELECT user_id FROM sessions WHERE id = ? AND expires_at > CURRENT_TIMESTAMP`;
        const session = await env.DB.prepare(userQuery).bind(sessionId).first();
        if (!session) return new Response(JSON.stringify([]), { status: 200, headers: { 'Content-Type': 'application/json' } });

        const listQuery = `SELECT content FROM bookmarks WHERE user_id = ? ORDER BY created_at ASC`;
        const { results } = await env.DB.prepare(listQuery).bind(session.user_id).all();

        const bookmarks = results.map(row => row.content);

        return new Response(JSON.stringify(bookmarks), { status: 200, headers: { 'Content-Type': 'application/json' } });

    } catch (e) {
        console.error("Bookmark list error:", e);
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
