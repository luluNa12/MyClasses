/**
 * UI module — renders sections, binds events, and keeps the live preview
 * in sync with application state.
 *
 * Each section is rendered by a dedicated function that reads from config.
 * Adding a new section requires only a new renderer + a call in renderWorkspace.
 */

import {
  APP_VERSION,
  QUICK_STARTS,
  GRAPHIC_TYPES,
  GRAPHIC_GOALS,
  OPTIONS,
  ICON_PREFERENCES,
  ACCESSIBILITY,
  PEDAGOGICAL,
  MODELS,
  DEFAULT_STATE,
  ANIMATION_OPTIONS,
  QUIZ_QUESTION_TYPES,
  ACTIVITY_RECOMMENDATION_PROFILES,
  PROG_VIDEO_OPTIONS
} from './config.js';
import { buildPrompt, getPromptStatus } from './prompt-builder.js';
import {
  loadSettings,
  saveSettings,
  loadPresets,
  upsertPreset,
  deletePreset,
  downloadText,
  copyToClipboard
} from './storage.js';

/** Application state — single source of truth */
let state = loadSettings();

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

/** Apply theme class to <html> */
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
  state.theme = theme;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute('content', theme === 'dark' ? '#060d18' : '#0c1a2e');
  }
}

/** Persist state and refresh the prompt preview */
function commit(partial = {}) {
  // If the instructional context changed substantially, allow dismissed recs to reappear
  const contextKeys = ['templateId', 'graphicGoal', 'learningObjective', 'topic', 'bloomLevel'];
  const contextChanged = contextKeys.some(k => partial[k] !== undefined && partial[k] !== state[k]);
  if (contextChanged) {
    // Keep dismissals for the exact same key the user just applied; clear others
    if (partial.learningObjective !== undefined) {
      dismissedRecKeys.delete('bloomLevel');
      dismissedRecKeys.delete('graphicType');
    }
    if (partial.bloomLevel !== undefined) {
      dismissedRecKeys.delete('graphicType');
      dismissedRecKeys.delete('complexity');
    }
    if (partial.templateId !== undefined || partial.graphicGoal !== undefined) {
      dismissedRecKeys.clear();
    }
  }

  Object.assign(state, partial);
  saveSettings(state);
  updatePromptPreview();
  updateStatus();
  // Refresh any visible inline recommendation so message / applied state stay accurate
  refreshActiveInlineRec();
}

/** Render the entire application shell */
export function renderApp() {
  applyTheme(state.theme || 'light');

  const app = $('#app');
  if (!app) return;

  app.innerHTML = `
    <a class="skip-link" href="#workspace">Skip to workspace</a>

    <header class="site-header">
      <div class="header-inner">
        <div class="brand">
          <p class="eyebrow">Lina's AI Teaching Toolkit</p>
          <h1>Lina's Instructional Graphic Builder</h1>
          <p class="tagline">Create classroom-ready instructional graphics and optimized AI prompts for teaching.</p>
        </div>
        <div class="header-actions">
          <button type="button" class="btn btn-ghost btn-icon" id="btn-theme" aria-label="Toggle dark mode" title="Toggle dark / light mode">
            <span class="theme-icon" aria-hidden="true"></span>
          </button>
          <span class="version-badge">v${APP_VERSION}</span>
          <span class="for-educators">For Educators</span>
        </div>
      </div>
    </header>

    <main class="main-layout">
      <div class="workspace" id="workspace" tabindex="-1">
        <!-- Sections injected by renderWorkspace -->
      </div>

      <aside class="preview-panel" aria-label="Generated prompt preview">
        <div class="preview-header">
          <h2>Generated Prompt</h2>
          <span class="model-tag" id="preview-model-tag"></span>
        </div>
        <div class="preview-body">
          <pre id="prompt-output" class="prompt-output" tabindex="0" role="region" aria-live="polite" aria-label="Live prompt text"></pre>
          <p class="preview-placeholder" id="preview-placeholder"></p>
        </div>
        <div class="preview-actions">
          <button type="button" class="btn btn-primary" id="btn-copy">Copy</button>
          <button type="button" class="btn btn-secondary" id="btn-download">Download .txt</button>
          <button type="button" class="btn btn-secondary" id="btn-reset">Reset</button>
        </div>
        <div class="preview-status" id="preview-status" aria-live="polite"></div>
      </aside>
    </main>

    <footer class="site-footer">
      <p>Lina's Instructional Graphic Builder · Part of Lina's AI Teaching Toolkit</p>
      <p class="footer-meta">Modular · Accessible · Local-first · Built for educators</p>
    </footer>

    <div class="toast" id="toast" role="status" aria-live="polite" hidden></div>

    <div class="modal" id="preset-modal" hidden>
      <div class="modal-backdrop" data-close-modal></div>
      <div class="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="preset-modal-title">
        <h2 id="preset-modal-title">Save Preset</h2>
        <label class="field-label" for="preset-name">Preset name</label>
        <input type="text" id="preset-name" class="field-input" placeholder="e.g. Biology Concept Maps – High School" maxlength="80" />
        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" data-close-modal>Cancel</button>
          <button type="button" class="btn btn-primary" id="btn-confirm-save-preset">Save</button>
        </div>
      </div>
    </div>
  `;

  renderWorkspace();
  bindGlobalEvents();
  updatePromptPreview();
  updateStatus();
}

/** Render all form sections into #workspace */
function renderWorkspace() {
  const workspace = $('#workspace');
  if (!workspace) return;

  workspace.innerHTML = `
    ${renderContentSource()}
    ${renderQuickStart()}
    ${renderSectionContent()}
    ${renderSectionGraphicType()}
    ${renderSectionVisuals()}
    ${renderSectionLayout()}
    ${renderSectionOutput()}
    ${renderSectionAnimation()}
    ${renderSectionAccessibility()}
    ${renderSectionPedagogical()}
    ${renderSectionModel()}
    ${renderSectionNotes()}
    ${renderPresetBar()}
  `;

  bindSectionEvents();
  bindInlineRecommendationFocus();

  // Ensure preset dropdown reflects active selection after render
  const presetSelect = $('#preset-select');
  if (presetSelect && state.activePresetId) {
    presetSelect.value = state.activePresetId;
  }
}

/* ================================================================== */
/*  Section renderers                                                  */
/* ================================================================== */

function renderContentSource() {
  const isFile = state.contentSource === 'file';
  const isManual = state.contentSource !== 'file';
  return `
    <section class="section" id="section-content-source" aria-labelledby="heading-content-source">
      <div class="section-header">
        <h2 id="heading-content-source"><span class="section-num">§ 00</span> Content Source</h2>
        <p class="section-desc">where the content comes from</p>
      </div>
      <p class="guide-question">Step 0: Where should the AI get the content?</p>
      <p class="guide-hint" style="margin-top: 0; margin-bottom: var(--space-4);">Choose whether to create the graphic from an existing file or enter the information manually.</p>
      <div class="chip-row goal-row" role="group" aria-label="Content source">
        <button type="button" class="chip chip-toggle ${isFile ? 'is-active' : ''}" data-content-source="file" aria-pressed="${isFile}">Upload a File (Recommended)</button>
        <button type="button" class="chip chip-toggle ${isManual ? 'is-active' : ''}" data-content-source="manual" aria-pressed="${isManual}">Enter Information Manually</button>
      </div>
      ${isFile ? `
        <div class="field-group" style="margin-top: var(--space-4);">
          <p class="guide-hint" style="margin-top: 0; margin-bottom: var(--space-2);">Use when: You already have lecture slides, notes, or a document. The toolkit extracts topic, objectives, and keywords when possible.</p>
          <p class="guide-hint" style="margin-top: 0; margin-bottom: var(--space-3);">Supported files: PowerPoint (.pptx), PDF, Word (.docx), Text (.txt / .md), HTML</p>
          <label class="field-label" for="content-file">Choose a file</label>
          <input type="file" id="content-file" class="field-input" accept=".pptx,.pdf,.docx,.txt,.md,.html,.htm,text/plain,text/markdown,text/html,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation" />
          ${state.uploadedFileName ? `<p class="guide-hint" style="margin-top: var(--space-2);">Selected: <strong>${escapeHtml(state.uploadedFileName)}</strong>${state.extractedContent ? ' — text extracted for prompt context.' : ' — binary formats are noted in the prompt; paste key points below if needed.'}</p>` : ''}
        </div>
      ` : `
        <p class="guide-hint" style="margin-top: var(--space-4);">Use when: You are creating a new graphic from scratch. Fill in the content fields in the next steps.</p>
      `}
    </section>
  `;
}

/**
 * Instructional-design recommendation engine.
 * Returns suggested settings based on goal, quick-start, audience, subject, etc.
 * Never auto-applies — UI only.
 */
function recommendationMatches(apply) {
  if (!apply) return false;
  return Object.keys(apply).every(key => {
    const expected = apply[key];
    const current = state[key];
    if (Array.isArray(expected)) {
      if (!Array.isArray(current)) return false;
      return expected.every(v => current.includes(v));
    }
    return current === expected;
  });
}

function getSubtype() {
  const qs = QUICK_STARTS.find(q => q.id === state.templateId);
  if (!qs) return '';
  return state[qs.typeKey] || qs.defaultType || '';
}

