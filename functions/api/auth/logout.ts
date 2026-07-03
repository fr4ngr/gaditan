export async function onRequestPost(context) {
    const { env, request } = context;
    const url = new URL(request.url);
    
    try {
        const cookieHeader = request.headers.get('Cookie');
        if (cookieHeader) {
            const match = cookieHeader.match(/auth_session=([^;]+)/);
            if (match) {
                const sessionId = match[1];
                // Borrar sesión en la BD
                await env.DB.prepare('DELETE FROM sessions WHERE id = ?').bind(sessionId).run();
            }
        }
        
        // Limpiar cookie
        const isProd = url.hostname !== 'localhost';
        const cookie = `auth_session=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax${isProd ? '; Secure' : ''}`;

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Set-Cookie': cookie
            }
        });

    } catch (e) {
        console.error("Logout error:", e);
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
