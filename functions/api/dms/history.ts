export async function onRequestGet(context) {
    const { env, request } = context;
    
    try {
        const url = new URL(request.url);
        const otherUserId = url.searchParams.get('userId');
        if (!otherUserId) return new Response('Missing userId', { status: 400 });

        const cookieHeader = request.headers.get('Cookie');
        if (!cookieHeader) return new Response('Unauthorized', { status: 401 });

        const match = cookieHeader.match(/auth_session=([^;]+)/);
        if (!match) return new Response('Unauthorized', { status: 401 });

        const sessionId = match[1];

        const session = await env.DB.prepare('SELECT user_id FROM sessions WHERE id = ? AND expires_at > CURRENT_TIMESTAMP').bind(sessionId).first();
        if (!session) return new Response('Unauthorized', { status: 401 });

        const userId = session.user_id;

        // Mark messages as read
        await env.DB.prepare('UPDATE direct_messages SET read_at = CURRENT_TIMESTAMP WHERE sender_id = ? AND receiver_id = ? AND read_at IS NULL').bind(otherUserId, userId).run();

        // Get history
        const query = `
            SELECT id, sender_id, receiver_id, content, 
                   CASE WHEN is_view_once = 1 AND viewed_at IS NOT NULL THEN '[Foto Efímera Vista]' ELSE image_url END as image_url, 
                   is_view_once, viewed_at, created_at
            FROM direct_messages
            WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
            ORDER BY created_at ASC
            LIMIT 50
        `;
        
        const { results } = await env.DB.prepare(query).bind(userId, otherUserId, otherUserId, userId).all();

        return new Response(JSON.stringify({ messages: results }), { status: 200, headers: { 'Content-Type': 'application/json' } });

    } catch (e) {
        console.error("DM history error:", e);
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