/** Keyword analysis of learning objective → primary graphic type + alternatives + why */
function inferGraphicFromObjective(objective, bloom, subtype) {
  const obj = (objective || '').toLowerCase();
  const rules = [
    { re: /\b(compar|contrast|distinguish|difference|similarit)/i, primary: { id: 'comparison', title: 'Comparison Chart' }, alt: ['Venn Diagram', '2×2 Matrix'], why: 'The learning objective asks students to compare or contrast ideas.' },
    { re: /\b(sequence|chronolog|stages?|phases?|order of|timeline)/i, primary: { id: 'timeline', title: 'Timeline' }, alt: ['Sequence / Step-by-Step'], why: 'The objective emphasizes chronological order or stages.' },
    { re: /\b(process|procedure|workflow|algorithm|steps?\b)/i, primary: { id: 'flowchart', title: 'Flowchart' }, alt: ['Sequence / Step-by-Step'], why: 'The objective describes a process, procedure, or workflow.' },
    { re: /\b(cycle|recurring|continuous|repeated|loop)/i, primary: { id: 'cycle', title: 'Cycle Diagram' }, alt: ['Flowchart'], why: 'The objective describes a repeating or continuous cycle.' },
    { re: /\b(hierarch|levels?|categor|classif|structure|organiz)/i, primary: { id: 'hierarchy', title: 'Hierarchy / Org Chart' }, alt: ['Concept Map'], why: 'The objective focuses on levels, categories, or structure.' },
    { re: /\b(decision|branch|if\/else|choose between|condition)/i, primary: { id: 'flowchart', title: 'Flowchart' }, alt: ['Hierarchy / Org Chart'], why: 'The objective involves decisions, conditions, or branching paths.' },
    { re: /\b(relat|connect|associat|related concepts|interdepend)/i, primary: { id: 'concept-map', title: 'Concept Map' }, alt: ['Mind Map'], why: 'The objective focuses on relationships between concepts.' },
    { re: /\b(parts?|components?|anatomy|interface|identify|label)/i, primary: { id: 'labeled-diagram', title: 'Labeled Diagram' }, alt: ['Anatomy / Cross-Section'], why: 'The objective asks learners to identify or label parts of a system.' },
    { re: /\b(data|statistic|trend|percent|quantit|graph|chart)/i, primary: { id: 'data-viz', title: 'Data Visualization' }, alt: ['Infographic'], why: 'The objective involves numerical data, trends, or quantities.' },
    { re: /\b(cause and effect|problem and solution|problem–solution)/i, primary: { id: 'flowchart', title: 'Flowchart' }, alt: ['Comparison Chart'], why: 'The objective addresses cause–effect or problem–solution structure.' },
    { re: /\b(explain|summar|introduce|overview|describe|review)/i, primary: { id: 'infographic', title: 'Infographic' }, alt: ['Concept Map', 'Reference Poster'], why: 'The objective asks for explanation, summary, or overview.' },
    { re: /\b(apply|solve|practice|demonstrate)/i, primary: { id: 'sequence', title: 'Sequence / Step-by-Step' }, alt: ['Flowchart'], why: 'The objective emphasizes applying or practicing a procedure.' },
    { re: /\b(analy[sz]e|evaluate|justify)/i, primary: { id: 'comparison', title: 'Comparison Chart' }, alt: ['2×2 Matrix', 'Flowchart'], why: 'Higher-order analysis or evaluation benefits from structured comparison.' },
    { re: /\b(create|design|develop|build)/i, primary: { id: 'sequence', title: 'Sequence / Step-by-Step' }, alt: ['Flowchart', 'Mind Map'], why: 'Creation tasks benefit from a planning or process visual.' }
  ];

  for (const rule of rules) {
    if (rule.re.test(obj)) return rule;
  }

  // Bloom fallback
  if (bloom === 'remember') return { primary: { id: 'infographic', title: 'Infographic' }, alt: [], why: 'Bloom’s Remember level fits a concise review visual.' };
  if (bloom === 'analyze' || bloom === 'evaluate') return { primary: { id: 'comparison', title: 'Comparison Chart' }, alt: ['2×2 Matrix'], why: 'Higher Bloom levels benefit from structured analysis visuals.' };
  if (bloom === 'create') return { primary: { id: 'sequence', title: 'Sequence / Step-by-Step' }, alt: ['Flowchart'], why: 'Create-level objectives often need a planning or process structure.' };

  // Activity-type default
  if (subtype === 'study-guide' || subtype === 'chapter-summary') {
    return { primary: { id: 'infographic', title: 'Infographic' }, alt: ['Concept Map', 'Timeline'], why: 'Study and chapter summaries work well as organized infographics unless the objective specifies another structure.' };
  }
  if (subtype === 'quiz' || subtype === 'interactive-activity') {
    return { primary: { id: 'infographic', title: 'Infographic' }, alt: [], why: 'Interactive activities still benefit from a clear visual structure supporting the tasks.' };
  }

  return { primary: { id: 'infographic', title: 'Infographic' }, alt: [], why: 'Default instructional summary visual when no stronger keyword match is found.' };
}

/**
 * Full context-aware recommendation engine.
 * Uses purpose, activity type, objective keywords, audience, subject, Bloom, and delivery format.
 */
function getSmartRecommendations() {
  const template = state.templateId;
  const subtype = getSubtype();
  const objective = state.learningObjective || '';
  const bloom = state.bloomLevel || '';
  const grade = state.gradeLevel || '';
  const subject = state.subjectArea || '';
  const audience = (state.audience || '').toLowerCase();

  // Programming Video — specialized recommendations
  if (template === 'lecture' && subtype === 'programming-video') {
    const rec = (key, label, value, apply, reason) => ({
      key, label, value, apply: apply || null, why: reason || '',
      matches: apply ? recommendationMatches(apply) : false
    });
    return [
      rec('outputType', 'Recommended Output Type', 'AI Video Prompt', null, 'Programming Video produces a structured video-generation package.'),
      rec('progPresenter', 'Recommended Presenter', 'Female Instructor', { progPresenter: 'female' }, 'A friendly female college instructor matches the requested presentation style.'),
      rec('progPresentationStyle', 'Recommended Presentation Style', 'Split Screen (Instructor + Code Editor)', { progPresentationStyle: 'split-screen' }, 'Students see the instructor and the code at the same time.'),
      rec('progCodeAnimation', 'Recommended Code Animation', 'Type the program line by line', { progCodeAnimation: 'type-line-by-line' }, 'Typing code as it is explained supports beginner understanding.'),
      rec('progExplanationStyle', 'Recommended Explanation', 'Detailed Code Walkthrough', { progExplanationStyle: 'detailed-walkthrough' }, 'Detailed walkthrough explains keywords, structure, and execution order.'),
      rec('visualStyle', 'Recommended Visual Style', 'Professional college classroom look', { visualStyle: 'line-art' }, 'Keep the scene clean and professional for college instruction.'),
      rec('tone', 'Recommended Tone', 'Friendly, professional, educational', { tone: 'friendly' }, 'Friendly professional tone supports first-semester learners.'),
      rec('accessibility', 'Recommended Accessibility', 'Closed captions, high contrast, large readable code, WCAG 2.1 AA', { accessibility: ['alt-text', 'high-contrast', 'readability-distance', 'wcag-aa', 'large-labels'] }, 'Video instruction should support captions, contrast, and readable code.'),
      rec('model', 'Recommended AI Model', 'Claude or ChatGPT', { model: 'claude' }, 'Structured educational video prompts work well with Claude or ChatGPT.')
    ];
  }

  const graphicInfer = inferGraphicFromObjective(objective, bloom, subtype);

  // --- Base recommendations (activity-aware) ---
  let visualStyle = { id: 'line-art', label: 'Clean Line Art' };
  let tone = { id: 'professional', label: 'Professional / Formal' };
  let color = { id: 'editorial-neutrals', label: 'Editorial Neutrals' };
  let complexity = { id: 'moderate', label: 'Moderate' };
  let amountText = { id: 'moderate-labels', label: 'Moderate' };
  let icons = { ids: ['icons-illustrations'], label: 'Icons + Illustrations' };
  let size = { id: 'us-letter-portrait', label: 'US Letter (8.5 × 11) Portrait' };
  let orientation = { id: 'portrait', label: 'Portrait' };
  let fileFormat = { id: 'pdf', label: 'PDF (preferred); PNG optional' };
  let resolution = { id: '300', label: '300 DPI' };
  let animation = { id: 'none', label: 'None' };
  let a11y = {
    ids: ['color-blind-safe', 'alt-text', 'readability-distance', 'wcag-aa'],
    label: 'Color-blind safe, alt text, readability, WCAG 2.1 AA'
  };
  let pedagogical = {
    ids: ['factual-accuracy', 'clear-hierarchy'],
    label: 'Factual accuracy, clear visual hierarchy'
  };
  let model = { id: 'claude', label: 'Claude or ChatGPT' };

  const why = {
    graphic: graphicInfer.why,
    style: 'Clean line art keeps instructional graphics clear and professional.',
    tone: 'Professional tone fits most college and adult learning materials.',
    color: 'Editorial neutrals support readability and print quality.',
    complexity: 'Moderate complexity balances clarity with enough instructional detail.',
    text: 'Moderate text supports understanding without overcrowding the graphic.',
    icons: 'Icons and illustrations reinforce meaning without adding clutter.',
    size: 'US Letter portrait works well for handouts, Canvas downloads, and printing.',
    orientation: 'Portrait layout suits printed study materials and worksheets.',
    format: 'PDF is preferred for print-ready instructional materials.',
    resolution: '300 DPI is appropriate for classroom printing.',
    animation: 'Static formats should not include animation.',
    a11y: 'Core accessibility features support diverse learners and WCAG expectations.',
    pedagogical: 'Accuracy and hierarchy keep the graphic instructional, not decorative.',
    model: 'Claude and ChatGPT handle structured educational prompts reliably.'
  };

  // Interactive subtypes
  const isQuiz = template === 'classroom' && subtype === 'quiz';
  const isInteractivePractice = template === 'classroom' && subtype === 'interactive-activity';
  const isAssignment = template === 'classroom' && subtype === 'assignment';
  const isInteractiveAssignment = isAssignment && state.assignmentMode === 'interactive';
  const isPrintableAssignment = isAssignment && state.assignmentMode !== 'interactive';
  const isStudyGuide = template === 'summary' && subtype === 'study-guide';
  const isChapterSummary = template === 'summary' && subtype === 'chapter-summary';
  const isInteractive = isQuiz || isInteractivePractice || isInteractiveAssignment;

  if (isInteractive) {
    fileFormat = { id: 'interactive-html', label: 'Interactive HTML5 (self-contained)' };
    size = { id: 'slide-16-9', label: 'Responsive web layout' };
    orientation = { id: 'as-preset', label: 'Responsive (orientation follows layout)' };
    resolution = { id: '72', label: 'Screen (HTML does not use print DPI)' };
    animation = { id: 'none', label: 'Optional / subtle only' };
    a11y = {
      ids: ['alt-text', 'readability-distance', 'wcag-aa', 'high-contrast', 'color-blind-safe'],
      label: 'WCAG 2.1 AA, keyboard access, visible focus, contrast'
    };
    why.format = 'Students need to interact and receive feedback, so Interactive HTML5 is required.';
    why.size = 'Interactive activities should use a responsive web layout.';
    why.animation = 'Use animation only when it improves understanding; keep it subtle.';
    why.a11y = 'Interactive activities must meet ADA/WCAG 2.1 AA with keyboard and screen-reader support.';
    why.resolution = 'HTML activities are screen-based; print DPI does not apply.';
  }

  if (isQuiz) {
    visualStyle = { id: 'line-art', label: 'Clean Line Art' };
    amountText = { id: 'moderate-labels', label: 'Moderate' };
    complexity = { id: 'moderate', label: 'Moderate' };
    icons = { ids: ['icons-illustrations'], label: 'Icons or simple illustrations only when they support questions' };
    pedagogical = {
      ids: ['factual-accuracy', 'clear-hierarchy'],
      label: 'Factual accuracy, clear hierarchy, objective alignment'
    };
    why.style = 'Clean line art keeps quiz visuals uncluttered so questions stay primary.';
    why.icons = 'Visuals should support the question, not distract from answering.';
  }

  if (isInteractivePractice) {
    visualStyle = { id: 'flat-vector', label: 'Flat Vector Illustration' };
    tone = { id: 'friendly', label: 'Friendly / Approachable' };
    amountText = { id: 'key-terms', label: 'Low to Moderate' };
    icons = { ids: ['icons-illustrations'], label: 'Interactive diagrams, icons, cards, or controls' };
    pedagogical = {
      ids: ['factual-accuracy', 'clear-hierarchy', 'scaffold-complexity'],
      label: 'Immediate feedback, guided practice, scaffolded complexity'
    };
    why.style = 'Flat vector style keeps interactive practice modern and readable.';
    why.tone = 'A friendly tone supports practice without feeling high-stakes.';
    why.text = 'Practice benefits from less dense text and more interaction.';
    why.pedagogical = 'Guided practice should include feedback and scaffolded complexity.';
  }

  if (isPrintableAssignment) {
    fileFormat = { id: 'pdf', label: 'PDF preferred; PNG optional' };
    size = { id: 'us-letter-portrait', label: 'US Letter (8.5 × 11) Portrait' };
    orientation = { id: 'portrait', label: 'Portrait' };
    resolution = { id: '300', label: '300 DPI' };
    animation = { id: 'none', label: 'None' };
    amountText = { id: 'explanatory', label: 'Moderate to High' };
    icons = { ids: ['icons-illustrations', 'labeled-diagrams'], label: 'Icons, diagrams, tables, labeled examples' };
    why.format = 'Printable assignments work best as PDF for handouts and Canvas downloads.';
    why.text = 'Assignments often need clearer directions and space for student work.';
  }

  if (isInteractiveAssignment) {
    // already set interactive defaults above
    amountText = { id: 'moderate-labels', label: 'Moderate' };
    why.format = 'Interactive assignments require HTML so students can enter responses or complete guided steps.';
  }

  if (isStudyGuide || isChapterSummary) {
    visualStyle = { id: 'line-art', label: 'Clean Line Art' };
    fileFormat = { id: 'pdf', label: 'PDF preferred; PNG optional' };
    size = { id: 'us-letter-portrait', label: 'US Letter (8.5 × 11) Portrait' };
    orientation = { id: 'portrait', label: 'Portrait' };
    resolution = { id: '300', label: '300 DPI' };
    animation = { id: 'none', label: 'None' };
    amountText = { id: 'moderate-labels', label: 'Moderate' };
    complexity = { id: 'moderate', label: 'Moderate' };
    icons = { ids: ['icons-illustrations', 'labeled-diagrams'], label: 'Icons plus labeled diagrams or examples when helpful' };
    pedagogical = {
      ids: ['factual-accuracy', 'clear-hierarchy'],
      label: 'Factual accuracy, clear hierarchy, key terms, concise takeaways'
    };
    why.format = 'Study materials should be easy to print and download as PDF.';
    why.graphic = graphicInfer.why || 'Infographic works well for organized review unless the objective specifies another structure.';
  }

  // Subject / audience refinements
  if (subject === 'computer-science' || subject === 'math' || subject === 'engineering') {
    visualStyle = { id: 'line-art', label: 'Clean Line Art' };
    tone = { id: 'technical', label: 'Technical / Precise' };
    why.style = 'Technical subjects stay clearer with clean line art.';
    why.tone = 'Technical tone matches programming, math, and engineering content.';
  }
  if (subject === 'science' || subject === 'health') {
    if (graphicInfer.primary.id === 'labeled-diagram' || /part|anatomy|component/i.test(objective)) {
      visualStyle = { id: 'textbook', label: 'Classic Textbook Diagram' };
      why.style = 'Scientific components and anatomy read best as textbook-style diagrams.';
    }
  }
  if (grade === 'elementary' || grade === 'middle' || /elementary|young|k-?5|grade [1-5]/i.test(audience)) {
    visualStyle = { id: 'flat-vector', label: 'Flat Vector Illustration' };
    tone = { id: 'friendly', label: 'Friendly / Approachable' };
    complexity = { id: 'minimal', label: 'Minimal' };
    color = { id: 'pastel', label: 'Soft Pastels' };
    why.style = 'Younger learners benefit from friendly flat illustration.';
    why.complexity = 'Beginner audiences need simpler visuals with fewer elements.';
    why.color = 'Softer palettes are age-appropriate for younger learners.';
  }
  if (bloom === 'remember') {
    complexity = { id: 'minimal', label: 'Minimal' };
    why.complexity = 'Bloom’s Remember level fits a simpler visual with fewer elements.';
  } else if (bloom === 'analyze' || bloom === 'evaluate' || bloom === 'create') {
    if (complexity.id === 'minimal') complexity = { id: 'moderate', label: 'Moderate' };
    if (isStudyGuide || isChapterSummary) complexity = { id: 'detailed', label: 'Detailed' };
    why.complexity = 'Higher Bloom levels usually need more structured detail.';
  }

  // Bloom inference from learning objective verbs
  const bloomInfer = inferBloomFromObjective(objective);
  const objGuidance = buildObjectiveGuidance(objective);

  // Build recommendation rows
  const altNote = graphicInfer.alt?.length
    ? ` Alternatives: ${graphicInfer.alt.join(', ')}.`
    : '';

  const rec = (key, label, value, apply, reason) => ({
    key,
    label,
    value,
    apply: apply || null,
    why: reason || '',
    matches: apply ? recommendationMatches(apply) : false
  });

  return [
    rec('learningObjective', 'Learning Objective Guidance',
      objGuidance.message,
      null,
      objGuidance.why),
    rec('bloomLevel', 'Bloom\'s Taxonomy',
      bloomInfer.id
        ? `Based on your objective, ${bloomInfer.label} is the recommended level.`
        : 'Select a Bloom\'s level that matches your action verb.',
      bloomInfer.id ? { bloomLevel: bloomInfer.id } : null,
      bloomInfer.why),
    rec('graphicType', 'Graphic Type',
      `${graphicInfer.primary.title} fits this lesson best.` + (altNote ? ` (${graphicInfer.alt[0]} is a strong alternative.)` : ''),
      { graphicType: graphicInfer.primary.id },
      why.graphic + altNote),
    rec('visualStyle', 'Visual Style',
      `${visualStyle.label} is recommended for this audience and subject.`,
      { visualStyle: visualStyle.id },
      why.style),
    rec('tone', 'Tone',
      `${tone.label} keeps the graphic appropriate for your learners.`,
      { tone: tone.id },
      why.tone),
    rec('colorScheme', 'Color Palette',
      `${color.label} supports readability and classroom use.`,
      { colorScheme: color.id },
      why.color),
    rec('complexity', 'Complexity',
      `${complexity.label} balances clarity with enough instructional detail.`,
      { complexity: complexity.id },
      why.complexity),
    rec('amountOfText', 'Amount of Text',
      `${amountText.label} text density works well for this activity.`,
      { amountOfText: amountText.id },
      why.text),
    rec('iconPreferences', 'Visual Elements',
      icons.label,
      { iconPreferences: icons.ids },
      why.icons),
    rec('sizePreset', 'Size Preset',
      `${size.label} matches typical classroom delivery.`,
      { sizePreset: size.id },
      why.size),
    rec('orientation', 'Orientation',
      `${orientation.label} suits the intended format.`,
      { orientation: orientation.id },
      why.orientation),
    rec('fileFormat', 'Output Format',
      `${fileFormat.label} is the best delivery format for this activity.`,
      { fileFormat: fileFormat.id },
      why.format),
    rec('resolution', 'Resolution',
      `${resolution.label} is appropriate for the selected format.`,
      { resolution: resolution.id },
      why.resolution),
    rec('animation', 'Animation',
      animation.id === 'none'
        ? 'Keep this graphic static — animation is not needed for the selected format.'
        : `${animation.label} can support learning if used sparingly.`,
      animation.id === 'none' ? { animation: 'none' } : null,
      why.animation),
    rec('accessibility', 'Accessibility',
      `Enable: ${a11y.label}.`,
      { accessibility: a11y.ids },
      why.a11y),
    rec('pedagogical', 'Pedagogical Constraints',
      pedagogical.label,
      { pedagogical: pedagogical.ids },
      why.pedagogical),
    rec('model', 'AI Model',
      `${model.label} handles structured educational prompts reliably.`,
      { model: model.id },
      why.model)
  ];
}

