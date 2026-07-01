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

        const url = new URL(request.url);
        const monthFilter = url.searchParams.get('month');

        let whereClause = "";
        let params = [];
        if (monthFilter && /^\d{4}-\d{2}$/.test(monthFilter)) {
            whereClause = "WHERE timestamp LIKE ?";
            params = [`${monthFilter}%`];
        }

        // Obtener mensajes totales (o filtrados por mes)
        let stmtTotal = env.DB.prepare(`SELECT COUNT(*) as count FROM chat_logs ${whereClause}`);
        if (params.length > 0) stmtTotal = stmtTotal.bind(...params);
        const totalRowsReq = await stmtTotal.first();
        const totalMessages = totalRowsReq ? totalRowsReq.count : 0;

        // Obtener mensajes de las últimas 24 horas (ignorado si hay filtro de mes, o se podría mantener global)
        let stmtToday = env.DB.prepare("SELECT COUNT(*) as count FROM chat_logs WHERE timestamp >= datetime('now', '-1 day')");
        const todayRowsReq = await stmtToday.first();
        const todayMessages = todayRowsReq ? todayRowsReq.count : 0;

        // Obtener el Top 10 Categorías
        let stmtCategories = env.DB.prepare(`
            SELECT intent_category, COUNT(*) as count 
            FROM chat_logs 
            ${whereClause}
            GROUP BY intent_category 
            ORDER BY count DESC 
            LIMIT 10
        `);
        if (params.length > 0) stmtCategories = stmtCategories.bind(...params);
        const categoriesReq = await stmtCategories.all();
        const topCategories = categoriesReq.results || [];

        // Obtener métricas de A/B Testing
        let stmtAB = env.DB.prepare(`
            SELECT 
                ab_variant,
                COUNT(*) as total_requests,
                SUM(CASE WHEN input_type = 'click' THEN 1 ELSE 0 END) as total_clicks,
                AVG(tokens_used) as avg_tokens
            FROM chat_logs
            ${whereClause}
            GROUP BY ab_variant
        `);
        if (params.length > 0) stmtAB = stmtAB.bind(...params);
        const abMetricsReq = await stmtAB.all();
        const abMetrics = abMetricsReq.results || [];

        // Obtener últimos 50 mensajes para la lupa
        let stmtRecent = env.DB.prepare(`
            SELECT timestamp, user_message, intent_category, bot_response, latency_ms, tokens_used, brains_injected, input_type, ab_variant
            FROM chat_logs 
            ${whereClause}
            ORDER BY timestamp DESC 
            LIMIT 50
        `);
        if (params.length > 0) stmtRecent = stmtRecent.bind(...params);
        const recentMessagesReq = await stmtRecent.all();
        const recentMessages = recentMessagesReq.results || [];

        return new Response(JSON.stringify({ 
            success: true, 
            data: {
                totalMessages,
                todayMessages,
                topCategories,
                abMetrics,
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
