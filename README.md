# wiumjolene.github.io

My personal website, built with [Quartz 5](https://quartz.jzhao.xyz) from my private Obsidian vault
(`wiumjolene/wiumjolene-obsidian`).

## How publishing works

- A note goes on the site **only** if its frontmatter has `publish: true`. Everything else stays private.
- `Projects/` and `Templates/` are never published, even if a note there says `publish: true`.
- Only images that published notes use are copied to the site.
- Links from a published note to an unpublished one show as plain text (no 404s).
- The vault's homepage is `index.md` in the vault root.

Pushing the vault triggers a rebuild (via `.github/workflows/update-website.yml` in the vault).
The site also rebuilds daily, and on demand from **Actions → Build and deploy site → Run workflow**.

## One-time setup

1. **Create the repo**: on GitHub, create a new **public** repo named exactly `wiumjolene.github.io`
   (no README). Then push this folder:
   ```
   cd wiumjolene.github.io
   git init -b main
   git add .
   git commit -m "Set up Quartz site"
   git remote add origin https://github.com/wiumjolene/wiumjolene.github.io.git
   git push -u origin main
   ```
2. **Create one access token**: GitHub → Settings → Developer settings → Personal access tokens →
   **Fine-grained tokens** → Generate new token.
   - Repository access: *Only select repositories* → `wiumjolene-obsidian` and `wiumjolene.github.io`
   - Permissions → Repository → **Contents: Read and write** (read for the vault, write lets the vault trigger site builds)
   - Pick an expiry (e.g. 1 year) and set a reminder to renew it.
3. **Add the token as a secret in both repos** (Settings → Secrets and variables → Actions → New repository secret):
   - in `wiumjolene.github.io`: name `VAULT_TOKEN`
   - in `wiumjolene-obsidian`: name `SITE_TOKEN`
4. **Turn on Pages**: in `wiumjolene.github.io` → Settings → Pages → Source: **GitHub Actions**.
5. Commit and push the vault (it now contains `index.md`, the updated Book template and
   `.github/workflows/update-website.yml`). After about a minute the site is live at
   https://wiumjolene.github.io.

## Changing things

- Site title, colours, fonts, footer links: `quartz.config.yaml`
- Quartz version: `QUARTZ_VERSION` in `.github/workflows/deploy.yml`