/** Guidance for writing a strong, measurable learning objective */
function buildObjectiveGuidance(objective) {
  const obj = (objective || '').trim();
  if (!obj) {
    return {
      message: 'Start with a measurable action verb: identify, explain, apply, analyze, evaluate, or create.',
      why: 'Strong objectives name what learners will do, not just what they will “know.” Measurable verbs make assessment and graphic design clearer.'
    };
  }
  const hasVerb = /\b(identify|list|recall|define|explain|describe|summarize|apply|solve|demonstrate|analyze|compare|evaluate|critique|create|design|develop)\b/i.test(obj);
  if (!hasVerb) {
    return {
      message: 'Add a measurable verb (e.g., “explain,” “apply,” “analyze”) so the objective is observable.',
      why: 'Without an action verb it is hard to choose Bloom’s level, graphic type, and assessment criteria.'
    };
  }
  if (obj.length < 40) {
    return {
      message: 'Good start — add the condition or context (e.g., “…using a flowchart of the water cycle”).',
      why: 'A complete objective includes the action, the content, and often the conditions under which performance is expected.'
    };
  }
  return {
    message: 'Objective looks solid. Next, confirm Bloom’s level matches your action verb.',
    why: 'Aligning Bloom’s level to the verb keeps the graphic, complexity, and assessment consistent.'
  };
}

/** Infer Bloom's level from learning-objective action verbs */
function inferBloomFromObjective(objective) {
  const obj = (objective || '').toLowerCase();
  const levels = [
    { id: 'create',   label: 'Create',   re: /\b(create|design|develop|compose|construct|produce|invent|formulate)\b/, why: 'The objective uses creation verbs — students will produce something new.' },
    { id: 'evaluate', label: 'Evaluate', re: /\b(evaluate|critique|judge|justify|assess|appraise|defend|argue)\b/, why: 'The objective asks students to make judgments or defend a position.' },
    { id: 'analyze',  label: 'Analyze',  re: /\b(analy[sz]e|compare|contrast|differentiate|examine|investigate|deconstruct)\b/, why: 'The objective focuses on breaking ideas into parts or comparing relationships.' },
    { id: 'apply',    label: 'Apply',    re: /\b(apply|solve|demonstrate|implement|use|execute|practice|calculate)\b/, why: 'The objective emphasizes practicing or applying a skill in a new context.' },
    { id: 'understand', label: 'Understand', re: /\b(explain|summarize|describe|interpret|classify|discuss|paraphrase)\b/, why: 'The objective asks students to explain or interpret meaning.' },
    { id: 'remember', label: 'Remember', re: /\b(identify|list|recall|recognize|define|name|label|select)\b/, why: 'The objective targets recall or recognition of facts.' }
  ];
  for (const lvl of levels) {
    if (lvl.re.test(obj)) return lvl;
  }
  return {
    id: 'understand',
    label: 'Understand',
    why: 'No strong action verb detected. "Understand" is a balanced default; refine the objective with a measurable verb.'
  };
}

/* ================================================================== */
/*  Inline context-aware recommendations                               */
/*  One card at a time · appears under the focused field · Apply/Dismiss */
/* ================================================================== */

/** Map form control IDs → recommendation keys */
const FIELD_TO_REC_KEY = {
  learningObjective: 'learningObjective',
  bloomLevel: 'bloomLevel',
  graphicType: 'graphicType',
  visualStyle: 'visualStyle',
  tone: 'tone',
  colorScheme: 'colorScheme',
  complexity: 'complexity',
  amountOfText: 'amountOfText',
  sizePreset: 'sizePreset',
  orientation: 'orientation',
  fileFormat: 'fileFormat',
  resolution: 'resolution',
  animation: 'animation',
  model: 'model'
};

/** Only one recommendation visible at a time */
let activeInlineRecKey = null;
let dismissedRecKeys = new Set();
/** Remember which field hosted the last card so we can re-attach after soft updates */
let lastRecAnchorSelector = null;

function getRecommendationByKey(key) {
  return getSmartRecommendations().find(r => r.key === key) || null;
}

function clearAllInlineRecs() {
  $$('.inline-rec').forEach(el => el.remove());
  activeInlineRecKey = null;
}

/**
 * Build a compact recommendation card.
 * - Primary message is always visible
 * - "Why?" toggles the explanation (builds trust without clutter)
 * - Apply + Dismiss actions
 */
