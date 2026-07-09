export async function onRequestPost(context) {
    const { env, request } = context;
    
    try {
        const cookieHeader = request.headers.get('Cookie');
        if (!cookieHeader) return new Response('Unauthorized', { status: 401 });

        const match = cookieHeader.match(/auth_session=([^;]+)/);
        if (!match) return new Response('Unauthorized', { status: 401 });

        const sessionId = match[1];

        const session = await env.DB.prepare('SELECT user_id FROM sessions WHERE id = ? AND expires_at > CURRENT_TIMESTAMP').bind(sessionId).first();
        if (!session) return new Response('Unauthorized', { status: 401 });

        const userId = session.user_id;

        const body = await request.json();
        const messageId = body.messageId;

        if (!messageId) return new Response('Missing messageId', { status: 400 });

        // Only the receiver can mark it as viewed
        const updateQuery = `
            UPDATE direct_messages 
            SET viewed_at = CURRENT_TIMESTAMP 
            WHERE id = ? AND receiver_id = ? AND is_view_once = 1 AND viewed_at IS NULL
        `;
        const result = await env.DB.prepare(updateQuery).bind(messageId, userId).run();

        return new Response(JSON.stringify({ success: true, changes: result.meta.changes }), { status: 200, headers: { 'Content-Type': 'application/json' } });

    } catch (e) {
        console.error("DM view error:", e);
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
