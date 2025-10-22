// netlify/functions/proxy.js
import fetch from "node-fetch";

export async function handler(event, context) {
  const API_URL = "https://script.google.com/macros/s/AKfycbxPCh3ANaZAl_kc2StbF19scMAyKDzQZv2n746FvVGHTJk3urIltB3qn59HNEUY4_ZQ/exec";

  try {
    const url = `${API_URL}?${event.rawQuery || ""}`;
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`Upstream error ${res.status}`);
    }

    const data = await res.json();

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    };
  } catch (err) {
    console.error("Proxy Error:", err);
    return {
      statusCode: 502,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Proxy request failed", details: err.message }),
    };
  }
}
