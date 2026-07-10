export async function onRequestGet(context) {
    const { env } = context;

    try {
        const query = `
            SELECT id, name, username, avatar_url, picture, category, bio 
            FROM users 
            WHERE status = 'active'
            ORDER BY created_at DESC
            LIMIT 100
        `;
        
        const { results } = await env.DB.prepare(query).all();

        const users = results.map(u => ({
            id: u.id,
            name: u.name,
            username: u.username,
            avatar_url: u.avatar_url || u.picture,
            category: u.category || 'local',
            bio: u.bio
        }));

        return new Response(JSON.stringify({ users }), { 
            status: 200, 
            headers: { 'Content-Type': 'application/json' } 
        });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
