export async function onRequestGet(context) {
    const { env, request } = context;
    const url = new URL(request.url);
    const queryStr = url.searchParams.get('q');

    if (!queryStr || queryStr.trim().length < 2) {
        return new Response(JSON.stringify({ users: [] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    try {
        const dbQuery = `%${queryStr.trim()}%`;
        const sql = `
            SELECT id, name, username, avatar_url, picture, category 
            FROM users 
            WHERE (name LIKE ? OR username LIKE ?) AND status = 'active'
            LIMIT 10
        `;
        
        const { results } = await env.DB.prepare(sql).bind(dbQuery, dbQuery).all();

        const users = results.map(u => ({
            id: u.id,
            name: u.name,
            username: u.username,
            avatar_url: u.avatar_url || u.picture,
            category: u.category
        }));

        return new Response(JSON.stringify({ users }), { 
            status: 200, 
            headers: { 'Content-Type': 'application/json' } 
        });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