function showInlineRecommendation(anchorEl, rec) {
  if (!anchorEl || !rec) return;
  if (dismissedRecKeys.has(rec.key)) return;

  clearAllInlineRecs();
  activeInlineRecKey = rec.key;

  const canApply = rec.apply && typeof rec.apply === 'object' && !rec.matches;
  const applied = rec.matches;

  // Remember a selector so soft refreshes can find the host again
  if (anchorEl.id) {
    lastRecAnchorSelector = `#${anchorEl.id}`;
  } else if (anchorEl.dataset) {
    const dataKey = Object.keys(anchorEl.dataset)[0];
    if (dataKey) lastRecAnchorSelector = `[data-${dataKey.replace(/([A-Z])/g, '-$1').toLowerCase()}="${anchorEl.dataset[dataKey]}"]`;
  }

  const card = document.createElement('div');
  card.className = `inline-rec${applied ? ' is-applied' : ''}`;
  card.setAttribute('role', 'status');
  card.setAttribute('aria-live', 'polite');
  card.dataset.recKey = rec.key;

  const whyId = `rec-why-${rec.key}`;
  const hasWhy = Boolean(rec.why);

  card.innerHTML = `
    <div class="inline-rec-header">
      <span class="inline-rec-icon" aria-hidden="true">💡</span>
      <p class="inline-rec-label">AI Recommendation</p>
      ${applied ? '<span class="inline-rec-status" aria-label="Already applied">✓ Applied</span>' : ''}
    </div>
    <p class="inline-rec-value">${escapeHtml(rec.value)}</p>
    ${hasWhy ? `
      <button type="button" class="inline-rec-why-toggle" data-why-toggle aria-expanded="false" aria-controls="${whyId}">
        Why?
      </button>
      <p class="inline-rec-why" id="${whyId}" hidden>${escapeHtml(rec.why)}</p>
    ` : ''}
    <div class="inline-rec-actions">
      ${canApply
        ? `<button type="button" class="btn btn-primary btn-sm" data-inline-apply>Apply Recommendation</button>`
        : ''}
      <button type="button" class="btn btn-ghost btn-sm" data-inline-dismiss>Dismiss</button>
    </div>
  `;

  // Prefer inserting at the end of the nearest field-group so the card sits under the control
  const host =
    anchorEl.closest('.field-group') ||
    anchorEl.closest('.graphic-grid')?.parentElement ||
    anchorEl.closest('.model-grid')?.parentElement ||
    anchorEl.closest('.chip-row')?.parentElement ||
    anchorEl.closest('.checkbox-row')?.parentElement ||
    anchorEl.parentElement;

  if (host) {
    host.appendChild(card);
  } else {
    anchorEl.insertAdjacentElement('afterend', card);
  }

  // Why? toggle
  card.querySelector('[data-why-toggle]')?.addEventListener('click', (e) => {
    const btn = e.currentTarget;
    const whyEl = card.querySelector(`#${whyId}`);
    if (!whyEl) return;
    const open = whyEl.hidden;
    whyEl.hidden = !open;
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.classList.toggle('is-open', open);
  });

  // Apply — update state, refresh UI, toast; recommendation disappears
  card.querySelector('[data-inline-apply]')?.addEventListener('click', () => {
    try {
      const patch = rec.apply;
      if (!patch) return;
      // Mark this key as handled so it doesn't reappear immediately
      dismissedRecKeys.add(rec.key);
      activeInlineRecKey = null;
      commit(patch);
      renderWorkspace();
      showToast('Recommendation applied');
    } catch (err) {
      console.error('Apply recommendation failed', err);
    }
  });

  // Dismiss — hide for this session until context changes meaningfully
  card.querySelector('[data-inline-dismiss]')?.addEventListener('click', () => {
    dismissedRecKeys.add(rec.key);
    card.remove();
    activeInlineRecKey = null;
  });
}

/** Soft-refresh the visible card when state changes without full re-render */
function refreshActiveInlineRec() {
  if (!activeInlineRecKey) return;
  const existing = $(`.inline-rec[data-rec-key="${activeInlineRecKey}"]`);
  if (!existing) return;

  // If user dismissed this key, leave it alone
  if (dismissedRecKeys.has(activeInlineRecKey)) {
    existing.remove();
    activeInlineRecKey = null;
    return;
  }

  const rec = getRecommendationByKey(activeInlineRecKey);
  if (!rec) {
    existing.remove();
    activeInlineRecKey = null;
    return;
  }

  // Update the primary message in place (e.g. as the objective is typed)
  const valueEl = existing.querySelector('.inline-rec-value');
  if (valueEl && valueEl.textContent !== rec.value) {
    valueEl.textContent = rec.value;
  }
  const whyEl = existing.querySelector('.inline-rec-why');
  if (whyEl && rec.why) {
    whyEl.textContent = rec.why;
  }

  // If the recommendation is now matched, show applied state
  if (rec.matches) {
    existing.classList.add('is-applied');
    const applyBtn = existing.querySelector('[data-inline-apply]');
    if (applyBtn) applyBtn.remove();
    if (!existing.querySelector('.inline-rec-status')) {
      const header = existing.querySelector('.inline-rec-header');
      if (header) {
        const badge = document.createElement('span');
        badge.className = 'inline-rec-status';
        badge.setAttribute('aria-label', 'Already applied');
        badge.textContent = '✓ Applied';
        header.appendChild(badge);
      }
    }
  }
}

/**
 * Resolve which recommendation key a focused / clicked element maps to.
 */
function resolveRecKeyFromElement(el) {
  if (!el) return null;

  // Direct ID match (inputs, selects, textareas)
  if (el.id && FIELD_TO_REC_KEY[el.id]) return FIELD_TO_REC_KEY[el.id];

  // data-* attributes on chips / cards
  const dataMap = [
    ['data-graphic', 'graphicType'],
    ['data-visual-style', 'visualStyle'],
    ['data-tone', 'tone'],
    ['data-color', 'colorScheme'],
    ['data-color-scheme', 'colorScheme'],
    ['data-complexity', 'complexity'],
    ['data-amount-of-text', 'amountOfText'],
    ['data-size-preset', 'sizePreset'],
    ['data-orientation', 'orientation'],
    ['data-file-format', 'fileFormat'],
    ['data-resolution', 'resolution'],
    ['data-animation', 'animation'],
    ['data-model', 'model'],
    ['data-icon', 'iconPreferences']
  ];
  for (const [attr, key] of dataMap) {
    if (el.hasAttribute(attr) || el.closest(`[${attr}]`)) return key;
  }

  // Section-level fallbacks
  const section = el.closest('.section');
  if (section) {
    const sid = section.id || '';
    if (sid.includes('graphic')) return 'graphicType';
    if (sid.includes('visual')) return 'visualStyle';
    if (sid.includes('layout')) return 'sizePreset';
    if (sid.includes('output')) return 'fileFormat';
    if (sid.includes('animation')) return 'animation';
    if (sid.includes('accessib')) return 'accessibility';
    if (sid.includes('pedagog')) return 'pedagogical';
    if (sid.includes('model')) return 'model';
    if (sid.includes('content') && !sid.includes('source')) {
      if (el.id === 'learningObjective' || el.closest('label[for="learningObjective"]')) return 'learningObjective';
      if (el.id === 'bloomLevel' || el.closest('label[for="bloomLevel"]')) return 'bloomLevel';
    }
  }

  if (el.name === 'accessibility' || el.closest('#section-accessibility')) return 'accessibility';
  if (el.name === 'pedagogical' || el.closest('#section-pedagogical')) return 'pedagogical';
  if (el.name === 'iconPreferences' || el.closest('[data-group="icons"]')) return 'iconPreferences';

  return null;
}

/** Activate the section that contains the focused element */
function setActiveSection(el) {
  $$('.section.is-active').forEach(s => s.classList.remove('is-active'));
  const section = el?.closest?.('.section');
  if (section) section.classList.add('is-active');
}

let inlineRecFocusBound = false;

function bindInlineRecommendationFocus() {
  const workspace = $('#workspace');
  if (!workspace || inlineRecFocusBound) return;
  inlineRecFocusBound = true;

  const tryShow = (target) => {
    if (!(target instanceof HTMLElement)) return;
    if (target.closest('.inline-rec')) return;

    setActiveSection(target);

    const key = resolveRecKeyFromElement(target);
    if (!key) return;
    if (key === activeInlineRecKey) return;

    const rec = getRecommendationByKey(key);
    if (!rec) return;

    // Always allow learning-objective guidance; other recs need some context
    const hasContext = Boolean(
      state.templateId ||
      state.graphicGoal ||
      state.learningObjective?.trim() ||
      state.topic?.trim() ||
      key === 'learningObjective'
    );
    if (!hasContext) return;

    showInlineRecommendation(target, rec);
  };

  workspace.addEventListener('focusin', (e) => tryShow(e.target));

  workspace.addEventListener('click', (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.closest('.inline-rec')) return;

    // Chips, graphic cards, model cards — may not receive focus in all browsers
    const interactive = target.closest(
      '.chip, .chip-toggle, .goal-chip, .graphic-card, .model-card, .checkbox-label, select, textarea, input'
    );
    if (interactive) tryShow(interactive);
  });
}

const STATIC_FILE_FORMATS = new Set(['png', 'jpg', 'jpeg', 'svg', 'pdf', 'webp']);

function isStaticFormat(fmt) {
  return STATIC_FILE_FORMATS.has((fmt || '').toLowerCase());
}

function renderSectionAnimation() {
  const anim = state.animation || 'none';
  const opts = ANIMATION_OPTIONS.map(o => {
    const active = anim === o.value ? 'is-active' : '';
    return `
      <button type="button" class="chip chip-toggle ${active}" data-animation="${o.value}" aria-pressed="${active ? 'true' : 'false'}" title="${escapeAttr(o.help)}">
        ${escapeHtml(o.label)}
      </button>
    `;
  }).join('');
  const current = ANIMATION_OPTIONS.find(o => o.value === anim);
  const staticFmt = isStaticFormat(state.fileFormat);
  const formatNote = staticFmt
    ? `<p class="guide-hint anim-format-note" role="status" style="margin-top: var(--space-4);">Animation can be previewed here, but it cannot be included in the selected static file format. Choose Interactive HTML to create an animated final product.</p>`
    : '';

  return `
    <section class="section" id="section-animation" aria-labelledby="heading-animation">
      <div class="section-header">
        <h2 id="heading-animation"><span class="section-num">§ 05b</span> Animation</h2>
        <p class="section-desc">optional motion</p>
      </div>
      <p class="guide-question">Step 6: Should the graphic include animation?</p>
      <p class="guide-hint" style="margin-top: 0; margin-bottom: var(--space-4);">Add animation only when it improves learning. This section is optional.</p>
      <div class="chip-row" role="group" aria-label="Animation options">
        ${opts}
      </div>
      ${current ? `<p class="guide-hint" style="margin-top: var(--space-3);">${escapeHtml(current.help)}</p>` : ''}

      <div class="anim-preview-block" style="margin-top: var(--space-5);">
        <div class="field-label" id="anim-preview-label">Animation Preview</div>
        <div class="anim-preview-stage" id="anim-preview-stage" role="img" aria-labelledby="anim-preview-label" aria-live="polite">
          <div class="anim-sample-card" id="anim-sample-card" data-anim="${escapeAttr(anim)}">
            <h3 class="anim-sample-heading" data-anim-part="heading">Water Cycle</h3>
            <div class="anim-sample-visual" data-anim-part="visual" aria-hidden="true">
              <span class="anim-sample-shape"></span>
            </div>
            <p class="anim-sample-text" data-anim-part="text">Evaporation, condensation, and precipitation form a continuous cycle.</p>
            <span class="anim-sample-key" data-anim-part="key">Key concept</span>
          </div>
        </div>
        <button type="button" class="btn btn-secondary btn-sm" id="btn-replay-animation" style="margin-top: var(--space-3);">Replay Animation</button>
      </div>
      ${formatNote}
    </section>
  `;
}

