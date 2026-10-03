# Go-live: arizonagraniteandstone.com → the new site

Preview (live now): https://greenaisolution.github.io/arizona-granite-stone/
Repo: https://github.com/GreenAiSolution/arizona-granite-stone (GitHub Pages from `main`, `/`)

The old GoDaddy site keeps working until step 3 is saved. Nothing below is destructive to it
except replacing the A records, and the GoDaddy builder page stays in their account either way.

## 1. Carlos approves the preview

Get a plain "yes" by email or text before touching DNS.

## 2. Flip the repo to the real domain (Jaden's Mac, 2 minutes)

```bash
cd ~/arizona-granite-stone
# remove the preview-only noindex line
sed -i '' '/name="robots" content="noindex"/d' index.html
grep -c noindex index.html   # must print 0
echo "arizonagraniteandstone.com" > CNAME
git add -A && git commit -m "Go live on arizonagraniteandstone.com" && git push
# tell GitHub Pages the custom domain + enforce https (cert takes 5–60 min after DNS)
gh api -X PUT repos/GreenAiSolution/arizona-granite-stone/pages -f cname=arizonagraniteandstone.com
```

## 3. DNS at GoDaddy (Carlos's account — ns75/ns76.domaincontrol.com)

Do this with Carlos on the phone; GoDaddy emails HIM a 6-digit code on every DNS save, so make all
edits in one batch (learned on the BAKR launch).

Delete: the existing `A @` record(s) pointing at the GoDaddy builder (76.223.105.230 / 13.248.243.5),
and any `CNAME www` pointing at GoDaddy.

Add:

| Type  | Name | Value                      | TTL |
|-------|------|----------------------------|-----|
| A     | @    | 185.199.108.153            | 600 |
| A     | @    | 185.199.109.153            | 600 |
| A     | @    | 185.199.110.153            | 600 |
| A     | @    | 185.199.111.153            | 600 |
| CNAME | www  | greenaisolution.github.io  | 600 |

Leave MX / TXT / `_domainconnect` alone (their Gmail does not use the domain, but don't touch mail).

## 4. Verify (10–60 minutes later)

```bash
dig +short A arizonagraniteandstone.com          # four 185.199.* addresses
curl -sI https://arizonagraniteandstone.com/ | head -1   # HTTP/2 200
gh api repos/GreenAiSolution/arizona-granite-stone/pages --jq '.https_enforced,.protected_domain_state'
```

If https shows a cert error for a while, that's GitHub still issuing the certificate. Hand Carlos the
link as `arizonagraniteandstone.com` (no www) and paste it, don't let him type it.

Then re-enable https enforcement if it dropped:

```bash
gh api -X PUT repos/GreenAiSolution/arizona-granite-stone/pages -F https_enforced=true
```

## 5. After the switch

- Quote form: Carlos submits one test, gets a FormSubmit "activate" email at arizonagraniteandstone@gmail.com,
  clicks it once. Until then submissions are held. (Activation is per domain; re-test after go-live.)
- Google: https://search.google.com/search-console → add property `arizonagraniteandstone.com`,
  verify by DNS TXT (one more GoDaddy save), submit `https://arizonagraniteandstone.com/`.
- Google Business Profile: update the website link to the new domain if it points at the old builder URL.
- Reviews: paste real ones into `CONFIG.reviews` in main.js; the section un-hides itself.
- Portfolio: add the job to greenaidigital.com /work (tools/gen_work.py) once Carlos is happy.
