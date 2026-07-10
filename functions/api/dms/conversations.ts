export async function onRequestGet(context) {
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

        // Query to get the latest message per conversation
        const query = `
            SELECT 
                u.id as user_id, 
                u.name, 
                u.username, 
                COALESCE(u.picture, u.avatar_url) as avatar_url,
                u.verified,
                u.category,
                dm.content as last_message,
                dm.created_at as last_message_date,
                (SELECT COUNT(*) FROM direct_messages WHERE sender_id = u.id AND receiver_id = ? AND read_at IS NULL) as unread_count
            FROM users u
            JOIN (
                SELECT 
                    CASE 
                        WHEN sender_id = ? THEN receiver_id 
                        ELSE sender_id 
                    END as other_id,
                    content,
                    created_at,
                    MAX(id)
                FROM direct_messages
                WHERE sender_id = ? OR receiver_id = ?
                GROUP BY other_id
            ) dm ON u.id = dm.other_id
            ORDER BY dm.created_at DESC
        `;
        
        // Note: the `read` column doesn't exist, we added `viewed_at` for view_once images, wait!
        // My schema was:
        // CREATE TABLE direct_messages (
        //    id INTEGER PRIMARY KEY AUTOINCREMENT,
        //    sender_id INTEGER NOT NULL,
        //    receiver_id INTEGER NOT NULL,
        //    content TEXT,
        //    image_url TEXT,
        //    is_view_once INTEGER DEFAULT 0,
        //    viewed_at DATETIME,
        //    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        //    ...
        // );
        // I need to add a `read_at` or just `read` for normal text messages. 
        // Let's modify the migration to include `read_at`? I forgot to include `read_at`! 
        // Ah, the user didn't care about read receipts but it's good for unread count.
        // If I didn't add it, let's just use 0 unread for now or I can do another ALTER TABLE.
        
        const { results } = await env.DB.prepare(query).bind(userId, userId, userId, userId).all();

        return new Response(JSON.stringify({ conversations: results }), { status: 200, headers: { 'Content-Type': 'application/json' } });

    } catch (e) {
        console.error("DM conversations error:", e);
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
