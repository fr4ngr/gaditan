export async function onRequestGet(context) {
    const { env, request } = context;
    const url = new URL(request.url);
    const action = url.searchParams.get('action') || 'list';

    // Basic auth check
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || authHeader !== `Bearer ${env.ADMIN_PASSWORD}`) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        if (action === 'stats') {
            // Obtener estadísticas de registro
            const statsQuery = `
                SELECT 
                    COUNT(*) as total_users,
                    SUM(CASE WHEN date(created_at) = date('now') THEN 1 ELSE 0 END) as users_today,
                    SUM(CASE WHEN date(created_at) >= date('now', '-7 days') THEN 1 ELSE 0 END) as users_week,
                    SUM(CASE WHEN date(created_at) >= date('now', '-30 days') THEN 1 ELSE 0 END) as users_month
                FROM users
            `;
            const stats = await env.DB.prepare(statsQuery).first();
            
            // Si las columnas faltan en la DB local de dev, fallback
            const finalStats = stats || { total_users: 0, users_today: 0, users_week: 0, users_month: 0 };
            return new Response(JSON.stringify(finalStats), { status: 200, headers: { 'Content-Type': 'application/json' } });
            
        } else if (action === 'list') {
            // Listado de usuarios
            const listQuery = `
                SELECT 
                    u.id, u.email, u.name, u.username, u.is_profile_completed, 
                    u.status, u.banned_until, u.verified, u.created_at,
                    (SELECT COUNT(*) FROM bookmarks WHERE user_id = u.id) as bookmarks_count
                FROM users u
                ORDER BY u.created_at DESC
                LIMIT 100
            `;
            let users = [];
            try {
                const { results } = await env.DB.prepare(listQuery).all();
                users = results;
            } catch (e) {
                // Fallback si faltan columnas nuevas en DB dev local
                if (e.message.includes('no such column')) {
                    const fallbackQuery = `SELECT id, email, name, created_at, 'active' as status, 0 as verified, 0 as bookmarks_count FROM users ORDER BY created_at DESC LIMIT 100`;
                    const { results } = await env.DB.prepare(fallbackQuery).all();
                    users = results;
                } else {
                    throw e;
                }
            }
            return new Response(JSON.stringify(users), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }

        return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400 });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}

export async function onRequestPost(context) {
    const { env, request } = context;

    // Basic auth check
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || authHeader !== `Bearer ${env.ADMIN_PASSWORD}`) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const body = await request.json();
        const { userId, action, days } = body;

        if (!userId || !action) {
            return new Response(JSON.stringify({ error: 'Missing parameters' }), { status: 400 });
        }

        let updateQuery = "";
        let binds = [];

        if (action === 'ban') {
            let bannedUntil = null;
            if (days && days > 0) {
                const date = new Date();
                date.setDate(date.getDate() + days);
                bannedUntil = date.toISOString();
            }
            updateQuery = `UPDATE users SET status = 'banned', banned_until = ? WHERE id = ?`;
            binds = [bannedUntil, userId];
        } 
        else if (action === 'unban') {
            updateQuery = `UPDATE users SET status = 'active', banned_until = NULL WHERE id = ?`;
            binds = [userId];
        }
        else if (action === 'verify') {
            updateQuery = `UPDATE users SET verified = 1 WHERE id = ?`;
            binds = [userId];
        }
        else if (action === 'unverify') {
            updateQuery = `UPDATE users SET verified = 0 WHERE id = ?`;
            binds = [userId];
        } else {
            return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400 });
        }

        await env.DB.prepare(updateQuery).bind(...binds).run();
        
        // Si fue baneado, eliminar sus sesiones activas
        if (action === 'ban') {
            await env.DB.prepare(`DELETE FROM sessions WHERE user_id = ?`).bind(userId).run();
        }

        return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
