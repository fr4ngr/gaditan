export async function onRequestGet(context) {
    const { env, request } = context;
    
    try {
        const cookieHeader = request.headers.get('Cookie');
        if (!cookieHeader) {
            return new Response(JSON.stringify({ user: null }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }

        const match = cookieHeader.match(/auth_session=([^;]+)/);
        if (!match) {
            return new Response(JSON.stringify({ user: null }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }

        const sessionId = match[1];

        // Buscar sesión y usuario en D1
        const query = `
            SELECT u.id, u.email, u.name, u.avatar_url, u.bio
            FROM users u
            JOIN sessions s ON u.id = s.user_id
            WHERE s.id = ? AND s.expires_at > CURRENT_TIMESTAMP
        `;
        
        const result = await env.DB.prepare(query).bind(sessionId).first();

        if (!result) {
            return new Response(JSON.stringify({ user: null }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }

        return new Response(JSON.stringify({ user: result }), { status: 200, headers: { 'Content-Type': 'application/json' } });

    } catch (e) {
        console.error("Auth me error:", e);
        return new Response(JSON.stringify({ user: null, error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
