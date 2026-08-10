# StreetRadar — consolidated research findings

Synthesised 2026-08-10 from 29 research agents (~460k characters of conclusions).
Raw transcripts: `~/.claude/projects/-home-nnb-StreetRadar/40f71d28-*/subagents/agent-*.jsonl`
(these get pruned — this file is the durable record).

Two agents returned nothing usable (`ae42b5bffc92640c3` geospatial newsletters,
`afc0e7d986f55f492` community-led growth). Those questions are unanswered.

**Binding constraint, set by the owner 2026-08-10:** this is a side project and a
showcase. Not trying to get rich. €10/month is acceptable. Must not be illegal.
Every recommendation below is re-scored against that, not against growth.

---

## Decision A — Is there a business here? No. Unanimous across five agents.

| Route | Finding | Source |
|---|---|---|
| Paid API / dataset sale | No identified buyer. No street-level coverage dataset is sold anywhere, by anyone, at any price. 17 months live, zero inbound commercial enquiry. | SaaS strategist |
| €1,000 MRR | Needs ~20,000 visitors/month — **40× current traffic** | SaaS strategist |
| Display ads | **€0.50–1.00/month.** Raptive floor 25,000 pv/mo; Mediavine Journey floor 1,000 sessions (site is at ~half); AdSense payout threshold €70 would take years | Ad monetization |
| Affiliate | **GeoGuessr has no affiliate program at all** (`/affiliate` 404, `/partners` 404, zero ToS mentions). Referral pays subscription credit and requires you to already be a paying subscriber. Creator program is cosmetics-only, gated at 1,000 followers. Realistic: **€0–5/month** | Affiliate research |
| Advertiser demand | **CPC $0.00** across essentially the entire keyword cluster | SEO strategist |
| Ad-blocking | ~**50%** on this specific audience (Plausible measured 58.67% on HN/Reddit traffic; 68.2% desktop; Linux 82.3%). Acceptable Ads would recover half of that — taking €0.65/mo to €1.00/mo | Ad-block research |

