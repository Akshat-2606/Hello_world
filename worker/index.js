import { jwtVerify } from 'jose';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const cookie = request.headers.get('cookie');
    const token = cookie?.match(/token=([^;]+)/)?.[1];

    if (token) {
      try {
        const { payload } = await jwtVerify(
          token,
          // Auth0 public key as Uint8Array or a CryptoKey
          await crypto.subtle.importKey(
            'jwk',
            JSON.parse(env.AUTH0_JWK), // your Auth0 JWKS key JSON
            { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
            false,
            ['verify']
          ),
          {
            issuer: `https://${env.AUTH0_DOMAIN}/`,
            audience: env.AUTH0_CLIENT_ID,
          }
        );

        // Serve index.html if authenticated
        const html = await env.ASSETS.getText("index.html");
        return new Response(html, { headers: { "Content-Type": "text/html" } });
      } catch (e) {
        console.log('JWT invalid or expired', e);
      }
    }

    // Redirect to Auth0 login if not authenticated
    const redirectUri = encodeURIComponent('https://your-worker.your-domain.workers.dev/callback');
    const authUrl = `https://${env.AUTH0_DOMAIN}/authorize?response_type=code&client_id=${env.AUTH0_CLIENT_ID}&redirect_uri=${redirectUri}&scope=openid profile email`;
    return Response.redirect(authUrl, 302);
  }
};
