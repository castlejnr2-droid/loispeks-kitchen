import { getStore } from "@netlify/blobs";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Content-Type": "application/json",
};

export default async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS });
  }

  const url = new URL(req.url);
  const key = url.searchParams.get("key");

  if (!key) {
    return new Response(JSON.stringify({ error: "Missing key parameter" }), {
      status: 400,
      headers: CORS,
    });
  }

  try {
    const store = getStore("data");
    let raw;
    try {
      raw = await store.get(key, { type: "text" });
    } catch {
      raw = null;
    }

    const value = raw ? JSON.parse(raw) : null;
    return new Response(JSON.stringify({ value }), { status: 200, headers: CORS });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: CORS,
    });
  }
};

export const config = { path: "/.netlify/functions/getBlob" };
