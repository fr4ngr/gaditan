export async function onRequestGet(context) {
    const { env, request } = context;

    const url = new URL(request.url);
    const pwd = url.searchParams.get('pwd');

    if (!pwd || pwd !== env.ADMIN_PASSWORD) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        await env.DB.prepare('DELETE FROM users').run();
        await env.DB.prepare('DELETE FROM sessions').run();
        return new Response(JSON.stringify({ success: true, message: "Todos los usuarios y sesiones han sido borrados." }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
