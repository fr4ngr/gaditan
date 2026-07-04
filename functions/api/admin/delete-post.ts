export async function onRequestDelete(context) {
    const { env, request } = context;
    const url = new URL(request.url);
    
    // 1. Verificación de Seguridad
    const secret = url.searchParams.get('secret');
    if (secret !== env.CRON_SECRET) {
        return new Response(JSON.stringify({ error: "No autorizado" }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const body = await request.json();
        const { id } = body;

        if (!id) {
            return new Response(JSON.stringify({ error: "ID del post requerido" }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const result = await env.DB.prepare(
            `DELETE FROM posts WHERE id = ?`
        ).bind(id).run();

        if (result.meta.changes === 0) {
            return new Response(JSON.stringify({ error: "Post no encontrado o ya eliminado" }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify({ success: true, message: "Post eliminado correctamente" }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e) {
        console.error("Delete post error:", e);
        return new Response(JSON.stringify({ error: e.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
