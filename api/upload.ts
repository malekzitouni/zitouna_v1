import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";

async function handler(request: Request) {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        let password = "";
        try {
          password = clientPayload ? (JSON.parse(clientPayload).password ?? "") : "";
        } catch {
          password = "";
        }

        const expected = process.env.ADMIN_PASSWORD;
        if (!expected || password !== expected) {
          throw new Error("Non autorisé : mot de passe administrateur invalide.");
        }

        return {
          allowedContentTypes: [
            "application/pdf",
            "video/mp4",
            "video/webm",
            "video/ogg",
            "video/quicktime",
          ],
          addRandomSuffix: true,
          maximumSizeInBytes: 100 * 1024 * 1024, // 100 Mo
          tokenPayload: clientPayload,
        };
      },
      onUploadCompleted: async () => {
        // Rien à faire ici : le client enregistre explicitement la ressource
        // via POST /api/content juste après la fin de l'upload.
      },
    });

    return new Response(JSON.stringify(jsonResponse), {
      headers: { "content-type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }
}

export const GET = handler;
export const POST = handler;