/** Replay the selected animation in the preview card */
function playAnimationPreview() {
  const card = $('#anim-sample-card');
  if (!card) return;

  const anim = state.animation || 'none';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Reset classes
  card.className = 'anim-sample-card';
  card.querySelectorAll('[data-anim-part]').forEach(el => {
    el.className = el.className
      .split(/\s+/)
      .filter(c => c && !c.startsWith('anim-run-') && c !== 'anim-part-hidden')
      .join(' ');
  });

  // Force reflow so animation restarts
  void card.offsetWidth;

  if (anim === 'none' || reduceMotion) {
    card.classList.add('anim-run-none');
    card.setAttribute('aria-label', reduceMotion
      ? 'Animation preview shown without motion because reduced motion is preferred.'
      : 'Animation preview with no animation.');
    return;
  }

  card.classList.add(`anim-run-${anim}`);
  const labels = {
    'fade-in': 'Preview: fade in',
    'step-build': 'Preview: step-by-step build',
    'highlight': 'Preview: highlight important elements',
    'motion-emphasis': 'Preview: motion to emphasize key concept'
  };
  card.setAttribute('aria-label', labels[anim] || 'Animation preview');
}

function renderQuickStart() {
  const buttons = QUICK_STARTS.map(qs => {
    const active = state.templateId === qs.id ? 'is-active' : '';
    return `<button type="button" class="chip chip-quick chip-toggle ${active}" data-quick="${qs.id}" aria-pressed="${state.templateId === qs.id}">${qs.label}</button>`;
  }).join('');

  let activeHint = '';
  let typeDropdown = '';
  if (state.templateId) {
    const qs = QUICK_STARTS.find(q => q.id === state.templateId);
    if (qs) {
      if (qs.hint) {
        activeHint = `<p class="guide-hint quick-start-hint" style="margin-top: var(--space-3); margin-bottom: 0;">${escapeHtml(qs.hint)}</p>`;
      }
      if (qs.typeOptions) {
        const currentVal = state[qs.typeKey] || qs.defaultType;
        const opts = qs.typeOptions.map(o =>
          `<option value="${o.value}" ${currentVal === o.value ? 'selected' : ''}>${o.label}</option>`
        ).join('');
        typeDropdown = `
          <div class="field-group" style="margin-top: var(--space-4); margin-bottom: 0;">
            <label class="field-label" for="template-type">${qs.typeLabel}</label>
            <select id="template-type" class="field-select" data-type-key="${qs.typeKey}" style="max-width: 280px;">
              ${opts}
            </select>
          </div>
        `;
      }
    }
  }

  return `
    <section class="section quick-start" aria-label="Instructional purpose">
      <p class="guide-question">Step 1: What would you like to create?</p>
      <p class="field-label" style="margin-bottom: var(--space-2);">Who is this for?</p>
      <div class="quick-start-row">
        <span class="quick-label">Instructional purpose →</span>
        ${buttons}
      </div>
      ${activeHint}
      ${typeDropdown}
      ${renderQuizSettings()}
      ${renderAssignmentMode()}
      ${renderProgrammingVideoSettings()}
    </section>
  `;
}

function isQuizMode() {
  return state.templateId === 'classroom' && (state.activityType === 'quiz' || (!state.activityType && QUICK_STARTS.find(q => q.id === 'classroom')?.defaultType === 'quiz'));
}

function renderQuizSettings() {
  if (state.templateId !== 'classroom' || state.activityType !== 'quiz') return '';
  const selected = state.quizQuestionTypes || [];
  const checks = QUIZ_QUESTION_TYPES.map(q => {
    const checked = selected.includes(q.id) ? 'checked' : '';
    return `
      <label class="checkbox-label">
        <input type="checkbox" data-quiz-type="${q.id}" ${checked} />
        <span class="checkbox-title">${escapeHtml(q.label)}</span>
      </label>
    `;
  }).join('');
  const count = state.quizQuestionCount || 10;
  return `
    <div class="field-group" id="quiz-settings" style="margin-top: var(--space-5);">
      <p class="field-label">Question Types</p>
      <p class="guide-hint" style="margin-top: 0; margin-bottom: var(--space-3);">Select the question formats to include in this quiz.</p>
      <div class="checkbox-grid">${checks}</div>
      <div class="field-group" style="margin-top: var(--space-4); margin-bottom: 0;">
        <label class="field-label" for="quizQuestionCount">Number of Questions</label>
        <input type="number" id="quizQuestionCount" class="field-input" min="1" max="100" value="${count}" style="max-width: 120px;" />
      </div>
    </div>
  `;
}

function renderAssignmentMode() {
  if (state.templateId !== 'classroom' || state.activityType !== 'assignment') return '';
  const mode = state.assignmentMode || 'printable';
  return `
    <div class="field-group" id="assignment-mode-settings" style="margin-top: var(--space-5);">
      <p class="field-label">Assignment Format</p>
      <p class="guide-hint" style="margin-top: 0; margin-bottom: var(--space-3);">Choose whether students complete a printable assignment or an interactive one.</p>
      <div class="chip-row" role="group" aria-label="Assignment format">
        <button type="button" class="chip chip-toggle ${mode === 'printable' ? 'is-active' : ''}" data-assignment-mode="printable" aria-pressed="${mode === 'printable'}">Printable / Static Assignment</button>
        <button type="button" class="chip chip-toggle ${mode === 'interactive' ? 'is-active' : ''}" data-assignment-mode="interactive" aria-pressed="${mode === 'interactive'}">Interactive Assignment</button>
      </div>
    </div>
  `;
}

function isProgrammingVideo() {
  return state.templateId === 'lecture' && state.outputType === 'programming-video';
}

function selectOpts(list, current) {
  return list.map(o =>
    `<option value="${o.value}" ${current === o.value ? 'selected' : ''}>${escapeHtml(o.label)}</option>`
  ).join('');
}

function renderProgrammingVideoSettings() {
  if (!isProgrammingVideo()) return '';
  const src = state.progCodeSource || 'paste';
  const include = state.progInclude || [];
  const includeChecks = PROG_VIDEO_OPTIONS.include.map(item => {
    const checked = include.includes(item.id) ? 'checked' : '';
    return `
      <label class="checkbox-label">
        <input type="checkbox" data-prog-include="${item.id}" ${checked} />
        <span class="checkbox-title">${escapeHtml(item.label)}</span>
      </label>
    `;
  }).join('');
  const code = state.progSourceCode || '';
  const fileName = state.progCodeFileName || '';
  const langClass = `lang-${state.progLanguage || 'java'}`;

  return `
    <div class="field-group prog-video-settings" id="prog-video-settings" style="margin-top: var(--space-5);">
      <p class="field-label">Programming Video Settings</p>
      <p class="guide-hint" style="margin-top: 0; margin-bottom: var(--space-4);">Upload or paste your source code exactly as students should see it. The toolkit never rewrites code.</p>

      <p class="field-label">Source Code</p>
      <div class="chip-row" role="group" aria-label="Source code input method" style="margin-bottom: var(--space-3);">
        <button type="button" class="chip chip-toggle ${src === 'upload' ? 'is-active' : ''}" data-prog-source="upload" aria-pressed="${src === 'upload'}">Upload Source Code</button>
        <button type="button" class="chip chip-toggle ${src === 'paste' ? 'is-active' : ''}" data-prog-source="paste" aria-pressed="${src === 'paste'}">Paste Source Code</button>
      </div>

      ${src === 'upload' ? `
        <div class="field-group" style="margin-bottom: var(--space-3);">
          <label class="field-label" for="prog-code-file">Choose a source file</label>
          <p class="guide-hint" style="margin-top: 0; margin-bottom: var(--space-2);">Supported: .java, .cpp, .py, .js, .sql, .txt</p>
          <input type="file" id="prog-code-file" class="field-input" accept=".java,.cpp,.cc,.cxx,.py,.js,.mjs,.cjs,.sql,.txt,.cs,text/plain" />
          ${fileName ? `<p class="guide-hint" style="margin-top: var(--space-2);">Selected: <strong>${escapeHtml(fileName)}</strong></p>` : ''}
        </div>
      ` : `
        <div class="field-group" style="margin-bottom: var(--space-3);">
          <label class="field-label" for="progSourceCode">Paste source code</label>
          <textarea id="progSourceCode" class="field-textarea code-textarea" rows="12" spellcheck="false" placeholder="Paste your program here. Formatting, indentation, and comments are preserved exactly.">${escapeHtml(code)}</textarea>
        </div>
      `}

      ${code ? `
        <div class="field-group" style="margin-bottom: var(--space-4);">
          <p class="field-label">Code Preview</p>
          <pre class="code-preview ${langClass}" id="prog-code-preview" aria-label="Syntax-highlighted source code preview"><code>${escapeHtml(code)}</code></pre>
        </div>
      ` : ''}

      <div class="field-grid field-grid-2">
        <div class="field-group">
          <label class="field-label" for="progLanguage">Programming Language</label>
          <select id="progLanguage" class="field-select">${selectOpts(PROG_VIDEO_OPTIONS.language, state.progLanguage || 'java')}</select>
        </div>
        <div class="field-group">
          <label class="field-label" for="progCourseName">Course Name</label>
          <input type="text" id="progCourseName" class="field-input" placeholder="e.g. CIT 130 – Introduction to Java" value="${escapeHtml(state.progCourseName || '')}" />
        </div>
        <div class="field-group">
          <label class="field-label" for="progAudienceLevel">Audience</label>
          <select id="progAudienceLevel" class="field-select">${selectOpts(PROG_VIDEO_OPTIONS.audience, state.progAudienceLevel || 'beginner')}</select>
        </div>
        <div class="field-group">
          <label class="field-label" for="progVideoLength">Video Length</label>
          <select id="progVideoLength" class="field-select">${selectOpts(PROG_VIDEO_OPTIONS.videoLength, state.progVideoLength || '5-8')}</select>
        </div>
        <div class="field-group">
          <label class="field-label" for="progPresenter">Presenter</label>
          <select id="progPresenter" class="field-select">${selectOpts(PROG_VIDEO_OPTIONS.presenter, state.progPresenter || 'female')}</select>
        </div>
        <div class="field-group">
          <label class="field-label" for="progPresentationStyle">Presentation Style</label>
          <select id="progPresentationStyle" class="field-select">${selectOpts(PROG_VIDEO_OPTIONS.presentationStyle, state.progPresentationStyle || 'split-screen')}</select>
        </div>
        <div class="field-group">
          <label class="field-label" for="progCodeAnimation">Code Animation</label>
          <select id="progCodeAnimation" class="field-select">${selectOpts(PROG_VIDEO_OPTIONS.codeAnimation, state.progCodeAnimation || 'type-line-by-line')}</select>
        </div>
        <div class="field-group">
          <label class="field-label" for="progExplanationStyle">Explanation Style</label>
          <select id="progExplanationStyle" class="field-select">${selectOpts(PROG_VIDEO_OPTIONS.explanationStyle, state.progExplanationStyle || 'detailed-walkthrough')}</select>
        </div>
      </div>

      <div class="field-group" style="margin-top: var(--space-4);">
        <p class="field-label">Include</p>
        <div class="checkbox-grid">${includeChecks}</div>
      </div>
    </div>
  `;
}

