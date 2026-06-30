export async function onRequestGet(context) {
    const { request, env } = context;

    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response('Unauthorized', { status: 401 });
    }
    const pwd = authHeader.split(' ')[1];
    if (pwd !== env.ADMIN_PASSWORD) {
        return new Response('Forbidden', { status: 403 });
    }

    if (!env.GEMINI_API_KEY) {
        return new Response(JSON.stringify({ error: "GEMINI_API_KEY is missing in environment variables." }), { status: 500 });
    }

    return new Response(JSON.stringify({ key: env.GEMINI_API_KEY }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
}
