# Kamer & Studio Planner

Dit pakket is klaar voor Vercel (Vite + React + Tailwind).

## Upload naar GitHub (zonder terminal)
1. Pak deze ZIP **uit** op je computer.
2. Ga naar je GitHub-repo → **Add file → Upload files**.
3. **Sleep de inhoud** van de uitgepakte map (dus `src/`, `index.html`, `package.json`, `vite.config.js`, `tailwind.config.js`, `postcss.config.js`, `README.md`) naar het uploadvak.
   > Niet de ZIP uploaden, en niet de hele map slepen—**alleen de inhoud**.
4. Klik **Commit changes**.

## Deploy op Vercel
- **New Project → Import from GitHub** → kies je repo
- **Framework preset:** Vite
- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Root Directory:** leeg laten

Klaar. De link verschijnt na de build.
