export async function onRequestGet(context) {
    const { env, request } = context;
    const url = new URL(request.url);
    const userId = url.searchParams.get('id');

    if (!userId) {
        return new Response(JSON.stringify({ error: 'Falta el ID del usuario' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    try {
        // Query user data
        const userQuery = `SELECT id, name, username, bio, category, avatar_url, picture, created_at, dm_privacy FROM users WHERE id = ?`;
        const user = await env.DB.prepare(userQuery).bind(userId).first();

        if (!user) {
            return new Response(JSON.stringify({ error: 'Usuario no encontrado' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
        }

        // Query posts count
        const postsQuery = `SELECT COUNT(*) as total_posts FROM posts WHERE user_id = ?`;
        const postCountResult = await env.DB.prepare(postsQuery).bind(userId).first();
        const totalPosts = postCountResult ? postCountResult.total_posts : 0;

        const profileData = {
            id: user.id,
            name: user.name,
            username: user.username,
            bio: user.bio,
            category: user.category,
            avatar_url: user.avatar_url || user.picture,
            created_at: user.created_at,
            dm_privacy: user.dm_privacy || 'everyone',
            posts_count: totalPosts
        };

        return new Response(JSON.stringify({ success: true, profile: profileData }), { 
            status: 200, 
            headers: { 'Content-Type': 'application/json' } 
        });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
