# Design Innovations

The Design Innovations LLC marketing site, packaged as a dependency-free static site for GitHub Pages.

## Local preview

```powershell
npm install
npm run dev
```

Open `http://127.0.0.1:4173/`.

## Checks and production build

```powershell
npm run check
```

The production-ready files are written to `dist/`. A push to `main` deploys that directory through GitHub Pages.

## Re-importing a revised bundled page

```powershell
node scripts/prepare-page.mjs "C:\path\to\Design Innovations.html" index.html
```

The importer applies the production metadata and then the dark Graphite palette (`scripts/graphite.mjs`) before writing the deployable page. Graphite replaces the light paper sections with the design system's dark surfaces and sets labels in JetBrains Mono.
