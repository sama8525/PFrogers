# Mr. Rogers for Pflugerville City Council — Place 6

A clean, fast, mobile-friendly campaign website with a homemade, front-porch feel.
No WordPress, no plugins, no monthly hosting bill — just files that GitHub serves for free.

---

## What's in here

```
index.html         Home
about.html         About Mr. Rogers
record.html        Record & Plan
pflugerville.html  Our Pflugerville (city history & people)
updates.html       Blog / updates listing
post-welcome.html  A sample blog post (copy it to make new ones)
volunteer.html     Volunteer signup
yard-sign.html     Request a yard sign (yard / 4x4 / 4x8)
donate.html        Donate
contact.html       Contact
404.html           Friendly "page not found"
CNAME              Tells GitHub the custom domain
assets/css/styles.css   All the styling (change colors here)
assets/js/include.js    Shared header/footer + menu (change nav, email, socials here)
assets/img/             Put images here (see its README for licensing!)
```

---

## Preview it on your computer (optional)

You don't need anything fancy. Either:
- Double-click `index.html` to open it in a browser, **or**
- For the menu/footer to load correctly, run a tiny local server: open a terminal in
  this folder and run `python3 -m http.server`, then visit `http://localhost:8000`.

---

## Put it online (GitHub Pages — free)

1. Create a GitHub account and a new repository (e.g. `rogers-campaign`).
2. Upload all these files to the repo (drag-and-drop works on github.com).
3. In the repo, go to **Settings → Pages**.
4. Under "Build and deployment," set **Source = Deploy from a branch**, branch `main`, folder `/ (root)`. Save.
5. Wait a minute, then your site is live at `https://YOURNAME.github.io/rogers-campaign/`.

### Connect the domain (electmisterrogers.com)
1. The `CNAME` file already names the domain. In **Settings → Pages → Custom domain**, confirm `electmisterrogers.com` is listed.
2. At your domain registrar (where the domain is managed), add these DNS records:
   - Four **A** records for the root domain pointing to GitHub's IPs:
     `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - One **CNAME** record for `www` pointing to `YOURNAME.github.io`
3. Back in GitHub Pages settings, check **Enforce HTTPS** once it's available (can take up to a day).

> DNS changes can take a few hours to take effect. That's normal.

---

## Setup checklist — connect the moving parts

The site is built, but a few things need YOUR accounts (a website legally and technically
can't do these by itself). Each spot is marked in the files with a **yellow setup note**.

- [ ] **Donations — most important.** Create a campaign-compliant processor account
      (Anedot is great for local Texas races; ActBlue/WinRed are alternatives). It collects the
      donor name/address/employer/occupation the Texas Ethics Commission requires and deposits to
      the campaign account. Paste its embed code into `donate.html` (replace the gray box) **or**
      point the buttons to your donation page URL.
- [ ] **Forms (volunteer, yard sign, contact).** These are wired for **Netlify Forms** — no
      account keys to paste. Deploy the site on Netlify, then turn on **form detection**
      (Site configuration → Forms) and redeploy. Submissions show up in your dashboard under
      **Forms**; add an email/Slack notification there to get pinged.
- [ ] **Logo & photos.** Download David's logo/photos into `assets/img/` and update the `src`
      attributes + `SITE.logo` in `include.js`. See `assets/img/README.md` for safe image sources.
- [ ] **Brand colors.** Open `assets/css/styles.css`, top section. Confirm the red/gold/green
      against David's real signs and logo, and adjust the hex values if needed.
- [ ] **Contact email, treasurer, socials.** Edit the `SITE` object at the top of `include.js`.
- [ ] **Mailing address.** Fill in the check-by-mail address on `donate.html`.

---

## Before you launch (cleanup)

- [ ] Delete every **yellow "setup note"** box once you've handled it (search the files for `setup-note`).
- [ ] Replace the **placeholder text in brackets** `[like this]` — especially on `record.html`
      (the "plan ahead" cards) and `post-welcome.html` — with David's own words. **Don't leave
      invented specifics in his name.**
- [ ] **Verify the numbers.** The big figures ($300M saved, $350M tax hike defeated, 42% exemption
      increase, etc.) come straight from the current site and are presented as David's stated record.
      Confirm they're accurate and, where possible, note a source before relaunch.
- [ ] Fill the **photo placeholders** on `pflugerville.html` and elsewhere with properly licensed images.

---

## A couple of honest notes

- **City history & a sensitive fact.** The Pflugerville history is summarized from public sources
  (Texas State Historical Association, the 1976 state historical marker, Wikipedia, the Pfluger
  family site). One detail worth a deliberate decision: historical records note that the founding
  Pfluger family enslaved several people. The page does not mention this (it focuses on the
  community's growth), but that's an editorial choice you should make on purpose rather than by
  accident — leaving it as-is is fine, just know it's there if anyone raises it.
- **Tone.** Everything is positive and about David and Pflugerville — no opponents mentioned, by design.

---

## Adding blog posts later

Copy `post-welcome.html`, rename it, edit the text, then add a matching card on `updates.html`
pointing to the new file. Full steps are in the yellow note on `updates.html`. If you'd rather have
a point-and-click editor, a free static CMS like Decap CMS can be added later.
