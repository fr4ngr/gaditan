export async function onRequestGet(context) {
    try {
        const { env, request } = context;
        
        // Basic auth check
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || authHeader !== `Bearer ${env.ADMIN_PASSWORD}`) {
            return new Response('Unauthorized', { status: 401 });
        }

        if (!env.DB) {
            return new Response(JSON.stringify({ error: "No DB binding" }), { status: 400 });
        }

        // Obtener KPIs principales
        const totalRowsReq = await env.DB.prepare("SELECT COUNT(*) as count FROM chat_logs").first();
        const totalMessages = totalRowsReq ? totalRowsReq.count : 0;

        // Obtener mensajes de las últimas 24 horas
        const todayRowsReq = await env.DB.prepare("SELECT COUNT(*) as count FROM chat_logs WHERE timestamp >= datetime('now', '-1 day')").first();
        const todayMessages = todayRowsReq ? todayRowsReq.count : 0;

        // Obtener el Top 10 Categorías
        const categoriesReq = await env.DB.prepare(`
            SELECT intent_category, COUNT(*) as count 
            FROM chat_logs 
            GROUP BY intent_category 
            ORDER BY count DESC 
            LIMIT 10
        `).all();
        const topCategories = categoriesReq.results || [];

        // Obtener últimos 50 mensajes para la lupa
        const recentMessagesReq = await env.DB.prepare(`
            SELECT timestamp, user_message, intent_category, bot_response
            FROM chat_logs 
            ORDER BY timestamp DESC 
            LIMIT 50
        `).all();
        const recentMessages = recentMessagesReq.results || [];

        return new Response(JSON.stringify({ 
            success: true, 
            data: {
                totalMessages,
                todayMessages,
                topCategories,
                recentMessages
            }
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
