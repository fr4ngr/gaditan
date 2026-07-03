export async function onRequestGet(context) {
    const { env, request } = context;
    const url = new URL(request.url);
    
    const clientId = env.GOOGLE_CLIENT_ID;
    if (!clientId) {
        return new Response("Falta configurar GOOGLE_CLIENT_ID en el servidor", { status: 500 });
    }

    const redirectUri = `${url.origin}/api/auth/callback`;
    const scope = "email profile";
    
    // Opcional: Generar un parámetro state para prevenir CSRF
    const state = crypto.randomUUID();
    
    const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    googleAuthUrl.searchParams.set('client_id', clientId);
    googleAuthUrl.searchParams.set('redirect_uri', redirectUri);
    googleAuthUrl.searchParams.set('response_type', 'code');
    googleAuthUrl.searchParams.set('scope', scope);
    googleAuthUrl.searchParams.set('state', state);

    // Guardar el state temporalmente en una cookie para validarlo en el callback
    const cookie = `oauth_state=${state}; HttpOnly; Path=/; Max-Age=300; SameSite=Lax${url.hostname !== 'localhost' ? '; Secure' : ''}`;

    return new Response(null, {
        status: 302,
        headers: {
            'Location': googleAuthUrl.toString(),
            'Set-Cookie': cookie
        }
    });
}
