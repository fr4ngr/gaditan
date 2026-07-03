export async function onRequestPost(context) {
    const { env, request } = context;
    
    try {
        // 1. Auth check
        const cookieHeader = request.headers.get('Cookie');
        if (!cookieHeader) return new Response('Unauthorized', { status: 401 });

        const match = cookieHeader.match(/auth_session=([^;]+)/);
        if (!match) return new Response('Unauthorized', { status: 401 });

        const sessionId = match[1];

        const userQuery = `SELECT user_id FROM sessions WHERE id = ? AND expires_at > CURRENT_TIMESTAMP`;
        const session = await env.DB.prepare(userQuery).bind(sessionId).first();
        if (!session) return new Response('Unauthorized', { status: 401 });

        // 2. Parse FormData
        const formData = await request.formData();
        const content = formData.get('content') || '';
        const image = formData.get('image'); // File object
        const lat = formData.get('lat') ? parseFloat(formData.get('lat')) : null;
        const lon = formData.get('lon') ? parseFloat(formData.get('lon')) : null;

        if (!content && !image) {
            return new Response('Content or image is required', { status: 400 });
        }

        const postId = crypto.randomUUID();
        let imageUrl = null;

        // 3. Upload to R2 if image exists
        if (image && image.name) {
            const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
            if (!allowedTypes.includes(image.type)) {
                return new Response(JSON.stringify({ error: 'Solo se permiten imágenes (JPG, PNG, WEBP)' }), { status: 400 });
            }
            if (image.size > 5 * 1024 * 1024) {
                return new Response(JSON.stringify({ error: 'La imagen supera los 5MB permitidos' }), { status: 400 });
            }

            const extMap = {
                'image/jpeg': 'jpg',
                'image/png': 'png',
                'image/webp': 'webp'
            };
            const extension = extMap[image.type];
            const filename = `posts/${postId}.${extension}`;
            
            await env.BUCKET.put(filename, image.stream(), {
                httpMetadata: { contentType: image.type }
            });
            
            // Generate the URL relative to our media proxy
            imageUrl = `/api/media/${filename.replace('/', '%2F')}`; 
            // Better to just store filename and proxy builds it
            imageUrl = `/api/media/${encodeURIComponent(filename)}`;
        }

        // 4. Save to D1
        const insertQuery = `
            INSERT INTO posts (id, user_id, content, image_url, lat, lon)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        await env.DB.prepare(insertQuery).bind(postId, session.user_id, content, imageUrl, lat, lon).run();

        return new Response(JSON.stringify({ success: true, id: postId }), { status: 200, headers: { 'Content-Type': 'application/json' } });

    } catch (e) {
        console.error("Post create error:", e);
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