Structural note worth keeping: the entire GeoGuessr-alternative ecosystem competes
*on being free* (Plonk It explicitly: "we don't use ads or charge for any of our
features"). A category whose value proposition is not-paying has nothing to pay an
affiliate out of. Not a temporary gap — the category's economics.

**Calibration for the donation route:** OpenFreeMap serves 3bn requests/day at peak
and displaces ~$6M/month of commercial tiles. Its donations converged to exactly
$500/month against $500/month of infrastructure. **Net personal income $0.**
Donations asymptote to costs, never above them.

→ **Decision: closed.** Matches the owner's own position. The research's value here
is confirming that monetising would be both worthless *and* actively harmful —
see Decision F.

---

## Decision B — The one technical fix. Do it first.

Found independently by the SEO agent and confirmed in production:

```
/           → <link rel="canonical" href="https://streetradar.app"/>
/map        → <link rel="canonical" href="https://streetradar.app"/>   ← wrong
/analytics  → <link rel="canonical" href="https://streetradar.app"/>   ← wrong
```

`alternates: { canonical: '/' }` on the root layout propagates to every child that
doesn't override it. Google treats `rel=canonical` as near-binding consolidation,
so `/map` and `/analytics` are folded into `/`. **Google has one eligible URL for
the whole site.** Bing treats it as a hint and keeps indexing — which is exactly
the 0% Google / 18.5% Bing split that was measured.

Second cause, equally decisive — measured visible word counts from raw HTML:

| URL | Visible words | H1 | JSON-LD |
|---|---|---|---|
| `/` | ~90 | brand only, zero keywords | 0 |
| `/map` | **6** — literally `Loading map...` | **none** | 0 |
| `/analytics` | 109, mostly nav chrome + "Coming Soon" | present | 0 |

~166 words site-wide. Every chart is `'use client'` fetching JSON at runtime, so the
entire data asset is invisible in the HTML. Bot blocking was ruled out by test:
Googlebot, Bingbot and browser UAs all get identical HTTP 200 / 25,884 bytes.
**Google can crawl fine — it is choosing not to index.**

Also flagged: `/map#12/48.85/2.34/apple,google/osm` permalinks have **zero SEO
value** — Googlebot discards everything after `#`. Great share links, zero
indexable URLs. And `www.streetradar.app` returns SSL error 526.

→ **Status: fix pushed on `fix/canonical-urls`, CI green, NOT MERGED.** ~1 day of
work for the rest. Highest ROI item in the entire corpus.

---

## Decision C — Per-country pages: yes, but not the obvious version

**The finding nobody else surfaced, and it inverts the naive plan.**

Google autocomplete swept across 40 countries for `"does {country} have street
view"`. **Only 13 autocomplete** — and they are almost exclusively countries where
coverage is *absent, restricted or surprising*: China, Russia, Germany, Japan,
Israel, Taiwan, Hong Kong, Turkey, Mexico, Iceland, Switzerland, Poland, UK.
Volume confirms: china 1,900 · africa 1,300 · india 1,000 · germany 1,000.

Nobody searches "does France have street view." The answer is obviously yes.

**The Apple dataset covers 34 countries — overwhelmingly the obvious-yes ones**
(France, Spain, Italy, Sweden, Denmark, Belgium, Slovenia…), and holds **no data for
China, India, Africa, Russia**, where the demand actually is. That inverse
correlation kills "generate 34 country pages".

**Where the data does match demand:** the updates/history cluster, ~3,220/mo —
`how often does google street view update` 1,000 · `old street view` 880 ·
`google street view timeline` 480. The repo holds **586 rows of monthly time series,
2018-06 → 2025-02, 78 distinct months**. Nobody else publishes provider capture-
activity over time. Best asset-to-demand fit, currently buried behind a client-side
chart.

**Search demand, measured rather than estimated:** the Wikipedia article
`Google_Street_View_coverage` pulls **~10,000–11,100 real views/month** (Wikimedia
Pageviews API, 12-month mean) — 2.5–3× the entire strict keyword cluster the tools
can see. Demand arrives through hundreds of floor-censored long-tail phrasings.

Three caveats: the topic is **declining ~30%/yr** (13,389 in 2025 → 8,500 in 2026);
CPC is $0.00; **Yandex interest collapsed 94%** (25,118 → 1,617) while Apple more
than doubled.

**Competitive gap is genuinely open.** Per-country *multi-provider* coverage pages do
not exist anywhere. geomastr has 101 country pages but coverage is one page and
`/country/japan/` contains the phrase "Street View" **zero times**. geometas country
pages are 214 words, no tables, no schema. Wikipedia is provider-siloed by design and
structurally cannot do comparison.

Proposed structure, ~120–180 pages prioritised **by controversy, not data
availability**: `/coverage/`, `/coverage/[country]/`, `/coverage/apple-look-around/
[country]/`, `/coverage/history/[year]/`, `/coverage/countries-without-street-view/`,
`/map/[country]/` (path, never hash).

**Ceiling:** ~400 organic visits/mo at 6 months, **~1,500 at 12 months**, ~3,000 at
24 months. Not a traffic business. But 0 → 1,500 is a step change from today's
~110–170 Bing visits.

Explicit do-nots: no 500+ city pages (thin-content classification, and there is no
city-level query demand); no standalone Bing/Yandex/Naver pages (`Bing_Maps_Streetside`
Wikipedia gets **~1 view/month**); no mass-generated AI prose; no link buying; don't
optimise Core Web Vitals (already 0.3–0.5s); don't buy Ahrefs/Semrush.

One tactic worth copying: geomastr allow-lists GPTBot, ClaudeBot, PerplexityBot,
Google-Extended and CCBot in robots.txt. For a factual-lookup niche, AI-answer
citation is a real traffic channel.

---

## Decision D — The tile-sampling unlock. **Highest traffic lever, highest legal exposure.**

Verified: all three raster coverage endpoints already in `src/services/
streetViewService.ts` are publicly samplable and cleanly discriminate coverage at z10.

| | Paris | Beijing | Moscow | Seattle |
|---|---|---|---|---|
| Google | 37,603 B | **255 B** (empty) | – | – |
| Bing | 2,293 B | **169 B** (empty) | **169 B** | 4,153 B |
| Yandex | **HTTP 204** | 859 B | 107,406 B | **HTTP 204** |

Rasterise over country polygons, count coverage-coloured pixels → per-country stats
for Google, Bing and Yandex. **This is precisely what unlocks the China / Germany /
Russia / India pages where the volume is.** Combined with OSM road lengths it yields
"% of X's roads have Street View" — the metric `ja_stats.json` already proves out
(59.6% of Icelandic roads).

**And it is the single most legally exposed thing in the entire plan.** Harvesting
Google's undocumented internal `maps/vt` endpoint to publish a derived statistics
product is the exact act Platform ToS §3.2.4(c) describes, whose own worked example is
"construct an index of tree locations within a city from Street View imagery."

→ **Under the owner's constraint, this is the one thing NOT to build.** The traffic it
unlocks is the traffic that requires crossing the line he drew. The Apple/Naver/Já
PMTiles are owned outright and stay the safe differentiator.

---

## Decision E — Launching is a lottery ticket, not a plan

Base rates from **n = 13,000 Show HN posts** (Algolia `search_by_date`, so unbiased
by relevance ranking), 2025-06-01 → 2026-08-10:

- Median Show HN: **2 points.** p90 = 9.
- Show HN with "map" in the title (n=194): median **2**, **4.6% reach 100 points**,
  **0% reach 500**.

**The big scores in this niche come from third parties, not authors.** Protomaps:
author 113 pts, a third party 1,001. DeFlock: author 17 pts, third parties 621 / 240 /
261. The True Size Of: five front pages over ten years, five different submitters.
→ Optimise for re-submittability over a decade, not for launch day.

**Durable multiplier from a spike: 1.1–1.5×.** The only clean ≥60-day measurement in
the public record is 1.32× (Niko Fischer: 25/day → 11,000 peak → 33/day at two
months). Restated baseline-independently: **1 in 250 to 1 in 2,000 spike visitors
becomes a recurring daily visitor.** ~94% bounce, 15–22s average duration.

**Title beats product:** OpenFreeMap posted the *same URL* five days apart —
14 points, then **848 points**. A flop is not a verdict.

Venue ranking by strength of evidence: (1) SEO / per-country pages — the only
compounding channel; (2) **sk-zk's GitHub Discussions "Show and tell"** — zero
derived projects ever posted there, sk-zk actively pushing, and
`streetradar-data-engine` is *already* listed among streetlevel's 26 dependents;
(3) OSM wiki `Street-level imagery` — has provider comparison tables and links to no
coverage map at all; (4) Maps Mania (624 posts tagged "Street View", active); (5) the
GeoGuessr Discords (61,935 members, no Rule 7); (6) Show HN. **r/geoguessr is the
wrong primary venue** — smallest audience, self-promotion banned by rule, and the five
non-Google providers are what it cares least about. **r/MapPorn** is where coverage
maps have cleared 10k–31k upvotes for eight years.

**Hard blocker on every venue:** the data is 11–14 months stale (R2 `last-modified`:
Apple **2025-06-28**, Naver **2025-09-16**, Já **2025-09-14**). An audience that
upvotes coverage maps to 30k will notice immediately.

---

## Decision F — Legal. The exposure is not where I first said it was.

**Revision, and it matters.** I earlier ranked live tile display as the *lower* risk
because it stores nothing. Two agents argue the opposite and they have the better of
it on detectability:

- **Google Platform ToS §3.2.4(e)(ii)** bans displaying "Street View imagery and
  non-Google maps in the same Customer Application." StreetRadar renders Google
  coverage on a Leaflet/OSM basemap — **continuously, visibly, right now**.
  **Yandex §6.1.1** is identical and names panoramas explicitly.
- Counterweight, which still holds: the Platform ToS binds *API customers*, and he
  holds no key. The End User Terms bind instead, and are weaker on this exact point.
- **Apple Maps ToU §1.3(vi)** remains the clause most squarely on point — "copy,
  extract, scrape or reutilize… creation of any databases based upon data or content
  provided through the Service" — and it **binds by access, not signup**.

**Corrections to what I told the owner earlier:**

1. **The EU sui generis database right is the *weakest* theory, not the key one.**
   Directive 96/9/EC Art 11 and French CPI L341-2 limit it to EU/EEA makers, and no
   Council extension to third countries has ever been concluded — so Google, Apple,
   Naver and Yandex are likely **not beneficiaries at all**. On top of that, *BHB v
   William Hill* (C-203/02) holds the right covers investment in *obtaining* existing
   materials and "does not cover the resources used for the creation of materials."
   Coverage imagery is *created* by driving cars, not obtained. Two independent
   reasons the claim probably fails.
2. **But that helps less than it sounds.** *Ryanair v PR Aviation* (C-30/14): where no
   database right exists, the Directive's Art 8 lawful-user protections don't apply
   either, leaving the owner free to impose contractual limits. **No IP right means the
   claim arrives as contract instead.** That is the hiQ endgame — won the CFAA point,
   then lost on contract: Dec 2022 consent judgment, permanent injunction, compelled
   deletion of all derived code and data, $500k, company defunct.
3. **The serious French exposure is criminal and has nothing to do with IP.**
   *Cass. crim. 20 May 2015, n° 14-81.336* (Bluetouff): conviction upheld for
   *maintien frauduleux dans un STAD* where the data was reachable **without
   credentials**, because the defendant had seen that access controls existed and
   continued anyway. The defence that no offence is committed by "l'internaute qui
   utilise un logiciel grand public pour pénétrer dans un système non protégé" was
   **rejected**. **Code pénal 323-3**: 5 years / €150,000. Binding French law, applies
   to an individual in France, and "the endpoint was unauthenticated" is precisely the
   argument that failed.

**Two precedents that raise the floor:**

- **Yandex sends takedowns against hobby reverse-engineering tools and they work.**
  Two 2015 GitHub DMCA notices against a "Yandex.Music downloader" on an explicit
  unauthorized-access-plus-ToS theory; all three targeted repos now return 404. The
  filer on a 2025 Yandex notice was **Brand Monitor LLC** — outsourced automated brand
  monitoring, not a human deciding you're too small to bother with.
- **LDBV/ZSHH v GermanHouseCoordinates** (May 2021), the closest structural analogue:
  a geodata agency took down a repo republishing extracted coordinates **plus 11 named
  forks**, asserted database-producer's rights, and disclosed it had seeded fake
  "dummy-object" **trap records** to detect unauthorized use. Both repos still return
  **HTTP 451** five years later. Derived tiles inherit source fingerprints.

**What survived, and it's the reason not to panic:** all **21,668 GitHub DMCA notices
2013–2026** were grepped. **Zero** from Google, Apple, Microsoft, Mapbox, HERE or
TomTom about map scraping. **Zero** notices mentioning Apple Maps, MapKit or Look
Around at all. `streetlevel` has shipped public reverse-engineered clients for all six
providers for 4.5 years, untouched.

**Charging would destroy the best available defence.** The README says "no commercial
or advertising objectives… purely informational." That sentence is doing real work.
Monetising deletes it and simultaneously triggers Apple §1.3(iv) ("create or enhance a
competing service") and Yandex §4.5 ("personal non-commercial use only"). It also
kills the DSM Art 3 research exception, which is non-overridable but unavailable to a
commercial actor.

Verified directly (not agent-reported):

| Provider scraped | Actual host | robots.txt on the called path |
|---|---|---|
| Apple | `gspe72-ssl.ls.apple.com/mnn_us/`, `gspe76-ssl.ls.apple.com/api/tile?` | no file served (403) |
| Naver | `map.pstatic.net` | no file served (Access Denied) |
| **Já 360** | `ja.is` | **`Disallow: /kort/closest/` + `/kort/scene/`** — the exact two endpoints `streetlevel.ja` calls |

Já is the only machine-readable refusal and the only EEA-established maker.

→ **Recommended, cheapest first:** per-provider kill switches (turns an irreversible
amputation into a 5-minute response to a polite email); restrict the public 16.4 GB R2
bulk download by Referer/Origin at the Cloudflare edge; keep non-commercial status
visible; **do not** build Decision D; no proxies. A €200–400 French IP/IT consultation
is proportionate to the stated goal.

---

## Decision G — The real existential risk is access, not law

**Every Noise at Once** was evergreen for a decade (344 pts and 333 pts on HN in
separate years) and died when its author was laid off from Spotify and lost data
access — not to a lawsuit. A tool built on someone else's undocumented pipeline dies
when the pipeline dies.

Concretely already true here: the Yandex tile URL in the client carries a pinned
`v=2025.04.14…` that **will** break. Google/Bing/Yandex are hotlinked live, so the
site's core function depends on three undocumented endpoints nobody has promised to
keep.

Also: **it is a 3-provider dataset, not 6.** Google, Bing and Yandex are hotlinked
from the providers' own internal endpoints — none of that data is owned. The owned
assets are Apple, Naver, Já 360, Mapy.cz. "6 providers" overstates the asset in both
directions: legally and in what could ever be published.

---

## Recommended sequence under the €10/month + legal constraint

1. **Merge `fix/canonical-urls`** (pushed, green, unmerged — actively suppressing
   Google indexing of `/map` and `/analytics`).
2. **Per-provider kill switches** + **R2 Referer/Origin restriction**. Cheap,
   reversible, reduces exposure at nil product cost.
3. **SSR text + H1 on `/map`**, JSON-LD, fix `www` SSL 526. ~1 day.
4. **Refresh Naver and Apple once.** Freeze Já collection but keep serving it, with
   the kill switch behind it.
5. **`/coverage/history/[year]/`** from the 586-row time series — the only place the
   owned data meets real demand.
6. **`/coverage/apple-look-around/[country]/`** × 34 from `coverage_stats.json`.
7. **Post to sk-zk's GitHub Discussions**, OSM wiki, Maps Mania. Credit streetlevel
   by name. Not r/geoguessr first.
8. **Do not** build the tile-sampling pipeline. **Do not** monetise.

Open questions the research did not answer: geospatial newsletters as a channel
(agent failed); community-led growth tactics (agent failed); whether *Ryanair v
Booking.com*'s 2024 CFAA verdict survived post-trial motions; French *parasitisme /
concurrence déloyale*, which needs neither an IP right nor a contract and is the
least-examined risk given the owner's jurisdiction.
