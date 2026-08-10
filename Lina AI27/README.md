# Lina's Instructional Graphic Builder

**An instructional design tool · Part of Lina's AI Teaching Toolkit · v1.1.0**

A production-quality, modular web application that helps educators compose precise, model-aware prompts for generating classroom-ready instructional graphics (infographics, flowcharts, timelines, concept maps, diagrams, comparison charts, process illustrations, and more).

**Create classroom-ready instructional graphics and optimized AI prompts for teaching.**

## Features

- **Live prompt composition** — every control updates a single master prompt in real time
- **16 graphic types** — Concept Map, Flowchart, Infographic, Timeline, Comparison Chart, Labeled Diagram, Cycle, Hierarchy, Venn, 2×2 Matrix, Mind Map, Sequence, Anatomy, Data Visualization, Visual Analogy, Reference Poster
- **Content controls** — Topic, Subject Area, Grade Level, Audience, Learning Objective, Bloom’s Taxonomy Level
- **Visual controls** — Style, Tone, Color Palette, Complexity, Icon preferences
- **Layout & output** — Size presets, Orientation, Text density, File format, Resolution, Transparency, Bleed
- **Accessibility options** — Color-blind-safe, Alt-text, Readability at distance, High contrast, Large labels
- **Pedagogical constraints** — Factual accuracy, Clear hierarchy, Cite sources, Age-appropriate, Scaffold complexity
- **Model-aware phrasing** — Claude, ChatGPT, Gemini, Grok, Perplexity, Generic
- **Quick-start templates** — Classroom Activity, Lecture, Training, Learning Summary
- **Presets** — Save, Load, Delete named configurations (localStorage)
- **Copy / Export .txt / Reset**
- **Dark & light mode** (persisted)
- **Fully responsive** — desktop, tablet, mobile
- **WCAG 2.2 oriented** — semantic structure, skip link, focus management, ARIA, keyboard navigation, reduced-motion support
- **Modular architecture** — new sections, options, and models can be added without rewriting core logic

## Project structure

```
instructional-graphic-builder/
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── app.js              # Bootstrap
│   ├── config.js           # All options, models, defaults (extend here)
│   ├── prompt-builder.js   # Master prompt composition
│   ├── storage.js          # localStorage + presets + clipboard/download
│   └── ui.js               # Rendering, events, live preview
├── assets/                 # Reserved for future static assets
└── README.md
```

## Architecture

| Module              | Responsibility                                                                 |
|---------------------|--------------------------------------------------------------------------------|
| `config.js`         | Single source of truth for graphic types, options, models, quick-starts, defaults |
| `prompt-builder.js` | Pure functions that turn application state into a structured, model-aware prompt |
| `storage.js`        | Persist settings and named presets; clipboard and file download helpers          |
| `ui.js`             | Declarative section renderers, event binding, live preview sync                  |
| `app.js`            | DOM-ready entry point                                                            |

To add a new graphic type, option, or model: edit only `config.js` (and, if needed, a small template fragment in `prompt-builder.js`). The UI and persistence layers pick up the changes automatically.

## Running locally

No build step, no npm, no Node required. Serve the folder with any static file server:

```bash
cd instructional-graphic-builder
python -m http.server 8080
```

Then open **http://localhost:8080**.

Because the app uses ES modules, it must be served over HTTP(S). Opening `index.html` via `file://` will fail module loading in most browsers.

## Browser support

Modern evergreen browsers (Chrome, Firefox, Safari, Edge). localStorage and the Clipboard API are used; a fallback is provided for older clipboard environments.

## Accessibility

- Skip link to main workspace
- Semantic sections and headings
- Visible focus indicators
- ARIA roles, pressed states, and live regions for the prompt preview
- Keyboard-operable controls throughout
- `prefers-reduced-motion` respected
- Color-blind-safe defaults available as an accessibility option

## Extending the app

1. Open `js/config.js`.
2. Add entries to `GRAPHIC_TYPES`, `OPTIONS`, `ACCESSIBILITY`, `PEDAGOGICAL`, or `MODELS`.
3. If a new field needs to appear in the prompt text, add a few lines in `js/prompt-builder.js`.
4. If a new UI section is required, add a renderer function in `js/ui.js` and call it from `renderWorkspace()`.

The design is intentionally built to scale to hundreds of prompt options.

## License

Built for educators as part of Lina's AI Teaching Toolkit. Use and adapt freely in instructional design contexts.
