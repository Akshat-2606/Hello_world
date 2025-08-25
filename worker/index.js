export default {
    async fetch(request, env, ctx) {
      return new Response("Hello World from Worker!", { status: 200 });
    }
  };
  