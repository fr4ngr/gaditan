export async function onRequestPost(context) {
    const { env, request } = context;
    
    try {
        const cookieHeader = request.headers.get('Cookie');
        if (!cookieHeader) return new Response('Unauthorized', { status: 401 });

        const match = cookieHeader.match(/auth_session=([^;]+)/);
        if (!match) return new Response('Unauthorized', { status: 401 });

        const sessionId = match[1];

        const session = await env.DB.prepare('SELECT user_id FROM sessions WHERE id = ? AND expires_at > CURRENT_TIMESTAMP').bind(sessionId).first();
        if (!session) return new Response('Unauthorized', { status: 401 });

        const userId = session.user_id;

        const formData = await request.formData();
        const receiverId = formData.get('receiverId');
        const content = formData.get('content') || '';
        const image = formData.get('image'); // File object
        const isViewOnce = formData.get('isViewOnce') === 'true' ? 1 : 0;

        if (!receiverId) return new Response('Missing receiverId', { status: 400 });
        if (!content && !image) return new Response('Content or image is required', { status: 400 });

        // Privacy Check
        const receiver = await env.DB.prepare('SELECT dm_privacy FROM users WHERE id = ?').bind(receiverId).first();
        if (!receiver) return new Response('User not found', { status: 404 });
        
        // Let's implement basic privacy rules: 'everyone' (default), 'nobody'
        if (receiver.dm_privacy === 'nobody') {
            return new Response(JSON.stringify({ error: 'Este usuario no acepta mensajes directos.' }), { status: 403 });
        }

        let imageUrl = null;

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
            const filename = `dms/${crypto.randomUUID()}.${extension}`;
            
            await env.BUCKET.put(filename, image.stream(), {
                httpMetadata: { contentType: image.type }
            });
            
            imageUrl = `/api/media/${encodeURIComponent(filename)}`;
        }

        const insertQuery = `
            INSERT INTO direct_messages (sender_id, receiver_id, content, image_url, is_view_once)
            VALUES (?, ?, ?, ?, ?)
        `;
        const result = await env.DB.prepare(insertQuery).bind(userId, receiverId, content, imageUrl, isViewOnce).run();

        return new Response(JSON.stringify({ success: true, messageId: result.lastRowId }), { status: 200, headers: { 'Content-Type': 'application/json' } });

    } catch (e) {
        console.error("DM send error:", e);
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
