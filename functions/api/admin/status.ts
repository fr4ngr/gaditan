export async function onRequestGet(context) {
    const { env, request } = context;
    
    const authHeader = request.headers.get('Authorization');
    if (!env.ADMIN_PASSWORD || !authHeader || authHeader !== `Bearer ${env.ADMIN_PASSWORD}`) {
        return new Response(JSON.stringify({ error: "No autorizado." }), { status: 401 });
    }

    const status = {
        gemini: !!env.GEMINI_API_KEY,
        github: !!env.GITHUB_TOKEN,
        aemet: !!env.AEMET_API_KEY,
        deployHook: !!env.CLOUDFLARE_DEPLOY_HOOK,
        maps: !!env.MAPS_API_KEY,
        db: !!env.DB,
        whatsapp: !!env.WHATSAPP_API_KEY,
        adminPwd: !!env.ADMIN_PASSWORD
    };

    return new Response(JSON.stringify(status), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
}
