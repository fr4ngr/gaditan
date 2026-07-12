export async function onRequestGet(context) {
    const { env, params } = context;
    const pathSegments = params.path;
    
    if (!pathSegments) return new Response('Bad Request', { status: 400 });

    let id = Array.isArray(pathSegments) ? pathSegments.join('/') : pathSegments;

    try {
        id = decodeURIComponent(id);
        const object = await env.BUCKET.get(id);

        if (object === null) {
            return new Response('Not Found', { status: 404 });
        }

        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set('etag', object.httpEtag);
        // Cache control para imágenes (1 año cache público)
        headers.set('Cache-Control', 'public, max-age=31536000, immutable');
        
        const contentType = headers.get('content-type') || '';
        if (!contentType.startsWith('image/') && !contentType.startsWith('audio/') && !contentType.startsWith('video/')) {
            headers.set('Content-Disposition', 'attachment');
        } else {
            headers.set('Content-Disposition', 'inline');
            headers.set('Accept-Ranges', 'bytes');
        }

        return new Response(object.body, { headers });
    } catch (e) {
        console.error("Media fetch error:", e);
        return new Response('Internal Server Error', { status: 500 });
    }
}