function renderSectionContent() {
  const subjectOpts = OPTIONS.subjectArea.map(o =>
    `<option value="${o.value}" ${state.subjectArea === o.value ? 'selected' : ''}>${o.label}</option>`
  ).join('');
  const gradeOpts = OPTIONS.gradeLevel.map(o =>
    `<option value="${o.value}" ${state.gradeLevel === o.value ? 'selected' : ''}>${o.label}</option>`
  ).join('');
  const recommendedBloom = inferBloomFromObjective(state.learningObjective || '').id;
  const bloomOpts = OPTIONS.bloomLevel.map(o => {
    const selected = state.bloomLevel === o.value ? 'selected' : '';
    const star = (recommendedBloom && o.value === recommendedBloom && state.bloomLevel !== o.value)
      ? ' ★ recommended'
      : '';
    return `<option value="${o.value}" ${selected}>${o.label}${star}</option>`;
  }).join('');

  return `
    <section class="section" id="section-content" aria-labelledby="heading-content">
      <div class="section-header">
        <h2 id="heading-content"><span class="section-num">§ 01</span> Content</h2>
        <p class="section-desc">what is being taught</p>
      </div>

      <div class="field-group">
        <label class="field-label" for="topic">Topic or Lesson Title <span class="req" aria-hidden="true">*</span></label>
        <input type="text" id="topic" class="field-input"
               placeholder="e.g., SQL Joins, OSI Model Layers, Mitochondrial Respiration"
               value="${escapeAttr(state.topic)}" autocomplete="off" />
      </div>

      <div class="field-row">
        <div class="field-group">
          <label class="field-label" for="subjectArea">Subject Area</label>
          <select id="subjectArea" class="field-select">${subjectOpts}</select>
        </div>
        <div class="field-group">
          <label class="field-label" for="gradeLevel">Grade / Skill Level</label>
          <select id="gradeLevel" class="field-select">${gradeOpts}</select>
        </div>
      </div>

      <div class="field-group">
        <label class="field-label" for="audience">Audience</label>
        <input type="text" id="audience" class="field-input"
               placeholder="e.g., 10th-grade biology students, adult professional learners"
               value="${escapeAttr(state.audience)}" />
      </div>

      <div class="field-group">
        <p class="guide-question guide-question-inline">Step 2: What do you want students to learn?</p>
        <label class="field-label" for="learningObjective">Learning Objective</label>
        <textarea id="learningObjective" class="field-textarea" rows="2"
                  placeholder="By the end of viewing this graphic, the learner will be able to…">${escapeHtml(state.learningObjective)}</textarea>
      </div>

      <div class="field-group">
        <label class="field-label" for="bloomLevel">Bloom's Taxonomy Level</label>
        <select id="bloomLevel" class="field-select">${bloomOpts}</select>
      </div>
    </section>
  `;
}

/** Resolve recommended graphic types for current goal + quick-start template */
function getRecommendedGraphics() {
  if (!state.graphicGoal || state.graphicGoal === 'all' || state.showAllGraphics) {
    return null;
  }
  const goal = GRAPHIC_GOALS.find(g => g.id === state.graphicGoal);
  if (!goal) return null;
  const recs = goal.recommendations || {};
  const list = (state.templateId && recs[state.templateId]) || recs.default || [];
  return list.map(item => {
    const graphic = GRAPHIC_TYPES.find(g => g.id === item.id);
    return graphic ? { ...graphic, why: item.why } : null;
  }).filter(Boolean);
}

function renderGraphicCard(g, extraDesc = '') {
  const selected = state.graphicType === g.id ? 'is-selected' : '';
  const aiRec = inferGraphicFromObjective(
    state.learningObjective || '',
    state.bloomLevel || '',
    getSubtype()
  );
  const isAiRecommended = aiRec?.primary?.id === g.id && state.graphicType !== g.id;
  const whyBlock = extraDesc
    ? `<span class="graphic-why">${escapeHtml(extraDesc)}</span>`
    : `<span class="graphic-desc">${escapeHtml(g.description)}</span>`;
  return `
    <button type="button" class="graphic-card ${selected}${isAiRecommended ? ' is-ai-recommended' : ''}" data-graphic="${g.id}"
            aria-pressed="${state.graphicType === g.id}" title="${escapeAttr(g.description)}">
      <span class="graphic-title">${g.title}${isAiRecommended ? ' <span class="ai-rec-badge">AI pick</span>' : ''}</span>
      <span class="graphic-subtitle">${g.subtitle}</span>
      ${whyBlock}
    </button>
  `;
}

function renderSectionGraphicType() {
  const goals = GRAPHIC_GOALS.map(goal => {
    const active = state.graphicGoal === goal.id || (goal.id === 'all' && state.showAllGraphics) ? 'is-active' : '';
    return `
      <button type="button" class="chip chip-toggle goal-chip ${active}" data-goal="${goal.id}"
              aria-pressed="${active ? 'true' : 'false'}">${goal.label}</button>
    `;
  }).join('');

  let body = '';
  const showAll = state.showAllGraphics || state.graphicGoal === 'all';
  const recommended = getRecommendedGraphics();

  if (!state.graphicGoal && !showAll) {
    body = `
      <p class="guide-hint">Choose a learning goal above. We’ll suggest the 2–3 graphic types that fit best${state.templateId ? ' for your selected quick start' : ''}.</p>
    `;
  } else if (showAll) {
    const cards = GRAPHIC_TYPES.map(g => renderGraphicCard(g)).join('');
    body = `
      <div class="guide-step-label">All graphic types</div>
      <div class="graphic-grid" role="group" aria-label="All graphic types">
        ${cards}
      </div>
      <p class="guide-back-row">
        <button type="button" class="btn btn-ghost btn-sm" id="btn-back-to-goals">← Back to goals</button>
      </p>
    `;
  } else if (recommended && recommended.length) {
    const cards = recommended.map(g => renderGraphicCard(g, g.why)).join('');
    const goalLabel = GRAPHIC_GOALS.find(g => g.id === state.graphicGoal)?.label || '';
    body = `
      <div class="guide-step-label">Recommended for: <em>${escapeHtml(goalLabel)}</em></div>
      <div class="graphic-grid graphic-grid-recommended" role="group" aria-label="Recommended graphic types">
        ${cards}
      </div>
      <p class="guide-back-row">
        <button type="button" class="btn btn-ghost btn-sm" id="btn-show-all-graphics">Show all graphic types</button>
        <button type="button" class="btn btn-ghost btn-sm" id="btn-back-to-goals">← Change goal</button>
      </p>
    `;
  }

  return `
    <section class="section" id="section-graphic-type" aria-labelledby="heading-graphic">
      <div class="section-header">
        <h2 id="heading-graphic"><span class="section-num">§ 02</span> Graphic Type</h2>
        <p class="section-desc">how the information is shaped</p>
      </div>
      <p class="guide-question">Step 3: How would you like to present this information visually?</p>
      <div class="chip-row goal-row" role="group" aria-label="Learning goal">
        ${goals}
      </div>
      ${body}
    </section>
  `;
}

function renderSectionVisuals() {
  const styleOpts = OPTIONS.visualStyle.map(o =>
    `<option value="${o.value}" ${state.visualStyle === o.value ? 'selected' : ''}>${o.label}</option>`
  ).join('');
  const toneOpts = OPTIONS.tone.map(o =>
    `<option value="${o.value}" ${state.tone === o.value ? 'selected' : ''}>${o.label}</option>`
  ).join('');
  const colorOpts = OPTIONS.colorScheme.map(o =>
    `<option value="${o.value}" ${state.colorScheme === o.value ? 'selected' : ''}>${o.label}</option>`
  ).join('');
  const complexOpts = OPTIONS.complexity.map(o =>
    `<option value="${o.value}" ${state.complexity === o.value ? 'selected' : ''}>${o.label}</option>`
  ).join('');

  const iconChips = ICON_PREFERENCES.map(p => {
    const active = (state.iconPreferences || []).includes(p.id) ? 'is-active' : '';
    return `<button type="button" class="chip chip-toggle ${active}" data-icon="${p.id}" aria-pressed="${active ? 'true' : 'false'}">${p.label}</button>`;
  }).join('');

  return `
    <section class="section" id="section-visuals" aria-labelledby="heading-visuals">
      <div class="section-header">
        <h2 id="heading-visuals"><span class="section-num">§ 03</span> Visuals</h2>
        <p class="section-desc">appearance of the graphic</p>
      </div>
      <p class="guide-question">Step 4: How should the graphic look?</p>

      <div class="field-row">
        <div class="field-group">
          <label class="field-label" for="visualStyle">Visual Style</label>
          <select id="visualStyle" class="field-select">${styleOpts}</select>
        </div>
        <div class="field-group">
          <label class="field-label" for="tone">Tone</label>
          <select id="tone" class="field-select">${toneOpts}</select>
        </div>
      </div>

      <div class="field-row">
        <div class="field-group">
          <label class="field-label" for="colorScheme">Color Palette</label>
          <select id="colorScheme" class="field-select">${colorOpts}</select>
        </div>
        <div class="field-group">
          <label class="field-label" for="complexity">Complexity / Density</label>
          <select id="complexity" class="field-select">${complexOpts}</select>
        </div>
      </div>

      <div class="field-group">
        <span class="field-label" id="icon-pref-label">Visual Elements</span>
        <p class="guide-hint" style="margin-top: 0; margin-bottom: var(--space-3);">What kinds of visuals would you like the AI to include?</p>
        <div class="chip-row" role="group" aria-labelledby="icon-pref-label">
          ${iconChips}
        </div>
      </div>
    </section>
  `;
}

function renderSectionLayout() {
  const sizeOpts = OPTIONS.sizePreset.map(o =>
    `<option value="${o.value}" ${state.sizePreset === o.value ? 'selected' : ''}>${o.label}</option>`
  ).join('');
  const orientOpts = OPTIONS.orientation.map(o =>
    `<option value="${o.value}" ${state.orientation === o.value ? 'selected' : ''}>${o.label}</option>`
  ).join('');
  const textOpts = OPTIONS.amountOfText.map(o =>
    `<option value="${o.value}" ${state.amountOfText === o.value ? 'selected' : ''}>${o.label}</option>`
  ).join('');

  return `
    <section class="section" id="section-layout" aria-labelledby="heading-layout">
      <div class="section-header">
        <h2 id="heading-layout"><span class="section-num">§ 04</span> Layout &amp; Image Size</h2>
        <p class="section-desc">physical &amp; spatial form</p>
      </div>
      <p class="guide-question">Step 5: How should your graphic be laid out?</p>

      <div class="field-group">
        <label class="field-label" for="sizePreset">Size Preset</label>
        <p class="guide-hint" style="margin-top: 0; margin-bottom: var(--space-2);">Choose the size that matches where your graphic will be used.</p>
        <select id="sizePreset" class="field-select">${sizeOpts}</select>
      </div>

      <div class="field-row">
        <div class="field-group">
          <label class="field-label" for="orientation">Orientation</label>
          <p class="guide-hint" style="margin-top: 0; margin-bottom: var(--space-2);">How should the graphic be displayed?</p>
          <select id="orientation" class="field-select">${orientOpts}</select>
        </div>
        <div class="field-group">
          <label class="field-label" for="amountOfText">Amount of Text</label>
          <p class="guide-hint" style="margin-top: 0; margin-bottom: var(--space-2);">How much information should appear on the graphic?</p>
          <select id="amountOfText" class="field-select">${textOpts}</select>
        </div>
      </div>
    </section>
  `;
}

