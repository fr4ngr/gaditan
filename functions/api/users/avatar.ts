export async function onRequestPost(context) {
    const { env, request } = context;
    
    try {
        // Verificar sesión
        const cookieHeader = request.headers.get('Cookie');
        if (!cookieHeader) return new Response('Unauthorized', { status: 401 });
        const match = cookieHeader.match(/auth_session=([^;]+)/);
        if (!match) return new Response('Unauthorized', { status: 401 });
        const sessionId = match[1];

        // Obtener usuario actual y su foto anterior
        const userQuery = `SELECT u.id, u.picture FROM users u JOIN sessions s ON u.id = s.user_id WHERE s.id = ? AND s.expires_at > CURRENT_TIMESTAMP`;
        const user = await env.DB.prepare(userQuery).bind(sessionId).first();
        if (!user) return new Response('Unauthorized', { status: 401 });

        const buffer = await request.arrayBuffer();
        if (!buffer || buffer.byteLength === 0) {
            return new Response('No image provided', { status: 400 });
        }

        // Si ya tenía un avatar nuestro, lo borramos de R2 para no acumular basura
        if (user.picture && user.picture.includes('pub-6c07857bd6884603a3cf0fa1898b6369.r2.dev')) {
            try {
                const oldKey = user.picture.split('/').pop();
                if (oldKey) await env.AVATAR_BUCKET.delete(oldKey);
            } catch (e) {
                console.error("Error deleting old avatar:", e);
            }
        }

        const key = `avatar_${user.id}_${Date.now()}.webp`;
        
        await env.AVATAR_BUCKET.put(key, buffer, {
            httpMetadata: { contentType: "image/webp" }
        });

        const publicUrl = `https://pub-6c07857bd6884603a3cf0fa1898b6369.r2.dev/${key}`;

        await env.DB.prepare(`UPDATE users SET picture = ? WHERE id = ?`).bind(publicUrl, user.id).run();

        return new Response(JSON.stringify({ success: true, url: publicUrl }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (e) {
        console.error("Avatar upload error:", e);
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
