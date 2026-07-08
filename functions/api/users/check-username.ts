export async function onRequestGet(context) {
    const { env, request } = context;
    const url = new URL(request.url);
    const username = url.searchParams.get('username');

    if (!username) {
        return new Response(JSON.stringify({ error: 'Username missing' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    try {
        const query = `SELECT id FROM users WHERE username = ? COLLATE NOCASE`;
        const result = await env.DB.prepare(query).bind(username).first();

        return new Response(JSON.stringify({ available: !result }), { 
            status: 200, 
            headers: { 'Content-Type': 'application/json' } 
        });
    } catch (e) {
        // En caso de que la tabla aún no tenga la columna
        if (e.message.includes('no such column: username')) {
            return new Response(JSON.stringify({ available: true, notice: 'Column missing in DB, assuming available for dev' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
