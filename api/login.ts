async function handler(request: Request) {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  let password = "";
  try {
    const body = await request.json();
    password = typeof body?.password === "string" ? body.password : "";
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Requête invalide." }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: "ADMIN_PASSWORD n'est pas configuré sur le serveur (variable d'environnement Vercel manquante).",
      }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }

  if (password === expected) {
    return new Response(JSON.stringify({ ok: true }), {
      headers: { "content-type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ ok: false, error: "Mot de passe incorrect." }), {
    status: 401,
    headers: { "content-type": "application/json" },
  });
}

export const GET = handler;
export const POST = handler;
