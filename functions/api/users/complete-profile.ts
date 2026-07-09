export async function onRequestPost(context) {
    const { env, request } = context;
    
    try {
        // Verificar sesión
        const cookieHeader = request.headers.get('Cookie');
        if (!cookieHeader) return new Response('Unauthorized', { status: 401 });
        const match = cookieHeader.match(/auth_session=([^;]+)/);
        if (!match) return new Response('Unauthorized', { status: 401 });
        const sessionId = match[1];

        // Obtener usuario actual
        const userQuery = `SELECT u.id FROM users u JOIN sessions s ON u.id = s.user_id WHERE s.id = ? AND s.expires_at > CURRENT_TIMESTAMP`;
        const user = await env.DB.prepare(userQuery).bind(sessionId).first();
        if (!user) return new Response('Unauthorized', { status: 401 });

        const body = await request.json();
        const { username, name, bio, category } = body;

        if (!username || !name) {
            return new Response(JSON.stringify({ error: 'Username and name are required' }), { status: 400 });
        }

        let finalCategory = 'local';
        if (category === 'turista') finalCategory = 'turista';
        if (category === 'profesional') finalCategory = 'profesional';

        // Verificar disponibilidad de nuevo por si acaso
        const checkQuery = `SELECT id FROM users WHERE username = ? COLLATE NOCASE AND id != ?`;
        const existing = await env.DB.prepare(checkQuery).bind(username, user.id).first();
        if (existing) {
            return new Response(JSON.stringify({ error: 'Username already taken' }), { status: 409 });
        }

        const dmPrivacy = body.dmPrivacy || 'everyone';

        // Actualizar usuario
        const updateQuery = `
            UPDATE users 
            SET username = ?, name = ?, bio = ?, category = ?, dm_privacy = ?, is_profile_completed = 1 
            WHERE id = ?
        `;
        await env.DB.prepare(updateQuery).bind(username, name, bio || '', finalCategory, dmPrivacy, user.id).run();

        return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