function renderSectionOutput() {
  const formatOpts = OPTIONS.fileFormat.map(o =>
    `<option value="${o.value}" ${state.fileFormat === o.value ? 'selected' : ''}>${o.label}</option>`
  ).join('');
  const resOpts = OPTIONS.resolution.map(o =>
    `<option value="${o.value}" ${state.resolution === o.value ? 'selected' : ''}>${o.label}</option>`
  ).join('');

  return `
    <section class="section" id="section-output" aria-labelledby="heading-output">
      <div class="section-header">
        <h2 id="heading-output"><span class="section-num">§ 05</span> Output Format</h2>
        <p class="section-desc">How would you like to receive the finished graphic?</p>
      </div>

      <div class="field-row">
        <div class="field-group">
          <label class="field-label" for="fileFormat">File Format</label>
          <p class="guide-hint" style="margin-top: 0; margin-bottom: var(--space-2);">Choose the format that best matches how you will use your graphic.</p>
          <select id="fileFormat" class="field-select">${formatOpts}</select>
        </div>
        <div class="field-group">
          <label class="field-label" for="resolution">Resolution</label>
          <p class="guide-hint" style="margin-top: 0; margin-bottom: var(--space-2);">How sharp should the graphic be?</p>
          <select id="resolution" class="field-select">${resOpts}</select>
        </div>
      </div>

      <div class="checkbox-row">
        <label class="checkbox-label">
          <input type="checkbox" id="transparentBg" ${state.transparentBg ? 'checked' : ''} />
          <span>
            <span class="checkbox-title">Transparent background</span>
            <span class="checkbox-help">Allows the graphic to blend into slides or colored backgrounds.</span>
          </span>
        </label>
        <label class="checkbox-label">
          <input type="checkbox" id="safeMargins" ${state.safeMargins ? 'checked' : ''} />
          <span>
            <span class="checkbox-title">Include print-safe margins</span>
            <span class="checkbox-help">Prevents important text and graphics from being cut off during printing.</span>
          </span>
        </label>
      </div>
    </section>
  `;
}

function renderSectionAccessibility() {
  const checks = ACCESSIBILITY.map(p => {
    const checked = (state.accessibility || []).includes(p.id) ? 'checked' : '';
    const help = p.help ? `<span class="checkbox-help">${escapeHtml(p.help)}</span>` : '';
    return `
      <label class="checkbox-label">
        <input type="checkbox" data-a11y="${p.id}" ${checked} />
        <span>
          <span class="checkbox-title">${escapeHtml(p.label)}</span>
          ${help}
        </span>
      </label>
    `;
  }).join('');

  return `
    <section class="section" id="section-accessibility" aria-labelledby="heading-a11y">
      <div class="section-header">
        <h2 id="heading-a11y"><span class="section-num">§ 06</span> Accessibility</h2>
        <p class="section-desc">inclusive design</p>
      </div>
      <p class="guide-question">Step 7: How should your graphic support accessibility?</p>
      <p class="guide-hint" style="margin-top: 0; margin-bottom: var(--space-4);">Select the accessibility features you want included in your graphic.</p>
      <div class="checkbox-grid">
        ${checks}
      </div>
    </section>
  `;
}

function renderSectionPedagogical() {
  const checks = PEDAGOGICAL.map(p => {
    const checked = (state.pedagogical || []).includes(p.id) ? 'checked' : '';
    const help = p.help ? `<span class="checkbox-help">${escapeHtml(p.help)}</span>` : '';
    return `
      <label class="checkbox-label">
        <input type="checkbox" data-pedagogical="${p.id}" ${checked} />
        <span>
          <span class="checkbox-title">${escapeHtml(p.label)}</span>
          ${help}
        </span>
      </label>
    `;
  }).join('');

  return `
    <section class="section" id="section-pedagogical" aria-labelledby="heading-pedagogical">
      <div class="section-header">
        <h2 id="heading-pedagogical"><span class="section-num">§ 07</span> Pedagogical Constraints</h2>
        <p class="section-desc">rigor &amp; learning design</p>
      </div>
      <p class="guide-question">Step 8: What teaching principles should the graphic follow?</p>
      <p class="guide-hint" style="margin-top: 0; margin-bottom: var(--space-4);">Select any instructional guidelines you want the AI to follow.</p>
      <div class="checkbox-grid">
        ${checks}
      </div>
    </section>
  `;
}

function renderSectionModel() {
  const modelButtons = MODELS.map(m => {
    const active = state.model === m.id ? 'is-active' : '';
    return `
      <button type="button" class="model-card ${active}" data-model="${m.id}" aria-pressed="${state.model === m.id}">
        <span class="model-name">${m.name}</span>
        <span class="model-tagline">${m.tagline}</span>
      </button>
    `;
  }).join('');

  return `
    <section class="section" id="section-model" aria-labelledby="heading-model">
      <div class="section-header">
        <h2 id="heading-model"><span class="section-num">§ 08</span> Target Model</h2>
        <p class="section-desc">tailored phrasing</p>
      </div>
      <p class="guide-question">Step 9: Which AI model will generate your graphic?</p>
      <p class="guide-hint" style="margin-top: 0; margin-bottom: var(--space-4);">Choose the AI model you plan to use. Each model performs best with slightly different prompt styles.</p>
      <div class="model-grid" role="group" aria-label="Select target AI model">
        ${modelButtons}
      </div>
    </section>
  `;
}

function renderSectionNotes() {
  return `
    <section class="section" id="section-notes" aria-labelledby="heading-notes">
      <div class="section-header">
        <h2 id="heading-notes"><span class="section-num">§ 09</span> Additional Instructions</h2>
        <p class="section-desc">optional free-form guidance</p>
      </div>
      <p class="guide-question">Step 10: Anything else the AI should know?</p>
      <p class="guide-hint" style="margin-top: 0; margin-bottom: var(--space-3);">Add any special requirements not covered above.</p>
      <div class="field-group">
        <label class="field-label" for="extraNotes">Extra instructions or constraints</label>
        <textarea id="extraNotes" class="field-textarea" rows="3"
                  placeholder="Examples: school branding, instructor notes, required terminology, examples to include, topics to avoid, accessibility requirements, or other custom instructions.">${escapeHtml(state.extraNotes || '')}</textarea>
      </div>
    </section>
  `;
}

function renderPresetBar() {
  const presets = loadPresets();
  const activeId = state.activePresetId || '';
  const hasActive = Boolean(activeId && presets.some(p => p.id === activeId));
  const options = presets.map(p =>
    `<option value="${p.id}" ${p.id === activeId ? 'selected' : ''}>${escapeHtml(p.name)}</option>`
  ).join('');

  return `
    <section class="section preset-bar" aria-label="Presets">
      <div class="preset-controls">
        <button type="button" class="btn btn-secondary" id="btn-save-preset">Save As New</button>
        <div class="preset-load-group">
          <label class="visually-hidden" for="preset-select">Load preset</label>
          <select id="preset-select" class="field-select">
            <option value="">— Load Preset —</option>
            ${options}
          </select>
          <button type="button" class="btn btn-secondary btn-sm" id="btn-update-preset" title="Update selected preset" ${hasActive ? '' : 'disabled'}>Update</button>
          <button type="button" class="btn btn-ghost btn-sm" id="btn-delete-preset" title="Delete selected preset" ${hasActive ? '' : 'disabled'}>Delete</button>
        </div>
      </div>
    </section>
  `;
}

/* ================================================================== */
/*  Event binding                                                      */
/* ================================================================== */

function bindGlobalEvents() {
  $('#btn-theme')?.addEventListener('click', () => {
    const next = state.theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    commit({ theme: next });
  });

  $('#btn-copy')?.addEventListener('click', async () => {
    const text = buildPrompt(state);
    const ok = await copyToClipboard(text);
    showToast(ok ? 'Copied to clipboard' : 'Copy failed — select and copy manually');
  });

  $('#btn-download')?.addEventListener('click', () => {
    const text = buildPrompt(state);
    const safeName = (state.topic || 'instructional-graphic-prompt')
      .slice(0, 40)
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .toLowerCase() || 'prompt';
    downloadText(`${safeName}.txt`, text);
    showToast('Download started');
  });

  $('#btn-reset')?.addEventListener('click', () => {
    if (!confirm('Reset all fields to defaults? This cannot be undone.')) return;
    state = { ...DEFAULT_STATE, theme: state.theme };
    dismissedRecKeys = new Set();
    activeInlineRecKey = null;
    saveSettings(state);
    renderWorkspace();
    updatePromptPreview();
    updateStatus();
    showToast('Reset to defaults');
  });

  $$('[data-close-modal]').forEach(el => {
    el.addEventListener('click', closePresetModal);
  });

  $('#btn-confirm-save-preset')?.addEventListener('click', () => {
    const name = ($('#preset-name')?.value || '').trim();
    if (!name) {
      showToast('Please enter a preset name');
      return;
    }
    const saved = upsertPreset(name, { ...state, activePresetId: null }, null);
    state = { ...state, activePresetId: saved.id };
    saveSettings(state);
    closePresetModal();
    renderWorkspace();
    // Force dropdown selection after DOM rebuild
    requestAnimationFrame(() => {
      const sel = $('#preset-select');
      if (sel) sel.value = saved.id;
    });
    showToast(`Preset “${name}” saved`);
  });

  // Escape closes modal
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      const modal = $('#preset-modal');
      if (modal && !modal.hidden) closePresetModal();
    }
  });
}

