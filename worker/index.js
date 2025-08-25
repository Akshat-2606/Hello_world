export default {
    async fetch(request, env, ctx) {
      const url = new URL(request.url);
  
      // --- Username-password mapping ---
      const users = {
        "Pratham": "EA168",
        "Azhar": "EA191",
        "Akshat": "T017",
        "dave": "dave321",
        "eve": "eve654",
        "frank": "frank987",
        "grace": "grace111",
        "heidi": "heidi222",
        "ivan": "ivan333",
        "judy": "judy444"
      };
  
      // Get submitted username and password
      const username = url.searchParams.get("username");
      const password = url.searchParams.get("password");
  
      // Check credentials
      const isCorrect = username && password && users[username] === password;
      const wrongAttempt = (username || password) && !isCorrect;
  
      // --- Show login form if no credentials or wrong credentials ---
      if (!isCorrect) {
        return new Response(`
          <html>
            <head>
              <title>EndureAir Wiki Login</title>
              <style>
                body {
                  margin: 0;
                  height: 100vh;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                  background: linear-gradient(135deg, #1e3c72, #2a5298);
                  color: #333;
                }
                .card {
                  background: #fff;
                  padding: 2rem;
                  border-radius: 1rem;
                  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
                  max-width: 450px;
                  text-align: center;
                  position: relative;
                }
                h2 { margin-bottom: 1rem; color: #2a5298; }
                input {
                  width: 80%;
                  padding: 0.6rem;
                  margin-bottom: 1rem;
                  border: 1px solid #ccc;
                  border-radius: 0.5rem;
                  font-size: 1rem;
                }
                button {
                  background: #2a5298;
                  color: #fff;
                  border: none;
                  padding: 0.6rem 1.2rem;
                  border-radius: 0.5rem;
                  cursor: pointer;
                  font-size: 1rem;
                  transition: background 0.3s;
                }
                button:hover { background: #1e3c72; }
                .warning {
                  margin-top: 1rem;
                  padding: 0.8rem;
                  border-radius: 0.5rem;
                  font-weight: bold;
                  animation: warningPulse 2s infinite;
                }
                @keyframes warningPulse {
                  0%   { background: #ff0000; color: white; }
                  25%  { background: #ff8800; color: black; }
                  50%  { background: #ffff00; color: black; }
                  75%  { background: #ff8800; color: black; }
                  100% { background: #ff0000; color: white; }
                }
              </style>
            </head>
            <body>
              <div class="card">
                <h2>EndureAir Wiki Login</h2>
                <form method="GET">
                  <input type="text" name="username" placeholder="Enter username" autocomplete="off" spellcheck="false" /><br>
                  <input type="password" name="password" placeholder="Enter password" autocomplete="off" spellcheck="false" /><br>
                  <button type="submit">Unlock</button>
                </form>
                ${wrongAttempt ? `<div class="warning"> Bombers approaching... Access Denied!</div>` : ""}
              </div>
            </body>
          </html>
        `, { headers: { "content-type": "text/html" } });
      }
  
      // --- If credentials are correct, serve index.html from helloworld folder ---
      try {
        const html = await env.ASSETS.getText("index.html"); // make sure index.html is in your ASSETS folder
        return new Response(html, { headers: { "Content-Type": "text/html" } });
      } catch (err) {
        return new Response("index.html not found", { status: 404 });
      }
    }
  };
  