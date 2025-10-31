## Say & Play

Say & Play is a voice-first learning playground that helps children with speech delays practice everyday communication. Kids unlock mini-scenes by speaking target phrases, interact with animated objects using touch gestures, and hear instant feedback from modeled prompts.

### Highlights

- **Voice-powered play** – Web Speech API + `react-speech-recognition` listen for phrases with adjustable tolerance.
- **Touch & motion** – `@use-gesture/react` and React Spring enable swipes, drags, and animated transitions.
- **3D gift playground** – Three.js renders reorderable presents that spring open when kids speak the right color or order.
- **Phrase Rainbow scenes** – Everyday requests (juice, hungry, thirsty) transform cups, plates, and glasses on command.
- **Audio prompts** – Tap-to-play voice clips under `public/audio/phrases/*` keep the experience accessible.

### Tech Stack

- Next.js (App Router) with static export for GitHub Pages deployment
- React 19, TypeScript, Tailwind utilities, ShadCN UI
- React Spring (web & three), Three.js, @use-gesture/react
- Playwright end-to-end tests, ESLint/TypeScript for linting

### Getting Started

```bash
npm install        # install dependencies
npm run dev        # start dev server on http://localhost:3000

npm run lint       # type-check + lint
npm run test:e2e   # Playwright regression suite
```

Add or replace audio prompts in `public/audio/phrases`. Keep filenames kebab-case (`im-hungry.mp3`) so imports remain consistent.

### Build & Export

Static export is configured via `next.config.ts` (`output: "export"`).

```bash
npm run build      # production build
npm run export     # optional: write static assets to out/
```

Publish the `out/` directory to GitHub Pages or hook it into an automated deploy workflow.

### Project Structure

- `src/app/page.tsx` – landing “Open Seseme” voice gate
- `src/app/play/page.tsx` – selection hub for games
- `src/app/play/whats-in-the-box` – 3D gift playground route
- `src/app/play/phrase-rainbow` – everyday phrase scenes route
- `src/components/whats-in-the-box` – Three.js gift rendering + controls
- `src/components/scenes` – Phrase Rainbow carousel and SVG graphics
- `public/audio/phrases` – placeholder voice prompts

### Contributing

1. Fork the repo and create a feature branch: `git checkout -b feature/my-idea`.
2. Make changes and add tests or audio placeholders when needed.
3. Run `npm run lint` (and `npm run test:e2e` for gameplay updates).
4. Commit with clear messages and submit a pull request.

Please ensure new games support both speech input and touch interactions.

### License

MIT © ninthsignal
