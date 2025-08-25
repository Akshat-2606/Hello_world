import jwt from 'jsonwebtoken'; // Use a JWT library via bundler

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const cookie = request.headers.get('cookie');

    // --- Check if user is authenticated via cookie ---
    const token = cookie?.match(/token=([^;]+)/)?.[1];

    if (token) {
      try {
        // Verify JWT with your Auth0 public key
        const payload = jwt.verify(token, env.AUTH0_PUBLIC_KEY, {
          algorithms: ['RS256'],
          audience: env.AUTH0_CLIENT_ID,
          issuer: `https://${env.AUTH0_DOMAIN}/`
        });

        // Serve index.html if authenticated
        const html = await env.ASSETS.getText("index.html");
        return new Response(html, { headers: { "Content-Type": "text/html" } });

      } catch (e) {
        console.log('JWT invalid or expired', e);
      }
    }

    // --- Not authenticated, redirect to Auth0 login ---
    if (url.pathname !== '/callback') {
      const redirectUri = encodeURIComponent('https://your-worker.your-domain.workers.dev/callback');
      const authUrl = `https://${env.AUTH0_DOMAIN}/authorize?response_type=code&client_id=${env.AUTH0_CLIENT_ID}&redirect_uri=${redirectUri}&scope=openid profile email`;
      return Response.redirect(authUrl, 302);
    }

    // --- Handle callback ---
    if (url.pathname === '/callback') {
      const code = url.searchParams.get('code');
      if (!code) return new Response("No code", { status: 400 });

      // Exchange code for tokens via Auth0
      const tokenResp = await fetch(`https://${env.AUTH0_DOMAIN}/oauth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          client_id: env.AUTH0_CLIENT_ID,
          client_secret: env.AUTH0_CLIENT_SECRET,
          code: code,
          redirect_uri: 'https://your-worker.your-domain.workers.dev/callback'
        })
      });

      const data = await tokenResp.json();
      const idToken = data.id_token;

      // Set cookie and redirect to main page
      return new Response(null, {
        status: 302,
        headers: {
          'Set-Cookie': `token=${idToken}; HttpOnly; Secure; Path=/; Max-Age=3600`,
          'Location': '/'
        }
      });
    }

    return new Response("Something went wrong", { status: 400 });
  }
};