function bindSectionEvents() {
  // Content source
  $$('[data-content-source]').forEach(btn => {
    btn.addEventListener('click', () => {
      const src = btn.dataset.contentSource;
      commit({
        contentSource: src,
        uploadedFileName: src === 'manual' ? '' : state.uploadedFileName,
        extractedContent: src === 'manual' ? '' : state.extractedContent
      });
      renderWorkspace();
    });
  });

  const fileInput = $('#content-file');
  if (fileInput) {
    fileInput.addEventListener('change', async () => {
      const file = fileInput.files && fileInput.files[0];
      if (!file) return;
      const name = file.name;
      const lower = name.toLowerCase();
      let extracted = '';
      try {
        if (/\.(txt|md|html|htm)$/i.test(lower) || file.type.startsWith('text/')) {
          extracted = await file.text();
          // Light auto-fill from first lines if topic empty
          const lines = extracted.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
          const updates = {
            contentSource: 'file',
            uploadedFileName: name,
            extractedContent: extracted.slice(0, 8000)
          };
          if (!state.topic && lines[0]) {
            updates.topic = lines[0].replace(/^#+\s*/, '').slice(0, 120);
          }
          if (!state.learningObjective) {
            const objLine = lines.find(l => /objective|students will|learners will/i.test(l));
            if (objLine) updates.learningObjective = objLine.slice(0, 240);
          }
          commit(updates);
        } else {
          commit({
            contentSource: 'file',
            uploadedFileName: name,
            extractedContent: ''
          });
        }
      } catch (err) {
        commit({ contentSource: 'file', uploadedFileName: name, extractedContent: '' });
      }
      renderWorkspace();
      showToast(`File “${name}” added`);
    });
  }

  // Animation
  $$('[data-animation]').forEach(btn => {
    btn.addEventListener('click', () => {
      commit({ animation: btn.dataset.animation });
      // Update active chip state without full re-render when possible
      $$('[data-animation]').forEach(b => {
        const on = b.dataset.animation === state.animation;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      const helpEl = btn.closest('.section')?.querySelector('.guide-hint');
      const current = ANIMATION_OPTIONS.find(o => o.value === state.animation);
      // Update format note visibility if present
      const note = $('#section-animation .anim-format-note');
      if (note) {
        note.hidden = !isStaticFormat(state.fileFormat);
      }
      playAnimationPreview();
    });
  });

  $('#btn-replay-animation')?.addEventListener('click', () => {
    playAnimationPreview();
  });

  // Initial preview play after section render
  if ($('#anim-sample-card')) {
    requestAnimationFrame(() => playAnimationPreview());
  }

  // Quick starts — set template + default type, apply preset values
  $$('[data-quick]').forEach(btn => {
    btn.addEventListener('click', () => {
      const qs = QUICK_STARTS.find(q => q.id === btn.dataset.quick);
      if (!qs) return;
      const alreadyActive = state.templateId === qs.id;
      if (alreadyActive) {
        commit({
          templateId: null,
          activityType: '',
          outputType: '',
          trainingType: '',
          summaryType: ''
        });
      } else {
        const typeUpdate = {};
        typeUpdate[qs.typeKey] = qs.defaultType;
        commit({
          ...qs.values,
          templateId: qs.id,
          activityType: '',
          outputType: '',
          trainingType: '',
          summaryType: '',
          ...typeUpdate
        });
      }
      renderWorkspace();
      showToast(alreadyActive ? 'Cleared template' : `Applied “${qs.label}” template`);
    });
  });

  // Template type dropdown (Activity Type / Output Type / etc.)
  const typeSelect = $('#template-type');
  if (typeSelect) {
    typeSelect.addEventListener('change', () => {
      const key = typeSelect.dataset.typeKey;
      if (!key) return;
      commit({ [key]: typeSelect.value });
      // Re-render so quiz settings and recommendations stay in sync
      renderWorkspace();
    });
  }

  // Quiz question types (Classroom Activity → Quiz only)
  $$('[data-quiz-type]').forEach(cb => {
    cb.addEventListener('change', () => {
      const id = cb.dataset.quizType;
      let list = [...(state.quizQuestionTypes || [])];
      if (cb.checked) {
        if (!list.includes(id)) list.push(id);
      } else {
        list = list.filter(x => x !== id);
      }
      commit({ quizQuestionTypes: list });
    });
  });

  $('#quizQuestionCount')?.addEventListener('input', e => {
    const n = Math.max(1, Math.min(100, parseInt(e.target.value, 10) || 10));
    commit({ quizQuestionCount: n });
  });

  $$('[data-assignment-mode]').forEach(btn => {
    btn.addEventListener('click', () => {
      commit({ assignmentMode: btn.dataset.assignmentMode });
      renderWorkspace();
    });
  });

  // Programming Video settings
  $$('[data-prog-source]').forEach(btn => {
    btn.addEventListener('click', () => {
      commit({ progCodeSource: btn.dataset.progSource });
      renderWorkspace();
    });
  });

  $('#prog-code-file')?.addEventListener('change', async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const lower = file.name.toLowerCase();
      let lang = state.progLanguage || 'java';
      if (lower.endsWith('.java')) lang = 'java';
      else if (/\.(cpp|cc|cxx)$/.test(lower)) lang = 'cpp';
      else if (lower.endsWith('.py')) lang = 'python';
      else if (/\.(js|mjs|cjs)$/.test(lower)) lang = 'javascript';
      else if (lower.endsWith('.sql')) lang = 'sql';
      else if (lower.endsWith('.cs')) lang = 'csharp';
      commit({
        progCodeSource: 'upload',
        progCodeFileName: file.name,
        progSourceCode: text,
        progLanguage: lang
      });
      renderWorkspace();
      showToast(`Loaded “${file.name}”`);
    } catch (err) {
      showToast('Could not read that file');
    }
  });

  $$('[data-prog-include]').forEach(cb => {
    cb.addEventListener('change', () => {
      const id = cb.dataset.progInclude;
      let list = [...(state.progInclude || [])];
      if (cb.checked) {
        if (!list.includes(id)) list.push(id);
      } else {
        list = list.filter(x => x !== id);
      }
      commit({ progInclude: list });
    });
  });

  // Text inputs & textareas
  ['topic', 'audience', 'learningObjective', 'extraNotes', 'progCourseName'].forEach(id => {
    const el = $(`#${id}`);
    if (!el) return;
    el.addEventListener('input', () => commit({ [id]: el.value }));
  });

  // Source code paste — preserve exact content; update preview without full re-render
  const progCodeArea = $('#progSourceCode');
  if (progCodeArea) {
    progCodeArea.addEventListener('input', () => {
      const val = progCodeArea.value;
      commit({ progSourceCode: val, progCodeSource: 'paste' });
      const preview = $('#prog-code-preview code');
      if (preview) {
        preview.textContent = val;
      } else if (val) {
        // Preview not in DOM yet — light refresh
        renderWorkspace();
      }
    });
  }

  // Selects
  [
    'subjectArea', 'gradeLevel', 'bloomLevel', 'visualStyle', 'tone',
    'colorScheme', 'complexity', 'sizePreset', 'orientation',
    'amountOfText', 'fileFormat', 'resolution',
    'progLanguage', 'progAudienceLevel', 'progVideoLength',
    'progPresenter', 'progPresentationStyle', 'progCodeAnimation', 'progExplanationStyle'
  ].forEach(id => {
    const el = $(`#${id}`);
    if (!el) return;
    el.addEventListener('change', () => {
      commit({ [id]: el.value });
      if (id === 'fileFormat') {
        // Refresh animation format note without full re-render
        const section = $('#section-animation');
        if (section) {
          let note = section.querySelector('.anim-format-note');
          const needsNote = isStaticFormat(state.fileFormat);
          if (needsNote && !note) {
            note = document.createElement('p');
            note.className = 'guide-hint anim-format-note';
            note.setAttribute('role', 'status');
            note.style.marginTop = 'var(--space-4)';
            note.textContent = 'Animation can be previewed here, but it cannot be included in the selected static file format. Choose Interactive HTML to create an animated final product.';
            section.appendChild(note);
          } else if (note) {
            note.hidden = !needsNote;
          }
        }
      }
    });
  });

  // Output checkboxes
  $('#transparentBg')?.addEventListener('change', e => commit({ transparentBg: e.target.checked }));
  $('#safeMargins')?.addEventListener('change', e => commit({ safeMargins: e.target.checked }));

  // Accessibility checkboxes
  $$('[data-a11y]').forEach(cb => {
    cb.addEventListener('change', () => {
      const id = cb.dataset.a11y;
      let list = [...(state.accessibility || [])];
      if (cb.checked) {
        if (!list.includes(id)) list.push(id);
      } else {
        list = list.filter(x => x !== id);
      }
      commit({ accessibility: list });
    });
  });

  // Pedagogical checkboxes
  $$('[data-pedagogical]').forEach(cb => {
    cb.addEventListener('change', () => {
      const id = cb.dataset.pedagogical;
      let list = [...(state.pedagogical || [])];
      if (cb.checked) {
        if (!list.includes(id)) list.push(id);
      } else {
        list = list.filter(x => x !== id);
      }
      commit({ pedagogical: list });
    });
  });

  // Guided goals (wizard step for graphic type)
  $$('[data-goal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.goal;
      if (id === 'all') {
        commit({ graphicGoal: 'all', showAllGraphics: true, graphicType: null });
      } else if (state.graphicGoal === id) {
        commit({ graphicGoal: null, showAllGraphics: false, graphicType: null });
      } else {
        commit({ graphicGoal: id, showAllGraphics: false, graphicType: null });
      }
      renderWorkspace();
    });
  });

  $('#btn-show-all-graphics')?.addEventListener('click', () => {
    commit({ showAllGraphics: true, graphicGoal: 'all' });
    renderWorkspace();
  });

  $('#btn-back-to-goals')?.addEventListener('click', () => {
    commit({ graphicGoal: null, showAllGraphics: false, graphicType: null });
    renderWorkspace();
  });

  // Graphic type cards
  $$('[data-graphic]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.graphic;
      commit({ graphicType: state.graphicType === id ? null : id });
      $$('[data-graphic]').forEach(b => {
        const selected = b.dataset.graphic === state.graphicType;
        b.classList.toggle('is-selected', selected);
        b.setAttribute('aria-pressed', selected);
      });
    });
  });

  // Icon preference chips
  $$('[data-icon]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.icon;
      let list = [...(state.iconPreferences || [])];
      if (list.includes(id)) {
        list = list.filter(x => x !== id);
      } else {
        list.push(id);
      }
      commit({ iconPreferences: list });
      btn.classList.toggle('is-active');
      btn.setAttribute('aria-pressed', list.includes(id));
    });
  });

  // Model cards
  $$('[data-model]').forEach(btn => {
    btn.addEventListener('click', () => {
      commit({ model: btn.dataset.model });
      $$('[data-model]').forEach(b => {
        const active = b.dataset.model === state.model;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-pressed', active);
      });
      updateModelTag();
    });
  });

  // Preset actions
  $('#btn-save-preset')?.addEventListener('click', openPresetModal);

  $('#preset-select')?.addEventListener('change', e => {
    const id = e.target.value;
    if (!id) {
      state.activePresetId = null;
      saveSettings(state);
      renderWorkspace();
      return;
    }
    const presets = loadPresets();
    const preset = presets.find(p => p.id === id);
    if (!preset) return;
    state = { ...DEFAULT_STATE, ...preset.state, theme: state.theme, activePresetId: preset.id };
    saveSettings(state);
    renderWorkspace();
    updatePromptPreview();
    updateStatus();
    showToast(`Loaded “${preset.name}”`);
  });

  $('#btn-update-preset')?.addEventListener('click', () => {
    const id = state.activePresetId;
    if (!id) {
      showToast('Select a preset to update');
      return;
    }
    const presets = loadPresets();
    const preset = presets.find(p => p.id === id);
    if (!preset) {
      showToast('Select a preset to update');
      return;
    }
    upsertPreset(preset.name, state, id);
    showToast('Preset updated successfully.');
  });

  $('#btn-delete-preset')?.addEventListener('click', () => {
    const id = state.activePresetId || $('#preset-select')?.value;
    if (!id) {
      showToast('Select a preset to delete');
      return;
    }
    const presets = loadPresets();
    const preset = presets.find(p => p.id === id);
    if (!preset) return;
    if (!confirm(`Delete preset “${preset.name}”?\n\nThis action cannot be undone.`)) return;
    deletePreset(id);
    state.activePresetId = null;
    saveSettings(state);
    renderWorkspace();
    showToast('Preset deleted');
  });
}

/* ================================================================== */
/*  Live preview                                                       */
/* ================================================================== */

function updatePromptPreview() {
  const output = $('#prompt-output');
  const placeholder = $('#preview-placeholder');
  if (!output) return;

  const text = buildPrompt(state);
  output.textContent = text;

  const status = getPromptStatus(state);
  if (placeholder) {
    if (status.level === 'empty') {
      placeholder.textContent = status.label + '. Your prompt will compose itself here.';
      placeholder.hidden = false;
      output.classList.add('is-empty');
    } else {
      placeholder.hidden = true;
      output.classList.remove('is-empty');
    }
  }

  updateModelTag();
}

function updateModelTag() {
  const tag = $('#preview-model-tag');
  if (!tag) return;
  const model = MODELS.find(m => m.id === state.model);
  tag.textContent = model ? `For ${model.name}` : '';
}

function updateStatus() {
  const el = $('#preview-status');
  if (!el) return;
  const status = getPromptStatus(state);
  el.textContent = status.label;
  el.dataset.level = status.level;
}

/* ================================================================== */
/*  Modal & toast                                                      */
/* ================================================================== */

function openPresetModal() {
  const modal = $('#preset-modal');
  const input = $('#preset-name');
  if (!modal) return;
  modal.hidden = false;
  if (input) {
    input.value = state.topic ? `${state.topic.slice(0, 40)} preset` : '';
    setTimeout(() => input.focus(), 50);
  }
}

function closePresetModal() {
  const modal = $('#preset-modal');
  if (modal) modal.hidden = true;
}

function showToast(message, duration = 2200) {
  const toast = $('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => {
    toast.hidden = true;
  }, duration);
}

/* ================================================================== */
/*  Utilities                                                          */
/* ================================================================== */

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(str) {
  return escapeHtml(str).replace(/'/g, '&#39;');
}
