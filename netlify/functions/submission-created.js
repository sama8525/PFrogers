// Netlify Function: one submission-created handler for every form on this site —
// sign-request, volunteer signup, and donation — branching on the form name.
//
// Netlify invokes a function named exactly "submission-created" whenever ANY form
// submission is stored, and a site can have only ONE such function. So a site with
// multiple forms merges them here: donation submissions go to the Pfwalk
// donation-intent endpoint, the volunteer form goes to the Pfwalk volunteer/contact-
// signup endpoint, and everything else (the sign-request form) goes to the
// sign-request endpoint. The public forms keep posting to Netlify Forms as-is — no
// form change, no client JS. All secrets stay server-to-server inside this function;
// never in public HTML.
//
// FIX (2026-09-14): this function previously had no volunteer branch at all, so a
// "volunteer" form submission fell through to the sign-request endpoint's "else"
// case, which rejects it (no street address / sign type in the payload) — the
// submission never reached the volunteer intake pipeline in Pfwalk. Confirmed live:
// webhook_intake_failures had no rows at all for this site's volunteer submissions,
// meaning they were never even reaching Pfwalk under any endpoint.
//
// Deploy: place this file at  netlify/functions/submission-created.js  in the
// campaign's Netlify site repo, then set these environment variables on that site:
//   Sign form:
//     PFWALK_WEBHOOK_URL                e.g. https://pfwalk.city/api/webhooks/sign-request/<site>
//     PFWALK_WEBHOOK_SECRET             same value as the site's SIGN_WEBHOOK_SECRET_* in Vercel
//   Volunteer form:
//     PFWALK_VOLUNTEER_WEBHOOK_URL      e.g. https://pfwalk.city/api/webhooks/volunteer/<site>
//     PFWALK_VOLUNTEER_WEBHOOK_SECRET   same value as the site's VOLUNTEER_WEBHOOK_SECRET_* in Vercel
//   Donation form:
//     PFWALK_DONATION_WEBHOOK_URL       e.g. https://pfwalk.city/api/webhooks/donation-intent/<site>
//     PFWALK_DONATION_WEBHOOK_SECRET    same value as the site's DONATION_WEBHOOK_SECRET_* in Vercel
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

  // Route by form name: donation/contribution forms go to the donation endpoint,
  // the volunteer form goes to the volunteer endpoint, everything else (the
  // sign-request form) goes to the sign-request endpoint.
  const isDonation = /donat|contrib/i.test(formName);
  const isVolunteer = !isDonation && /volunteer/i.test(formName);
  const label = isDonation ? "pfwalk-donation-relay" : isVolunteer ? "pfwalk-volunteer-relay" : "pfwalk-relay";
  const url = isDonation
    ? process.env.PFWALK_DONATION_WEBHOOK_URL
    : isVolunteer
      ? process.env.PFWALK_VOLUNTEER_WEBHOOK_URL
      : process.env.PFWALK_WEBHOOK_URL;
  const secret = isDonation
    ? process.env.PFWALK_DONATION_WEBHOOK_SECRET
    : isVolunteer
      ? process.env.PFWALK_VOLUNTEER_WEBHOOK_SECRET
      : process.env.PFWALK_WEBHOOK_SECRET;

  if (!url || !secret) {
    const missing = isDonation
      ? "PFWALK_DONATION_WEBHOOK_URL and PFWALK_DONATION_WEBHOOK_SECRET"
      : isVolunteer
        ? "PFWALK_VOLUNTEER_WEBHOOK_URL and PFWALK_VOLUNTEER_WEBHOOK_SECRET"
        : "PFWALK_WEBHOOK_URL and PFWALK_WEBHOOK_SECRET";
    console.error(`[${label}] not configured for form "${formName}": set ${missing} on this Netlify site`);
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
