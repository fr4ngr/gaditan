export async function onRequestPost(context) {
    const { env, request } = context;

    // Basic auth check
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || authHeader !== `Bearer ${env.ADMIN_PASSWORD}`) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const queries = [
            "ALTER TABLE users ADD COLUMN username TEXT",
            "ALTER TABLE users ADD COLUMN is_profile_completed INTEGER DEFAULT 0",
            "ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'active'",
            "ALTER TABLE users ADD COLUMN banned_until DATETIME",
            "ALTER TABLE users ADD COLUMN verified INTEGER DEFAULT 0"
        ];

        let results = [];
        for (const query of queries) {
            try {
                await env.DB.prepare(query).run();
                results.push(`Exito: ${query}`);
            } catch (err) {
                // If column already exists, it will throw an error, we can ignore it
                results.push(`Ignorado (quizas ya existe): ${query} - Error: ${err.message}`);
            }
        }

        return new Response(JSON.stringify({ success: true, results }), { status: 200, headers: { 'Content-Type': 'application/json' } });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
