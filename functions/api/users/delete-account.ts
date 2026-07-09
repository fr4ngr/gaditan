export async function onRequestDelete(context) {
    const { env, request } = context;

    try {
        const cookieHeader = request.headers.get('Cookie');
        if (!cookieHeader) return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
        
        const match = cookieHeader.match(/auth_session=([^;]+)/);
        if (!match) return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
        
        const sessionId = match[1];

        // 1. Verificar el usuario mediante su sesión
        const userQuery = `SELECT u.id, u.picture FROM users u JOIN sessions s ON u.id = s.user_id WHERE s.id = ? AND s.expires_at > CURRENT_TIMESTAMP`;
        const user = await env.DB.prepare(userQuery).bind(sessionId).first();
        
        if (!user) {
            return new Response(JSON.stringify({ error: 'Sesión inválida o expirada' }), { status: 401 });
        }

        // 2. Si el usuario tiene una foto en R2, la eliminamos
        if (user.picture && user.picture.includes('pub-6c07857bd6884603a3cf0fa1898b6369.r2.dev')) {
            try {
                const oldKey = user.picture.split('/').pop();
                if (oldKey) await env.AVATAR_BUCKET.delete(oldKey);
            } catch (e) {
                console.error("Error deleting avatar from R2 during account deletion:", e);
                // We don't throw here to ensure the account is deleted even if R2 fails
            }
        }

        // 3. Eliminar el usuario de la base de datos
        // Borramos primero dependencias para evitar violaciones de clave foránea si PRAGMA foreign_keys = ON
        // o para asegurar limpieza manual si está OFF
        await env.DB.batch([
            env.DB.prepare(`DELETE FROM sessions WHERE user_id = ?`).bind(user.id),
            // Eliminar favoritos (asumiendo que existe la tabla, que debería, pero por si acaso)
            // env.DB.prepare(`DELETE FROM user_favorites WHERE user_id = ?`).bind(user.id),
            env.DB.prepare(`DELETE FROM users WHERE id = ?`).bind(user.id)
        ]);

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                // Invalidamos la cookie de sesión en el navegador
                'Set-Cookie': 'auth_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0'
            }
        });

    } catch (e) {
        console.error("Delete account error:", e);
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
