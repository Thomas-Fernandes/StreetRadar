# Runbook — a provider asks us to stop, or someone is mirroring the tiles

Two separate situations. The first is urgent and fully automated. The second is
housekeeping that should be done once, in advance.

---

## 1. A provider asks us to stop

Expected form: a polite email, or a GitHub DMCA notice. Not a lawsuit — across
all 21,668 GitHub DMCA notices from 2013 to 2026 there is not one from Google,
Apple, Microsoft, Mapbox, HERE or TomTom about map scraping. Yandex is the
outlier that has acted before, via an automated brand-monitoring contractor.

**Do this first, before replying.** It takes about a minute and makes the reply
easy to write.

1.  In Vercel → Project → Settings → Environment Variables, set

        NEXT_PUBLIC_DISABLED_PROVIDERS = ja

    Comma-separated for several: `ja,naver`. Valid ids are exactly the `id`
    values in `src/lib/site.ts`: `google`, `apple`, `bing`, `yandex`, `naver`,
    `ja`.

2.  Redeploy (Vercel → Deployments → ⋯ → Redeploy). The variable is inlined into
    the client bundle at build time, so a redeploy is required — restarting is
    not enough.

3.  Confirm. The provider must be gone from all of these:

        curl -s https://streetradar.app/map | grep -c 'Já'          # expect 0
        curl -s https://streetradar.app/     | grep -c 'Já'          # expect 0

    And in a browser on `/map`, the layer control should no longer list it.

What the switch covers, verified in a browser both ways:

- the layer control, and the layer component is not mounted at all — so not one
  tile request can originate from the site
- the click-detection query, filtered separately rather than trusting the layer
  state
- the URL hash: an old shared permalink naming the provider has it stripped, so
  it cannot be switched back on
- the home page and `/map` provider lists
- the meta description, Open Graph card and JSON-LD — the strings that search
  engines and social platforms cache, and therefore outlive the deploy

4. Only then, stop the collector. Nothing in `streetradar-data-engine` runs on a
   schedule, so there is no job to cancel — just do not run
   `scripts/<provider>/collect_data.py` again.

5. The stored data is a separate decision from serving it. Disabling the
   provider stops the site requesting the tiles, but the PMTiles file stays on
   R2 and remains publicly downloadable at
   `https://tiles.streetradar.app/<name>.pmtiles`. If the request was to remove
   the data, delete the object from the bucket too, or §2 below will not be
   enough.

---

## 2. Restricting the public tile download

Current state, measured 2026-08-10:

| File                    | Size            | Last modified |
| ----------------------- | --------------- | ------------- |
| `tiles.pmtiles` (Apple) | 6,221,493,285 B | 2025-06-28    |
| `naver.pmtiles`         | 9,252,567,760 B | 2025-09-16    |
| `ja360.pmtiles`         | 884,115,233 B   | 2025-09-14    |
| **total**               | **16.36 GB**    |               |

`tiles.streetradar.app` is an R2 custom domain with no protection whatsoever:

- an anonymous range request with no `Referer` returns `206`
- any `Referer` value is accepted
- **the CORS policy is `access-control-allow-origin: *`**, so any website can
  embed these tiles in a visitor's browser

None of this can be fixed from the codebase — the map has to be able to fetch
the tiles, so every real control is edge or bucket configuration. The three
below are ranked by how much they actually accomplish.

### 2a. Tighten the R2 CORS policy — do this one

R2 → the bucket behind `tiles.streetradar.app` → Settings → CORS policy:

```json
[
    {
        "AllowedOrigins": ["https://streetradar.app"],
        "AllowedMethods": ["GET", "HEAD"],
        "AllowedHeaders": ["range"],
        "ExposeHeaders": ["Content-Range", "Content-Length", "ETag"],
        "MaxAgeSeconds": 3600
    }
]
```

This is the only control in this list that is genuinely enforced rather than
advisory: the _browser_ refuses to hand the response to a page from another
origin. It stops third-party sites building on our bandwidth. It does not stop
`curl`, and it is not meant to.

Check afterwards that the map still works — `MaxAgeSeconds` means a stale
preflight can be cached for an hour, so test in a fresh private window.

### 2b. Turn off the R2 public development URL

R2 → bucket → Settings → Public Development URL must be **disabled**. If a
`pub-<hash>.r2.dev` URL is live, it bypasses the custom domain entirely and
every rule below is decorative. Worth checking even though nothing references
it — it is a one-click setting that is easy to have left on.

### 2c. Rate-limit the tile host

A WAF rate-limiting rule on `tiles.streetradar.app`. This is the control that
cannot be defeated by forging a header, and it maps onto the actual harm, which
is someone pulling 16 GB rather than someone looking at a map.

The two cases separate cleanly. A real map session issues on the order of
**26 range requests for a few hundred kilobytes**, measured. A mirror pulls
gigabytes. So a per-IP ceiling well above the first and far below the second
costs legitimate visitors nothing.

Expression: `http.host eq "tiles.streetradar.app"`, counting requests per IP,
action _Block_. Pick a threshold from the numbers above rather than from a
default.

### What not to bother with

A WAF rule matching on `Referer` or `Origin`. It reads as protection but is one
`-H` flag away from useless, and it breaks the moment a browser omits the header
for a legitimate reason. If you want it anyway, do it _in addition to_ 2c, never
instead of it.

### Access needed

None of the above can be applied with the Cloudflare OAuth token wrangler
currently holds — it grants `zone (read)`, and these need bucket-level R2 write
plus zone rules edit. Either do it in the dashboard, or issue an API token with
**R2: Edit** and **Zone → Rules: Edit** scoped to this zone.

---

## 3. Also outstanding

`www.streetradar.app` returns **HTTP 526**. There is no `www` DNS record in the
zone, so it resolves through a wildcard, reaches Vercel, which holds no
certificate for that name, and Cloudflare in Full (strict) rejects it. Fix by
adding `www.streetradar.app` as a domain in the Vercel project — Vercel issues
the certificate and can redirect it to the apex.
