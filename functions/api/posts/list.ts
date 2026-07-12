export async function onRequestGet(context) {
    const { env, request } = context;
    
    try {
        const url = new URL(request.url);
        const limit = parseInt(url.searchParams.get('limit')) || 20;
        const offset = parseInt(url.searchParams.get('offset')) || 0;
        const userId = url.searchParams.get('userId');

        let query = `
            SELECT 
                p.id, p.content, p.image_url, p.audio_url, p.created_at, p.user_id, p.lat, p.lon,
                u.name as user_name, COALESCE(u.picture, u.avatar_url) as user_avatar
            FROM posts p
            JOIN users u ON p.user_id = u.id
        `;
        
        let results;
        if (userId) {
            query += ` WHERE p.user_id = ? ORDER BY p.created_at DESC LIMIT ? OFFSET ?`;
            results = (await env.DB.prepare(query).bind(userId, limit, offset).all()).results;
        } else {
            query += ` ORDER BY p.created_at DESC LIMIT ? OFFSET ?`;
            results = (await env.DB.prepare(query).bind(limit, offset).all()).results;
        }

        return new Response(JSON.stringify({ posts: results }), { status: 200, headers: { 'Content-Type': 'application/json' } });

    } catch (e) {
        console.error("Post list error:", e);
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
