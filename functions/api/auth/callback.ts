export async function onRequestGet(context) {
    const { env, request } = context;
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    if (error || !code) {
        return Response.redirect(`${url.origin}/?error=auth_failed`);
    }

    // Opcional: Validar el state con la cookie
    // Para simplicidad en este MVP, pasaremos directo al token, pero en producción deberíamos validarlo.

    const clientId = env.GOOGLE_CLIENT_ID;
    const clientSecret = env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${url.origin}/api/auth/callback`;

    try {
        // 1. Obtener Access Token
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code',
            }).toString()
        });

        const tokenData = await tokenResponse.json();

        if (tokenData.error) {
            throw new Error(tokenData.error_description || 'Error getting token');
        }

        // 2. Obtener Perfil del Usuario
        const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: {
                'Authorization': `Bearer ${tokenData.access_token}`
            }
        });
        
        const userData = await userResponse.json();

        if (!userData.id) {
            throw new Error('Failed to get user info');
        }

        const userId = userData.id;
        const email = userData.email;
        const name = userData.name || userData.given_name || 'Usuario';
        const avatarUrl = userData.picture || '';

        // 3. Crear o Actualizar Usuario en D1
        // UPSERT is available in SQLite: INSERT ... ON CONFLICT DO UPDATE
        const upsertUserQuery = `
            INSERT INTO users (id, email, name, avatar_url) 
            VALUES (?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET 
                name = excluded.name, 
                avatar_url = excluded.avatar_url;
        `;
        
        await env.DB.prepare(upsertUserQuery).bind(userId, email, name, avatarUrl).run();

        // 4. Crear Sesión en D1
        const sessionId = crypto.randomUUID();
        // Expira en 30 días
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        
        const insertSessionQuery = `
            INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?);
        `;
        await env.DB.prepare(insertSessionQuery).bind(sessionId, userId, expiresAt).run();

        // 5. Establecer la cookie de sesión
        const isProd = url.hostname !== 'localhost';
        const cookie = `auth_session=${sessionId}; HttpOnly; Path=/; Max-Age=${30 * 24 * 60 * 60}; SameSite=Lax${isProd ? '; Secure' : ''}`;

        return new Response(null, {
            status: 302,
            headers: {
                'Location': `${url.origin}/?login=success`,
                'Set-Cookie': cookie
            }
        });

    } catch (e) {
        console.error("OAuth Error:", e);
        return Response.redirect(`${url.origin}/?error=auth_exception`);
    }
}
