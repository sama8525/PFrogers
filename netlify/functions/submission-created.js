// Netlify Function: one submission-created handler for BOTH forms on this site —
// the sign-request form and the donation form — branching on the form name.
//
// Netlify invokes a function named exactly "submission-created" whenever ANY form
// submission is stored, and a site can have only ONE such function. So a site with
// both a sign form and a donation form merges them here: donation submissions go to
// the Pfwalk donation-intent endpoint, everything else to the sign-request endpoint.
// The public forms keep posting to Netlify Forms as-is — no form change, no client JS.
// Both secrets stay server-to-server inside this function; never in public HTML.
//
// Deploy: place this file at  netlify/functions/submission-created.js  in the
// campaign's Netlify site repo, then set these environment variables on that site:
//   Sign form:
//     PFWALK_WEBHOOK_URL              e.g. https://pfwalk.city/api/webhooks/sign-request/<site>
//     PFWALK_WEBHOOK_SECRET           same value as the site's SIGN_WEBHOOK_SECRET_* in Vercel
//   Donation form:
//     PFWALK_DONATION_WEBHOOK_URL     e.g. https://pfwalk.city/api/webhooks/donation-intent/<site>
//     PFWALK_DONATION_WEBHOOK_SECRET  same value as the site's DONATION_WEBHOOK_SECRET_* in Vercel
// Requires Node 18+ on Netlify (global fetch) — the current Netlify default.

exports.handler = async (event) => {
  // The submission event body is JSON:
  //   { payload: { form_name: "...", data: { ...form fields } }, ... }
  let payload, data, formName;
  try {
    const submission = JSON.parse(event.body || "{}");
    payload = submission.payload || submission || {};
    data = (payload && payload.data) || submission.data || {};
    // Netlify puts the form name on payload.form_name; some setups only carry the
    // hidden "form-name" field in the data — accept either.
    formName = String(payload.form_name || data["form-name"] || data.form_name || "");
  } catch (e) {
    console.error("[pfwalk-relay] could not parse submission body:", e && e.message);
    return { statusCode: 400, body: "bad submission body" };
  }

  // Route by form name: anything that looks like a donation/contribution form goes
  // to the donation endpoint; everything else is treated as a sign request.
  const isDonation = /donat|contrib/i.test(formName);
  const label = isDonation ? "pfwalk-donation-relay" : "pfwalk-relay";
  const url = isDonation ? process.env.PFWALK_DONATION_WEBHOOK_URL : process.env.PFWALK_WEBHOOK_URL;
  const secret = isDonation ? process.env.PFWALK_DONATION_WEBHOOK_SECRET : process.env.PFWALK_WEBHOOK_SECRET;

  if (!url || !secret) {
    console.error(
      `[${label}] not configured for form "${formName}": set ${
        isDonation ? "PFWALK_DONATION_WEBHOOK_URL and PFWALK_DONATION_WEBHOOK_SECRET" : "PFWALK_WEBHOOK_URL and PFWALK_WEBHOOK_SECRET"
      } on this Netlify site`,
    );
    return { statusCode: 500, body: "relay not configured" };
  }

  // Send the secret as a ?secret= query param (survives redirects, never stripped
  // like an inbound Authorization header can be) PLUS a custom X-Webhook-Secret
  // header as a backup. Both are server-to-server inside this function.
  const target = url + (url.includes("?") ? "&" : "?") + "secret=" + encodeURIComponent(secret);

  try {
    const res = await fetch(target, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Webhook-Secret": secret },
      body: JSON.stringify({ data }),
    });
    const text = await res.text();
    if (!res.ok) {
      console.error(`[${label}] forward failed for form "${formName}": HTTP ${res.status} — ${text}`);
      return { statusCode: 502, body: `forward failed: HTTP ${res.status}` };
    }
    console.log(`[${label}] forwarded OK (form "${formName}"): ${text}`);
    return { statusCode: 200, body: "forwarded" };
  } catch (e) {
    console.error(`[${label}] network error forwarding to Pfwalk:`, e && e.message);
    return { statusCode: 502, body: "forward error" };
  }
};
