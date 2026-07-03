export async function onRequestGet(context) {
    const { env, request } = context;
    
    try {
        const url = new URL(request.url);
        const limit = parseInt(url.searchParams.get('limit')) || 20;
        const offset = parseInt(url.searchParams.get('offset')) || 0;

        const query = `
            SELECT 
                p.id, p.content, p.image_url, p.created_at,
                u.name as user_name, u.avatar_url as user_avatar
            FROM posts p
            JOIN users u ON p.user_id = u.id
            ORDER BY p.created_at DESC
            LIMIT ? OFFSET ?
        `;
        
        const { results } = await env.DB.prepare(query).bind(limit, offset).all();

        return new Response(JSON.stringify({ posts: results }), { status: 200, headers: { 'Content-Type': 'application/json' } });

    } catch (e) {
        console.error("Post list error:", e);
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
