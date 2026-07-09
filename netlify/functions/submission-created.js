exports.handler = async (event) => {
  const url = process.env.PFWALK_WEBHOOK_URL;
  const secret = process.env.PFWALK_WEBHOOK_SECRET;
  if (!url || !secret) {
    console.error("[pfwalk-relay] not configured: set PFWALK_WEBHOOK_URL and PFWALK_WEBHOOK_SECRET");
    return { statusCode: 500, body: "relay not configured" };
  }
  let data;
  try {
    const submission = JSON.parse(event.body || "{}");
    data = (submission.payload && submission.payload.data) || submission.data || {};
  } catch (e) {
    console.error("[pfwalk-relay] could not parse submission body:", e && e.message);
    return { statusCode: 400, body: "bad submission body" };
  }
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${secret}` },
      body: JSON.stringify({ data }),
    });
    const text = await res.text();
    if (!res.ok) {
      console.error(`[pfwalk-relay] forward failed: HTTP ${res.status} — ${text}`);
      return { statusCode: 502, body: `forward failed: HTTP ${res.status}` };
    }
    console.log(`[pfwalk-relay] forwarded OK: ${text}`);
    return { statusCode: 200, body: "forwarded" };
  } catch (e) {
    console.error("[pfwalk-relay] network error forwarding to Pfwalk:", e && e.message);
    return { statusCode: 502, body: "forward error" };
  }
};
