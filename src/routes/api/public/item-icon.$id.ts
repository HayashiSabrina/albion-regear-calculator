import { createFileRoute } from "@tanstack/react-router";

/**
 * Proxy same-origin para os ícones oficiais (render.albiononline.com).
 * O servidor de imagens do Albion não envia Access-Control-Allow-Origin, então
 * o html-to-image não consegue embutir os ícones na exportação PNG diretamente.
 * Somente leitura, aceita apenas Item IDs válidos e não expõe dados de usuário.
 */
const ITEM_ID = /^[A-Za-z0-9_@]{2,80}$/;

export const Route = createFileRoute("/api/public/item-icon/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const id = params.id.replace(/\.png$/i, "");
        if (!ITEM_ID.test(id)) return new Response("Invalid item id", { status: 400 });

        const upstream = await fetch(
          `https://render.albiononline.com/v1/item/${encodeURIComponent(id)}.png?size=64`,
        );
        if (!upstream.ok) return new Response("Not found", { status: upstream.status === 404 ? 404 : 502 });

        return new Response(upstream.body, {
          headers: {
            "Content-Type": upstream.headers.get("content-type") ?? "image/png",
            "Cache-Control": "public, max-age=86400",
            "Access-Control-Allow-Origin": "*",
          },
        });
      },
    },
  },
});
