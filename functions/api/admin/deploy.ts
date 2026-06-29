export async function onRequestPost(context) {
    try {
        const { env, request } = context;
        const authHeader = request.headers.get('Authorization');
        
        if (!env.ADMIN_PASSWORD || !authHeader || authHeader !== `Bearer ${env.ADMIN_PASSWORD}`) {
            return new Response(JSON.stringify({ error: "No autorizado." }), { status: 401 });
        }
        
        if (!env.CLOUDFLARE_DEPLOY_HOOK) {
            return new Response(JSON.stringify({ error: "La variable CLOUDFLARE_DEPLOY_HOOK no está configurada." }), { status: 400 });
        }

        const res = await fetch(env.CLOUDFLARE_DEPLOY_HOOK, { method: 'POST' });
        
        if (!res.ok) {
            throw new Error(`Error al invocar webhook: ${await res.text()}`);
        }

        return new Response(JSON.stringify({ message: "Despliegue iniciado correctamente." }), { status: 200, headers: { 'Content-Type': 'application/json' }});
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
