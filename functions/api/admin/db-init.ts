export async function onRequestPost(context) {
    try {
        const { env, request } = context;
        
        // Basic auth check
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || authHeader !== `Bearer ${env.ADMIN_PASSWORD}`) {
            return new Response('Unauthorized', { status: 401 });
        }

        if (!env.DB) {
            return new Response(JSON.stringify({ error: "La base de datos D1 no está configurada (Falta el binding 'DB')." }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Crear la tabla si no existe
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS chat_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                user_message TEXT,
                bot_response TEXT,
                intent_category TEXT,
                latency_ms INTEGER,
                tokens_used INTEGER,
                brains_injected TEXT,
                input_type TEXT DEFAULT 'typed',
                ab_variant TEXT DEFAULT 'A'
            );
        `;
        await env.DB.prepare(createTableQuery).run();

        const createSocialTablesQuery = `
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                name TEXT,
                avatar_url TEXT,
                bio TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS sessions (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                expires_at DATETIME NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS posts (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                content TEXT,
                image_url TEXT,
                lat REAL,
                lon REAL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS bookmarks (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                content TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
        `;
        // Split and execute multiple queries because D1 might not support multi-statement execution via prepare().run()
        const statements = createSocialTablesQuery.split(';').map(s => s.trim()).filter(s => s.length > 0);
        for (const stmt of statements) {
            await env.DB.prepare(stmt).run();
        }

        // Intentar añadir las nuevas columnas para observabilidad (ignorará errores si ya existen)
        const alterQueries = [
            "ALTER TABLE chat_logs ADD COLUMN latency_ms INTEGER;",
            "ALTER TABLE chat_logs ADD COLUMN tokens_used INTEGER;",
            "ALTER TABLE chat_logs ADD COLUMN brains_injected TEXT;",
            "ALTER TABLE chat_logs ADD COLUMN input_type TEXT DEFAULT 'typed';",
            "ALTER TABLE chat_logs ADD COLUMN ab_variant TEXT DEFAULT 'A';"
        ];

        for (const query of alterQueries) {
            try {
                await env.DB.prepare(query).run();
            } catch (e) {
                // Column probably already exists, ignore
            }
        }

        return new Response(JSON.stringify({ success: true, message: "Tabla chat_logs creada o verificada correctamente." }), {
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
