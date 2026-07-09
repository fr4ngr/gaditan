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
            SELECT u.id, u.email, u.name, u.picture, u.avatar_url, u.bio, u.username, u.is_profile_completed, u.status, u.banned_until, u.verified, u.category
            FROM users u
            JOIN sessions s ON u.id = s.user_id
            WHERE s.id = ? AND s.expires_at > CURRENT_TIMESTAMP
        `;
        
        const result = await env.DB.prepare(query).bind(sessionId).first();

        if (!result) {
            return new Response(JSON.stringify({ user: null }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }

        // Si el usuario está baneado
        if (result.status === 'banned') {
            const isBanned = result.banned_until ? new Date(result.banned_until) > new Date() : true;
            if (isBanned) {
                // Borramos su sesión y devolvemos que está baneado
                await env.DB.prepare(`DELETE FROM sessions WHERE id = ?`).bind(sessionId).run();
                return new Response(JSON.stringify({ user: null, error: 'Tu cuenta ha sido suspendida por violar las normas de la comunidad.' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
            }
        }

        return new Response(JSON.stringify({ user: result }), { status: 200, headers: { 'Content-Type': 'application/json' } });

    } catch (e) {
        console.error("Auth me error:", e);
        return new Response(JSON.stringify({ user: null, error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
