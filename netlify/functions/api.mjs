import { getStore } from "@netlify/blobs";

export default async (req, context) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };

  if (req.method === "OPTIONS") return new Response("", { headers });

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");
    const key = url.searchParams.get("key");
    const store = getStore("data");

    if (action === "get" && key) {
      let raw = null;
      try { raw = await store.get(key, { type: "text" }); } catch {}
      const value = raw ? JSON.parse(raw) : null;
      return new Response(JSON.stringify({ value }), { headers });
    }

    if (action === "put" && req.method === "POST") {
      const body = await req.json();
      if (!body.key) return new Response(JSON.stringify({ error: "Missing key" }), { status: 400, headers });
      await store.set(body.key, JSON.stringify(body.value));
      return new Response(JSON.stringify({ success: true }), { headers });
    }

    if (action === "delete" && key) {
      await store.delete(key);
      return new Response(JSON.stringify({ success: true }), { headers });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), { status: 400, headers });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
};
