/**
 * Configuration module — Lina's Instructional Graphic Builder
 * ----------------------------------------------------------------
 * Single source of truth for every option, model, and default.
 * To extend the app (new graphic types, colors, models, etc.),
 * edit only this file. The UI and prompt builder pick up changes
 * automatically.
 */

export const APP_VERSION = '1.2.0';
export const STORAGE_KEY = 'igpa-settings-v1';
export const PRESETS_KEY = 'igpa-presets-v1';

/* ------------------------------------------------------------------ */
/*  Quick-start templates                                              */
/* ------------------------------------------------------------------ */
export const QUICK_STARTS = [
  {
    id: 'classroom',
    label: 'Classroom Activity',
    hint: 'Create activities that students complete during class or as independent practice.',
    typeKey: 'activityType',
    typeLabel: 'Activity Types',
    typeOptions: [
      { value: 'quiz', label: 'Quiz' },
      { value: 'assignment', label: 'Assignment' },
      { value: 'interactive-activity', label: 'Interactive Practice' }
    ],
    defaultType: 'quiz',
    values: {
      audience: 'K–12 students in a classroom setting',
      bloomLevel: 'understand',
      complexity: 'moderate',
      amountOfText: 'moderate-labels',
      pedagogical: ['factual-accuracy', 'clear-hierarchy'],
      accessibility: ['color-blind-safe', 'alt-text', 'readability-distance']
    }
  },
  {
    id: 'lecture',
    label: 'Lecture',
    hint: 'Create instructional materials that help instructors teach a lesson.',
    typeKey: 'outputType',
    typeLabel: 'Lecture Types',
    typeOptions: [
      { value: 'lesson', label: 'Lesson' },
      { value: 'powerpoint', label: 'PowerPoint' },
      { value: 'examples', label: 'Examples' },
      { value: 'programming-video', label: 'Programming Video' }
    ],
    defaultType: 'lesson',
    values: {
      audience: 'College or adult learners in a lecture environment',
      bloomLevel: 'analyze',
      complexity: 'detailed',
      amountOfText: 'moderate-labels',
      pedagogical: ['factual-accuracy', 'clear-hierarchy'],
      accessibility: ['alt-text', 'readability-distance']
    }
  },
  {
    id: 'training',
    label: 'Training',
    hint: 'Create instructional materials for professional development, faculty training, or workplace learning.',
    typeKey: 'trainingType',
    typeLabel: 'Training Types',
    typeOptions: [
      { value: 'faculty-training', label: 'Faculty Training' },
      { value: 'workshop', label: 'Workshop' }
    ],
    defaultType: 'faculty-training',
    values: {
      audience: 'Professional adult learners in corporate or skills training',
      bloomLevel: 'apply',
      complexity: 'moderate',
      amountOfText: 'key-terms',
      pedagogical: ['factual-accuracy', 'clear-hierarchy'],
      accessibility: ['color-blind-safe', 'readability-distance']
    }
  },
  {
    id: 'summary',
    label: 'Learning Summary',
    hint: 'Create student review materials that help learners study, review, and prepare for quizzes or exams.',
    typeKey: 'summaryType',
    typeLabel: 'Summary Types',
    typeOptions: [
      { value: 'study-guide', label: 'Study Guide' },
      { value: 'chapter-summary', label: 'Chapter Summary' }
    ],
    defaultType: 'study-guide',
    values: {
      audience: 'Learners reviewing or consolidating knowledge',
      bloomLevel: 'remember',
      complexity: 'minimal',
      amountOfText: 'key-terms',
      pedagogical: ['clear-hierarchy'],
      accessibility: ['readability-distance', 'alt-text']
    }
  }
];

/* ------------------------------------------------------------------ */
/*  Graphic types                                                      */
/* ------------------------------------------------------------------ */
export const GRAPHIC_TYPES = [
  {
    id: 'concept-map',
    title: 'Concept Map',
    subtitle: 'Purpose: Show relationships',
    description: 'Use when: showing how ideas, concepts, or topics are connected.'
  },
  {
    id: 'flowchart',
    title: 'Flowchart',
    subtitle: 'Purpose: Explain a process',
    description: 'Use when: explaining a process, decision, or sequence of steps.'
  },
  {
    id: 'infographic',
    title: 'Infographic',
    subtitle: 'Purpose: Summarize with visuals',
    description: 'Use when: summarizing a topic with a mix of text, icons, and visuals.'
  },
  {
    id: 'timeline',
    title: 'Timeline',
    subtitle: 'Purpose: Show chronology',
    description: 'Use when: showing events or milestones in chronological order.'
  },
  {
    id: 'comparison',
    title: 'Comparison Chart',
    subtitle: 'Purpose: Compare side by side',
    description: 'Use when: comparing two or more concepts, items, or options side by side.'
  },
  {
    id: 'labeled-diagram',
    title: 'Labeled Diagram',
    subtitle: 'Purpose: Identify parts',
    description: 'Use when: identifying and labeling parts of an object, system, or process.'
  },
  {
    id: 'cycle',
    title: 'Cycle Diagram',
    subtitle: 'Purpose: Show a repeating cycle',
    description: 'Use when: explaining a process that repeats or follows a continuous cycle.'
  },
  {
    id: 'hierarchy',
    title: 'Hierarchy / Org Chart',
    subtitle: 'Purpose: Show structure',
    description: 'Use when: showing levels, categories, rankings, or organizational structure.'
  },
  {
    id: 'venn',
    title: 'Venn Diagram',
    subtitle: 'Purpose: Show overlap',
    description: 'Use when: showing similarities and differences between concepts.'
  },
  {
    id: 'matrix',
    title: '2×2 Matrix',
    subtitle: 'Purpose: Classify by two criteria',
    description: 'Use when: classifying items using two comparison criteria.'
  },
  {
    id: 'mind-map',
    title: 'Mind Map',
    subtitle: 'Purpose: Brainstorm & organize',
    description: 'Use when: brainstorming ideas or organizing thoughts around one main topic.'
  },
  {
    id: 'sequence',
    title: 'Sequence / Step-by-Step',
    subtitle: 'Purpose: Teach a procedure',
    description: 'Use when: teaching students how to complete a task one step at a time.'
  },
  {
    id: 'anatomy',
    title: 'Anatomy / Cross-Section',
    subtitle: 'Purpose: Show internal structure',
    description: 'Use when: showing the internal parts or structure of an object or system.'
  },
  {
    id: 'data-viz',
    title: 'Data Visualization',
    subtitle: 'Purpose: Present data',
    description: 'Use when: presenting numerical data using charts or graphs.'
  },
  {
    id: 'visual-analogy',
    title: 'Visual Analogy',
    subtitle: 'Purpose: Explain by comparison',
    description: 'Use when: explaining a difficult concept by comparing it to something familiar.'
  },
  {
    id: 'reference-poster',
    title: 'Reference Poster',
    subtitle: 'Purpose: Quick classroom reference',
    description: 'Use when: creating a quick-reference guide students can review repeatedly.'
  }
];

/* ------------------------------------------------------------------ */
/*  Guided goals for Graphic Type selection (wizard step)              */
/*  recommendations: default list of graphic type ids                  */
/*  byTemplate: optional overrides keyed by quick-start template id    */
/* ------------------------------------------------------------------ */
export const GRAPHIC_GOALS = [
  {
    id: 'process',
    label: 'Explain a process or steps',
    recommendations: {
      default: [
        { id: 'flowchart', why: 'Best when decisions or branching steps matter.' },
        { id: 'sequence', why: 'Ideal for a clear, numbered how-to procedure.' },
        { id: 'cycle', why: 'Choose this when the process repeats or loops.' }
      ],
      classroom: [
        { id: 'sequence', why: 'Students can follow numbered steps during an activity.' },
        { id: 'flowchart', why: 'Helps learners see decision points in a process.' },
        { id: 'cycle', why: 'Good for repeating classroom routines or natural cycles.' }
      ],
      lecture: [
        { id: 'flowchart', why: 'Supports explaining complex processes during a lecture.' },
        { id: 'sequence', why: 'Clear step order for projected slides.' },
        { id: 'cycle', why: 'Shows cyclical processes in a single visual.' }
      ],
      training: [
        { id: 'sequence', why: 'Practical procedures for hands-on training.' },
        { id: 'flowchart', why: 'Decision paths professionals need to apply.' },
        { id: 'cycle', why: 'Ongoing workflows or improvement loops.' }
      ],
      summary: [
        { id: 'sequence', why: 'Compact review of key steps.' },
        { id: 'flowchart', why: 'Quick reference for process flow.' },
        { id: 'cycle', why: 'Summary of repeating stages.' }
      ]
    }
  },
  {
    id: 'compare',
    label: 'Compare two or more concepts',
    recommendations: {
      default: [
        { id: 'comparison', why: 'Side-by-side contrast across clear attributes.' },
        { id: 'venn', why: 'Highlights overlap as well as differences.' },
        { id: 'matrix', why: 'Sorts items along two dimensions at once.' }
      ],
      classroom: [
        { id: 'comparison', why: 'Straightforward for in-class comparison tasks.' },
        { id: 'venn', why: 'Students see shared vs. unique traits quickly.' },
        { id: 'matrix', why: 'Useful for sorting examples into categories.' }
      ],
      lecture: [
        { id: 'comparison', why: 'Clean contrast for lecture slides.' },
        { id: 'venn', why: 'Shows intersection of ideas during discussion.' },
        { id: 'matrix', why: 'Framework for analyzing cases or theories.' }
      ],
      training: [
        { id: 'comparison', why: 'Compare tools, methods, or policies at a glance.' },
        { id: 'matrix', why: 'Prioritize or classify professional scenarios.' },
        { id: 'venn', why: 'Clarify shared responsibilities or features.' }
      ],
      summary: [
        { id: 'comparison', why: 'Study-friendly side-by-side review.' },
        { id: 'venn', why: 'Quick visual of overlap for revision.' },
        { id: 'matrix', why: 'Condenses multi-factor comparisons.' }
      ]
    }
  },
  {
    id: 'relationships',
    label: 'Show relationships between ideas',
    recommendations: {
      default: [
        { id: 'concept-map', why: 'Labeled links make relationships explicit.' },
        { id: 'mind-map', why: 'Radial exploration from a central idea.' },
        { id: 'venn', why: 'Shows shared and distinct attributes visually.' }
      ],
      classroom: [
        { id: 'concept-map', why: 'Students connect ideas with labeled links.' },
        { id: 'mind-map', why: 'Great for brainstorming and note-taking.' },
        { id: 'venn', why: 'Simple overlap for pair/share activities.' }
      ],
      lecture: [
        { id: 'concept-map', why: 'Maps theory connections during instruction.' },
        { id: 'mind-map', why: 'Organizes free associations from discussion.' },
        { id: 'venn', why: 'Quick intersection of frameworks or schools of thought.' }
      ],
      training: [
        { id: 'concept-map', why: 'Links competencies, policies, or systems.' },
        { id: 'mind-map', why: 'Captures workshop brainstorming outputs.' },
        { id: 'venn', why: 'Clarifies overlapping roles or tools.' }
      ],
      summary: [
        { id: 'concept-map', why: 'Review how key ideas connect.' },
        { id: 'mind-map', why: 'At-a-glance topic overview for study.' },
        { id: 'venn', why: 'Compact shared/unique attributes.' }
      ]
    }
  },
  {
    id: 'timeline',
    label: 'Show a timeline or sequence',
    recommendations: {
      default: [
        { id: 'timeline', why: 'Plots events in chronological order.' },
        { id: 'sequence', why: 'Numbered panels for procedural order.' },
        { id: 'flowchart', why: 'When order includes decisions or branches.' }
      ],
      classroom: [
        { id: 'timeline', why: 'Historical or process chronology for students.' },
        { id: 'sequence', why: 'Step-by-step activity directions.' },
        { id: 'flowchart', why: 'Order with decision points students must follow.' }
      ],
      lecture: [
        { id: 'timeline', why: 'Chronology on slides for lectures.' },
        { id: 'sequence', why: 'Ordered stages of a theory or method.' },
        { id: 'flowchart', why: 'Process with branches during explanation.' }
      ],
      training: [
        { id: 'sequence', why: 'Procedural training steps.' },
        { id: 'timeline', why: 'Project phases or historical context.' },
        { id: 'flowchart', why: 'Workflow with decision gates.' }
      ],
      summary: [
        { id: 'timeline', why: 'Condensed chronology for review.' },
        { id: 'sequence', why: 'Key steps to remember.' },
        { id: 'flowchart', why: 'Simplified process overview.' }
      ]
    }
  },
  {
    id: 'hierarchy',
    label: 'Show a hierarchy or structure',
    recommendations: {
      default: [
        { id: 'hierarchy', why: 'Tree layout for levels of authority or taxonomy.' },
        { id: 'anatomy', why: 'Cutaway view of internal structure.' },
        { id: 'labeled-diagram', why: 'Callouts identifying each part of a whole.' }
      ],
      classroom: [
        { id: 'hierarchy', why: 'Taxonomies and org structures students can parse.' },
        { id: 'labeled-diagram', why: 'Parts of a system labeled for study.' },
        { id: 'anatomy', why: 'Internal structure for science topics.' }
      ],
      lecture: [
        { id: 'hierarchy', why: 'Clear levels for frameworks and orgs.' },
        { id: 'labeled-diagram', why: 'Point to components while lecturing.' },
        { id: 'anatomy', why: 'Cross-section for technical subjects.' }
      ],
      training: [
        { id: 'hierarchy', why: 'Reporting lines, taxonomies, or frameworks.' },
        { id: 'labeled-diagram', why: 'Equipment or system parts for trainees.' },
        { id: 'anatomy', why: 'Internal workings of tools or processes.' }
      ],
      summary: [
        { id: 'hierarchy', why: 'Structure at a glance for review.' },
        { id: 'labeled-diagram', why: 'Key parts labeled for study guides.' },
        { id: 'anatomy', why: 'Simplified internal structure summary.' }
      ]
    }
  },
  {
    id: 'concept',
    label: 'Explain a concept visually',
    recommendations: {
      default: [
        { id: 'visual-analogy', why: 'Bridges the unfamiliar to something concrete.' },
        { id: 'labeled-diagram', why: 'Names the parts of the concept clearly.' },
        { id: 'infographic', why: 'Mixes short text and visuals into one story.' }
      ],
      classroom: [
        { id: 'visual-analogy', why: 'Makes abstract ideas concrete for students.' },
        { id: 'labeled-diagram', why: 'Clear part labels for classroom use.' },
        { id: 'infographic', why: 'Scannable visual story for activities.' }
      ],
      lecture: [
        { id: 'visual-analogy', why: 'Memorable metaphor during instruction.' },
        { id: 'infographic', why: 'Narrative + data for lecture slides.' },
        { id: 'labeled-diagram', why: 'Point to each element while teaching.' }
      ],
      training: [
        { id: 'labeled-diagram', why: 'Concrete parts of tools or concepts.' },
        { id: 'visual-analogy', why: 'Relatable metaphor for adult learners.' },
        { id: 'infographic', why: 'Professional, scannable explanation.' }
      ],
      summary: [
        { id: 'infographic', why: 'Compact visual summary of the concept.' },
        { id: 'visual-analogy', why: 'Memorable anchor for review.' },
        { id: 'labeled-diagram', why: 'Parts to recall on a study guide.' }
      ]
    }
  },
  {
    id: 'data',
    label: 'Present data or statistics',
    recommendations: {
      default: [
        { id: 'data-viz', why: 'Charts and graphs for quantitative evidence.' },
        { id: 'infographic', why: 'Combines stats with narrative and icons.' },
        { id: 'comparison', why: 'Side-by-side numeric or categorical contrast.' }
      ],
      classroom: [
        { id: 'data-viz', why: 'Clear charts students can interpret.' },
        { id: 'infographic', why: 'Stats plus context for activities.' },
        { id: 'comparison', why: 'Compare figures across groups or conditions.' }
      ],
      lecture: [
        { id: 'data-viz', why: 'Evidence-focused slides for lectures.' },
        { id: 'infographic', why: 'Story + numbers in one visual.' },
        { id: 'comparison', why: 'Contrast data sets during discussion.' }
      ],
      training: [
        { id: 'data-viz', why: 'Performance metrics and evidence.' },
        { id: 'infographic', why: 'Stats in a professional narrative layout.' },
        { id: 'comparison', why: 'Benchmark or option comparison.' }
      ],
      summary: [
        { id: 'data-viz', why: 'Key figures for quick review.' },
        { id: 'infographic', why: 'Stats and takeaways in one place.' },
        { id: 'comparison', why: 'Side-by-side numbers to remember.' }
      ]
    }
  },
  {
    id: 'all',
    label: 'Show all graphic types (Advanced)',
    recommendations: {
      default: []
    }
  }
];

/* ------------------------------------------------------------------ */
/*  Select / dropdown option groups                                    */
/* ------------------------------------------------------------------ */
export const OPTIONS = {
  subjectArea: [
    { value: '', label: '— select —' },
    { value: 'science', label: 'Science' },
    { value: 'math', label: 'Mathematics' },
    { value: 'history', label: 'History / Social Studies' },
    { value: 'language-arts', label: 'Language Arts / Literacy' },
    { value: 'computer-science', label: 'Computer Science / IT' },
    { value: 'engineering', label: 'Engineering' },
    { value: 'business', label: 'Business / Economics' },
    { value: 'health', label: 'Health / Medicine' },
    { value: 'arts', label: 'Arts / Design' },
    { value: 'world-languages', label: 'World Languages' },
    { value: 'career-tech', label: 'Career & Technical Education' },
    { value: 'other', label: 'Other / Interdisciplinary' }
  ],

  gradeLevel: [
    { value: '', label: '— select —' },
    { value: 'elementary', label: 'Elementary (K–5)' },
    { value: 'middle', label: 'Middle School (6–8)' },
    { value: 'high', label: 'High School (9–12)' },
    { value: 'college', label: 'College / University' },
    { value: 'adult', label: 'Adult / Professional' },
    { value: 'mixed', label: 'Mixed / Multi-level' }
  ],

  bloomLevel: [
    { value: '', label: '— select —' },
    { value: 'remember', label: 'Remember — recall facts and basic concepts' },
    { value: 'understand', label: 'Understand — explain ideas or concepts' },
    { value: 'apply', label: 'Apply — use information in new situations' },
    { value: 'analyze', label: 'Analyze — draw connections among ideas' },
    { value: 'evaluate', label: 'Evaluate — justify a decision or course of action' },
    { value: 'create', label: 'Create — produce new or original work' }
  ],

  visualStyle: [
    { value: 'flat-vector', label: 'Flat Vector Illustration — most educational graphics; clean, modern, easy to understand' },
    { value: 'line-art', label: 'Clean Line Art — simple black-and-white diagrams with minimal distraction' },
    { value: 'isometric', label: 'Isometric — systems, equipment, technology, buildings, or technical 3D layouts' },
    { value: 'hand-drawn', label: 'Hand-drawn / Sketch — brainstorming, whiteboard lessons, informal materials' },
    { value: 'realistic', label: 'Semi-realistic Illustration — when realistic visuals help explain the lesson' },
    { value: 'minimal-geometric', label: 'Minimal Geometric — abstract, clean designs with very few visual elements' },
    { value: 'infographic-modern', label: 'Modern Infographic Style — icons, charts, and clear visual hierarchy' },
    { value: 'textbook', label: 'Classic Textbook Diagram — science, engineering, anatomy, math, traditional illustrations' }
  ],

  tone: [
    { value: 'professional', label: 'Professional / Formal — college courses, training, manuals, official materials' },
    { value: 'friendly', label: 'Friendly / Approachable — everyday classroom teaching and student-friendly content' },
    { value: 'playful', label: 'Playful / Engaging — elementary, middle school, or interactive activities' },
    { value: 'academic', label: 'Academic / Scholarly — research, higher education, scholarly materials' },
    { value: 'technical', label: 'Technical / Precise — programming, engineering, mathematics, and science' },
    { value: 'inspirational', label: 'Inspirational / Motivational — posters, encouragement, professional development' }
  ],

  colorScheme: [
    { value: 'editorial-neutrals', label: 'Editorial Neutrals — professional handouts and textbook-style graphics' },
    { value: 'cool-blues', label: 'Cool Blues & Grays — technology, engineering, computer science, healthcare' },
    { value: 'warm-earth', label: 'Warm Earth Tones — history, humanities, environmental science' },
    { value: 'high-contrast', label: 'High Contrast — accessibility, projection screens, large classrooms' },
    { value: 'pastel', label: 'Soft Pastels — young learners or calm educational materials' },
    { value: 'vibrant', label: 'Vibrant Multi-color — engagement, colorful classroom graphics, interactive lessons' },
    { value: 'monochrome', label: 'Monochrome + One Accent — minimalist professional graphics' },
    { value: 'brand-neutral', label: 'Brand-neutral Educational Palette — suitable for almost any subject' }
  ],

  complexity: [
    { value: 'minimal', label: 'Minimal — one simple idea with very little text' },
    { value: 'moderate', label: 'Moderate — several related ideas explained clearly' },
    { value: 'detailed', label: 'Detailed — additional explanations and examples' },
    { value: 'dense', label: 'Dense — study guides, reference sheets, information-rich graphics' }
  ],

  sizePreset: [
    { value: 'us-letter-portrait', label: 'US Letter — 8.5 × 11 in (portrait) — worksheets, handouts, and study guides' },
    { value: 'us-letter-landscape', label: 'US Letter — 11 × 8.5 in (landscape) — wide handouts and landscape worksheets' },
    { value: 'a4-portrait', label: 'A4 — 210 × 297 mm (portrait) — international handouts and documents' },
    { value: 'a4-landscape', label: 'A4 — 297 × 210 mm (landscape) — wide international print layouts' },
    { value: 'slide-16-9', label: 'Presentation slide — 16:9 — PowerPoint, Google Slides, and classroom presentations' },
    { value: 'slide-4-3', label: 'Presentation slide — 4:3 — older projectors and square-ish slide decks' },
    { value: 'responsive-web', label: 'Responsive Web / Interactive HTML — adapts to desktop, tablet, and browser width' },
    { value: 'square', label: 'Square — social / digital — Canvas announcements and social media' },
    { value: 'poster-tabloid', label: 'Tabloid / Poster — 11 × 17 in — classroom displays, conferences, and bulletin boards' },
    { value: 'custom', label: 'Custom (describe in notes) — specify exact dimensions in Additional Instructions' }
  ],

  orientation: [
    { value: 'as-preset', label: 'As specified by size preset — follow the size option above' },
    { value: 'portrait', label: 'Portrait — best for printed handouts and documents' },
    { value: 'landscape', label: 'Landscape — best for presentations, timelines, and wide diagrams' },
    { value: 'square', label: 'Square — best for social media and LMS announcements' }
  ],

  amountOfText: [
    { value: 'key-terms', label: 'Minimal — focus on only the most important ideas' },
    { value: 'moderate-labels', label: 'Moderate — balance visuals with short explanations' },
    { value: 'explanatory', label: 'Explanatory — introduce a new topic that needs additional context' },
    { value: 'detailed', label: 'Detailed — reference guides or printable resources with more text' }
  ],

  fileFormat: [
    { value: 'png', label: 'PNG — best for slides, Canvas, documents, and general classroom use' },
    { value: 'svg', label: 'SVG — best when the graphic needs to be resized without losing quality' },
    { value: 'pdf', label: 'PDF — best for printing and sharing high-quality documents' },
    { value: 'jpg', label: 'JPG — best for photographs or web pages' },
    { value: 'webp', label: 'WebP — best for websites and smaller file sizes' },
    { value: 'interactive-html', label: 'Interactive HTML — embedded CSS and JavaScript (supports animation)' }
  ],

  resolution: [
    { value: '72', label: '72 DPI — basic screen viewing' },
    { value: '150', label: '150 DPI — good for screens and presentations' },
    { value: '300', label: '300 DPI — best for classroom printing' },
    { value: '600', label: '600 DPI — best for professional printing and large posters' }
  ]
};

/* ------------------------------------------------------------------ */
/*  Icon & illustration preference chips (multi-select)                */
/* ------------------------------------------------------------------ */
export const ICON_PREFERENCES = [
  { id: 'icons-only', label: 'Icons Only — simple icons; best for clean technical graphics' },
  { id: 'icons-illustrations', label: 'Icons + Illustrations — balanced; recommended for most lessons' },
  { id: 'people', label: 'Illustrations of People — students, teachers, or professionals for relatability' },
  { id: 'abstract', label: 'Abstract Shapes Only — shapes and geometry without icons or people' },
  { id: 'labeled-diagrams', label: 'Labeled Diagrams — diagrams with clear part labels' },
  { id: 'type-only', label: 'Text Only — no icons or illustrations; text, diagrams, and shapes only' }
];

/* ------------------------------------------------------------------ */
/*  Accessibility options                                              */
/* ------------------------------------------------------------------ */
export const ACCESSIBILITY = [
  {
    id: 'color-blind-safe',
    label: 'Color-blind-safe palette',
    help: 'Use when: Your graphic relies on color to communicate information.'
  },
  {
    id: 'alt-text',
    label: 'Include alt-text description',
    help: 'Use when: The graphic will be shared online or in Canvas.'
  },
  {
    id: 'readability-distance',
    label: 'Prioritize readability at distance',
    help: 'Use when: The graphic will be presented in class or on a projector.'
  },
  {
    id: 'high-contrast',
    label: 'High-contrast text and shapes',
    help: 'Use when: The graphic will be projected or viewed by learners with low vision.'
  },
  {
    id: 'large-labels',
    label: 'Large, legible labels',
    help: 'Use when: Students may view the graphic from a distance.'
  },
  {
    id: 'wcag-aa',
    label: 'Apply ADA & WCAG 2.1 AA accessibility guidelines (Recommended)',
    help: 'Use when: Creating educational graphics for Canvas, presentations, websites, online courses, or any digital learning materials.'
  }
];

/* ------------------------------------------------------------------ */
/*  Pedagogical constraints                                            */
/* ------------------------------------------------------------------ */
export const PEDAGOGICAL = [
  {
    id: 'factual-accuracy',
    label: 'Enforce factual & technical accuracy',
    help: 'Use when: Creating STEM or academic content.'
  },
  {
    id: 'clear-hierarchy',
    label: 'Clear visual hierarchy',
    help: 'Use when: Students should quickly identify the most important information.'
  },
  {
    id: 'cite-sources',
    label: 'Cite sources in caption',
    help: 'Use when: Using statistics, research, or external references.'
  },
  {
    id: 'age-appropriate',
    label: 'Age-appropriate language and imagery',
    help: 'Use when: The material should match the learners\' educational level.'
  },
  {
    id: 'scaffold-complexity',
    label: 'Scaffold complexity',
    help: 'Use when: Teaching beginners or introducing difficult concepts.'
  }
];

/* ------------------------------------------------------------------ */
/*  Target AI models — with model-specific prompt templates            */
/* ------------------------------------------------------------------ */
/**
 * Each model controls how the master prompt is framed:
 * - role: opening identity / intent
 * - styleNotes: how this model prefers instructions
 * - sectionStyle: heading style
 * - closing: final generation instructions
 * - promptHint: short UI tagline
 */
export const MODELS = [
  {
    id: 'claude',
    name: 'Claude',
    tagline: 'Best for structured educational prompts',
    promptHint: 'Precise, structured language with explicit constraints and numbered requirements.',
    role: 'You are an expert instructional designer and visual communication specialist. Create a detailed, classroom-ready instructional graphic that strictly follows every specification below.',
    styleNotes: 'Prefer explicit constraints, clear hierarchies, and numbered requirements. State the desired output format and any non-negotiable rules upfront.',
    sectionStyle: 'markdown',
    closing: [
      'Follow these generation rules exactly:',
      '1. Satisfy every constraint listed above — do not omit or invent conflicting details.',
      '2. If a required detail is missing, make a single reasonable, research-based assumption and state it briefly.',
      '3. Prioritize factual accuracy, clear visual hierarchy, and educational usefulness.',
      '4. Produce one coherent instructional graphic specification ready for image generation or design handoff.'
    ]
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    tagline: 'Best for balanced instructional content',
    promptHint: 'Clear, conversational yet precise language; request step-by-step reasoning when helpful.',
    role: 'You are an expert instructional designer and visual communication specialist. Please create a detailed, classroom-ready instructional graphic based on the specifications that follow.',
    styleNotes: 'Use clear, conversational language. When helpful, reason step-by-step about layout and pedagogy before finalizing the design description. Specify the output format explicitly.',
    sectionStyle: 'markdown',
    closing: [
      'Please produce a single, high-quality instructional graphic that meets all of the above.',
      'If anything is ambiguous, choose the option that best supports student learning and note your choice briefly.',
      'Prioritize clarity, accuracy, and classroom practicality.'
    ]
  },
  {
    id: 'gemini',
    name: 'Gemini',
    tagline: 'Best for multimodal educational graphics',
    promptHint: 'Explicit visual composition, layout, and real-world educational context for multimodal strengths.',
    role: 'You are an expert instructional designer with strong multimodal visual reasoning. Generate a detailed, classroom-ready instructional graphic according to the specifications below.',
    styleNotes: 'Be explicit about spatial layout, visual hierarchy, color placement, and how text and imagery interact. Reference real classroom use cases when relevant.',
    sectionStyle: 'markdown',
    closing: [
      'Describe the graphic so it can be rendered accurately (composition, focal points, typography hierarchy, icon placement).',
      'Leverage multimodal strengths: be concrete about what the learner sees first, second, and last.',
      'If a detail is missing, infer a research-based default suited to the stated grade level and note it.'
    ]
  },
  {
    id: 'grok',
    name: 'Grok',
    tagline: 'Best for creative visual generation',
    promptHint: 'Direct, precise, accuracy-first language; concrete visual specifications without flourish.',
    role: 'You are an expert instructional designer focused on clarity and accuracy. Produce a classroom-ready instructional graphic that matches every specification below.',
    styleNotes: 'Be direct and precise. Emphasize factual correctness and practical usefulness. Prefer concrete visual specifications over vague aesthetic language.',
    sectionStyle: 'markdown',
    closing: [
      'Deliver one coherent graphic that fully satisfies the constraints.',
      'Accuracy and educational effectiveness take priority over decorative flourish.',
      'If something is unspecified, make a single grounded assumption and state it.'
    ]
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    tagline: 'Best for research-based graphics',
    promptHint: 'Accuracy and sourcing first; request citations or verification of factual content where appropriate.',
    role: 'You are an expert instructional designer who prioritizes verified, accurate content. Create a classroom-ready instructional graphic based on the specifications below.',
    styleNotes: 'Emphasize factual accuracy. Where domain knowledge is required, prefer widely accepted, citable formulations. Note any sources or verification steps when relevant.',
    sectionStyle: 'markdown',
    closing: [
      'Ensure all factual claims in labels or captions are accurate and appropriate for the audience.',
      'If the topic benefits from a brief source note or verification, include it in the caption guidance.',
      'Produce one clear, research-aligned instructional graphic that meets every constraint above.'
    ]
  },
  {
    id: 'generic',
    name: 'Generic / Other',
    tagline: 'Works with any AI model',
    promptHint: 'Clear, model-agnostic instructional-design language that works across most modern LLMs.',
    role: 'You are an expert instructional designer and visual communication specialist. Create a detailed, classroom-ready instructional graphic based on the following specifications.',
    styleNotes: 'Use clear, model-agnostic instructional-design language. State requirements explicitly so any capable LLM can follow them.',
    sectionStyle: 'markdown',
    closing: [
      'Produce a single, coherent, high-quality instructional graphic that fully satisfies every constraint above.',
      'Prioritize clarity, accuracy, and educational effectiveness.',
      'If any required detail is missing, make reasonable, research-based assumptions and note them briefly.'
    ]
  }
];

/* ------------------------------------------------------------------ */
/*  Default application state                                          */
/* ------------------------------------------------------------------ */
export const DEFAULT_STATE = {
  topic: '',
  subjectArea: '',
  gradeLevel: '',
  audience: '',
  learningObjective: '',
  bloomLevel: '',
  graphicType: null,
  visualStyle: 'flat-vector',
  tone: 'professional',
  colorScheme: 'editorial-neutrals',
  complexity: 'moderate',
  iconPreferences: ['icons-illustrations'],
  sizePreset: 'us-letter-portrait',
  orientation: 'as-preset',
  amountOfText: 'key-terms',
  fileFormat: 'png',
  resolution: '300',
  transparentBg: false,
  safeMargins: true,
  accessibility: ['alt-text', 'readability-distance', 'wcag-aa'],
  pedagogical: ['factual-accuracy', 'clear-hierarchy'],
  model: 'claude',
  extraNotes: '',
  theme: 'light',
  templateId: null,
  activityType: '',
  outputType: '',
  trainingType: '',
  summaryType: '',
  graphicGoal: null,
  showAllGraphics: false,
  activePresetId: null,
  contentSource: 'manual',
  uploadedFileName: '',
  extractedContent: '',
  animation: 'none',
  quizQuestionTypes: ['multiple-choice', 'true-false'],
  quizQuestionCount: 10,
  assignmentMode: 'printable',
  // Programming Video (Lecture)
  progCodeSource: 'paste',
  progCodeFileName: '',
  progSourceCode: '',
  progLanguage: 'java',
  progCourseName: '',
  progAudienceLevel: 'beginner',
  progVideoLength: '5-8',
  progPresenter: 'female',
  progPresentationStyle: 'split-screen',
  progCodeAnimation: 'type-line-by-line',
  progExplanationStyle: 'detailed-walkthrough',
  progInclude: ['purpose', 'ipo', 'program-flow', 'variable-trace', 'expected-output', 'common-mistakes', 'closing-summary']
};

/* ------------------------------------------------------------------ */
/*  Programming Video options (Lecture → Programming Video)            */
/* ------------------------------------------------------------------ */
export const PROG_VIDEO_OPTIONS = {
  language: [
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'python', label: 'Python' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'sql', label: 'SQL' },
    { value: 'csharp', label: 'C#' },
    { value: 'other', label: 'Other' }
  ],
  audience: [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ],
  videoLength: [
    { value: '3-5', label: '3–5 minutes' },
    { value: '5-8', label: '5–8 minutes' },
    { value: '8-15', label: '8–15 minutes' },
    { value: 'custom', label: 'Custom' }
  ],
  presenter: [
    { value: 'female', label: 'Female Instructor' },
    { value: 'male', label: 'Male Instructor' },
    { value: 'voice-over', label: 'Voice-over Only' }
  ],
  presentationStyle: [
    { value: 'instructor-editor', label: 'Instructor with Code Editor' },
    { value: 'editor-voiceover', label: 'Code Editor with Voice-over' },
    { value: 'split-screen', label: 'Split Screen (Instructor + Code Editor)' },
    { value: 'whiteboard', label: 'Whiteboard Style' }
  ],
  codeAnimation: [
    { value: 'type-line-by-line', label: 'Type the program line by line' },
    { value: 'highlight-lines', label: 'Show completed code and highlight each line' },
    { value: 'type-important', label: 'Type only important statements' }
  ],
  explanationStyle: [
    { value: 'basic-overview', label: 'Basic Overview' },
    { value: 'line-by-line', label: 'Line-by-Line Explanation' },
    { value: 'detailed-walkthrough', label: 'Detailed Code Walkthrough' }
  ],
  include: [
    { id: 'purpose', label: 'Program Purpose' },
    { id: 'ipo', label: 'IPO / Pseudocode' },
    { id: 'program-flow', label: 'Program Flow' },
    { id: 'variable-trace', label: 'Variable Trace' },
    { id: 'memory', label: 'Memory Visualization' },
    { id: 'execution-order', label: 'Execution Order' },
    { id: 'expected-output', label: 'Expected Output' },
    { id: 'common-mistakes', label: 'Common Student Mistakes' },
    { id: 'best-practices', label: 'Best Practices' },
    { id: 'closing-summary', label: 'Closing Summary' },
    { id: 'practice-question', label: 'Practice Question' }
  ]
};

/* ------------------------------------------------------------------ */
/*  Animation options (optional)                                       */
/* ------------------------------------------------------------------ */
export const ANIMATION_OPTIONS = [
  { value: 'none', label: 'No animation (Recommended)', help: 'Best for print, handouts, and most classroom graphics.' },
  { value: 'fade-in', label: 'Fade In', help: 'Gentle entrance for slides and digital displays.' },
  { value: 'step-build', label: 'Step-by-Step Build', help: 'Reveal stages in order for processes and procedures.' },
  { value: 'highlight', label: 'Highlight Important Elements', help: 'Draw attention to key labels or regions.' },
  { value: 'motion-emphasis', label: 'Motion to Emphasize Key Concepts', help: 'Use motion sparingly to reinforce main ideas.' }
];

/* ------------------------------------------------------------------ */
/*  Quiz question types (Classroom Activity → Quiz only)               */
/* ------------------------------------------------------------------ */
export const QUIZ_QUESTION_TYPES = [
  { id: 'multiple-choice', label: 'Multiple Choice' },
  { id: 'multiple-response', label: 'Multiple Response (Select All That Apply)' },
  { id: 'true-false', label: 'True/False' },
  { id: 'fill-blank', label: 'Fill in the Blank' },
  { id: 'matching', label: 'Matching' },
  { id: 'drag-drop', label: 'Drag and Drop' },
  { id: 'ordering', label: 'Ordering / Sequence' },
  { id: 'short-answer', label: 'Short Answer' }
];

/**
 * Activity-specific recommendation profiles for the AI Recommendations panel.
 * Key format: `${templateId}:${activitySubtype}` or `${templateId}:*` for all subtypes.
 * Values are display strings + optional apply patches for fields that map to state.
 */
export const ACTIVITY_RECOMMENDATION_PROFILES = {
  'summary:study-guide': {
    items: [
      { label: 'Recommended Graphic Type', value: 'Infographic', apply: { graphicType: 'infographic' } },
      { label: 'Recommended Visual Style', value: 'Clean Line Art', apply: { visualStyle: 'line-art' } },
      { label: 'Recommended Tone', value: 'Professional / Formal', apply: { tone: 'professional' } },
      { label: 'Recommended Color Palette', value: 'Editorial Neutrals', apply: { colorScheme: 'editorial-neutrals' } },
      { label: 'Recommended Amount of Text', value: 'Moderate', apply: { amountOfText: 'moderate-labels' } },
      { label: 'Recommended Complexity', value: 'Moderate', apply: { complexity: 'moderate' } },
      { label: 'Recommended Visual Elements', value: 'Icons + Illustrations; Labeled Diagrams', apply: { iconPreferences: ['icons-illustrations', 'labeled-diagrams'] } },
      { label: 'Recommended Layout', value: 'US Letter (8.5 × 11) Portrait', apply: { sizePreset: 'us-letter-portrait', orientation: 'portrait' } },
      { label: 'Recommended Output Format', value: 'PDF (preferred), PNG', apply: { fileFormat: 'pdf' } },
      { label: 'Recommended Resolution', value: '300 DPI', apply: { resolution: '300' } },
      { label: 'Recommended Animation', value: 'None', apply: { animation: 'none' } },
      { label: 'Recommended Accessibility', value: 'Color-blind safe, Alt text, High readability', apply: { accessibility: ['color-blind-safe', 'alt-text', 'readability-distance', 'wcag-aa'] } },
      { label: 'Recommended Pedagogical Constraints', value: 'Clear visual hierarchy, Factual accuracy', apply: { pedagogical: ['clear-hierarchy', 'factual-accuracy'] } },
      { label: 'AI Model Recommendation', value: 'Claude or ChatGPT', apply: { model: 'claude' } }
    ]
  },
  'summary:chapter-summary': {
    items: [
      { label: 'Recommended Graphic Type', value: 'Infographic', apply: { graphicType: 'infographic' } },
      { label: 'Recommended Visual Style', value: 'Clean Line Art', apply: { visualStyle: 'line-art' } },
      { label: 'Recommended Tone', value: 'Professional / Formal', apply: { tone: 'professional' } },
      { label: 'Recommended Color Palette', value: 'Editorial Neutrals', apply: { colorScheme: 'editorial-neutrals' } },
      { label: 'Recommended Amount of Text', value: 'Moderate', apply: { amountOfText: 'moderate-labels' } },
      { label: 'Recommended Complexity', value: 'Moderate', apply: { complexity: 'moderate' } },
      { label: 'Recommended Visual Elements', value: 'Icons + Illustrations; Labeled Diagrams', apply: { iconPreferences: ['icons-illustrations', 'labeled-diagrams'] } },
      { label: 'Recommended Layout', value: 'US Letter (8.5 × 11) Portrait', apply: { sizePreset: 'us-letter-portrait', orientation: 'portrait' } },
      { label: 'Recommended Output Format', value: 'PDF (preferred), PNG', apply: { fileFormat: 'pdf' } },
      { label: 'Recommended Resolution', value: '300 DPI', apply: { resolution: '300' } },
      { label: 'Recommended Animation', value: 'None', apply: { animation: 'none' } },
      { label: 'Recommended Accessibility', value: 'Color-blind safe, Alt text, High readability', apply: { accessibility: ['color-blind-safe', 'alt-text', 'readability-distance', 'wcag-aa'] } },
      { label: 'Recommended Pedagogical Constraints', value: 'Clear visual hierarchy, Factual accuracy', apply: { pedagogical: ['clear-hierarchy', 'factual-accuracy'] } },
      { label: 'AI Model Recommendation', value: 'Claude or ChatGPT', apply: { model: 'claude' } }
    ]
  },
  'classroom:quiz': {
    items: [
      { label: 'Recommended Graphic Type', value: 'Infographic', apply: { graphicType: 'infographic' } },
      { label: 'Recommended Visual Style', value: 'Clean Line Art', apply: { visualStyle: 'line-art' } },
      { label: 'Recommended Tone', value: 'Professional / Formal', apply: { tone: 'professional' } },
      { label: 'Recommended Color Palette', value: 'Editorial Neutrals', apply: { colorScheme: 'editorial-neutrals' } },
      { label: 'Recommended Amount of Text', value: 'Moderate', apply: { amountOfText: 'moderate-labels' } },
      { label: 'Recommended Complexity', value: 'Moderate', apply: { complexity: 'moderate' } },
      { label: 'Recommended Visual Elements', value: 'Icons + simple illustrations', apply: { iconPreferences: ['icons-illustrations'] } },
      { label: 'Recommended Layout', value: 'Responsive Web / Interactive HTML', apply: { sizePreset: 'responsive-web' } },
      { label: 'Recommended Output Format', value: 'Interactive HTML5', apply: { fileFormat: 'interactive-html' } },
      { label: 'Recommended Animation', value: 'None', apply: { animation: 'none' } },
      { label: 'Recommended Accessibility', value: 'WCAG 2.1 AA', apply: { accessibility: ['alt-text', 'readability-distance', 'wcag-aa', 'high-contrast'] } },
      { label: 'AI Model Recommendation', value: 'Claude or ChatGPT', apply: { model: 'claude' } }
    ]
  },
  'classroom:assignment': {
    items: [
      { label: 'Recommended Graphic Type', value: 'Infographic', apply: { graphicType: 'infographic' } },
      { label: 'Recommended Visual Style', value: 'Clean Line Art', apply: { visualStyle: 'line-art' } },
      { label: 'Recommended Tone', value: 'Professional / Formal', apply: { tone: 'professional' } },
      { label: 'Recommended Color Palette', value: 'Editorial Neutrals', apply: { colorScheme: 'editorial-neutrals' } },
      { label: 'Recommended Amount of Text', value: 'Moderate', apply: { amountOfText: 'moderate-labels' } },
      { label: 'Recommended Complexity', value: 'Moderate', apply: { complexity: 'moderate' } },
      { label: 'Recommended Visual Elements', value: 'Icons + Labeled Diagrams', apply: { iconPreferences: ['icons-illustrations', 'labeled-diagrams'] } },
      { label: 'Recommended Output Format', value: 'PDF/PNG for print; HTML5 only if interactive', apply: { fileFormat: 'pdf' } },
      { label: 'Recommended Accessibility', value: 'WCAG 2.1 AA', apply: { accessibility: ['alt-text', 'readability-distance', 'wcag-aa'] } },
      { label: 'AI Model Recommendation', value: 'Claude or ChatGPT', apply: { model: 'claude' } }
    ]
  },
  'classroom:interactive-activity': {
    items: [
      { label: 'Recommended Graphic Type', value: 'Infographic', apply: { graphicType: 'infographic' } },
      { label: 'Recommended Visual Style', value: 'Clean Line Art', apply: { visualStyle: 'line-art' } },
      { label: 'Recommended Tone', value: 'Professional / Formal', apply: { tone: 'professional' } },
      { label: 'Recommended Color Palette', value: 'Editorial Neutrals', apply: { colorScheme: 'editorial-neutrals' } },
      { label: 'Recommended Amount of Text', value: 'Moderate', apply: { amountOfText: 'moderate-labels' } },
      { label: 'Recommended Complexity', value: 'Moderate', apply: { complexity: 'moderate' } },
      { label: 'Recommended Visual Elements', value: 'Icons + interactive elements', apply: { iconPreferences: ['icons-illustrations'] } },
      { label: 'Recommended Layout', value: 'Responsive Web / Interactive HTML', apply: { sizePreset: 'responsive-web' } },
      { label: 'Recommended Output Format', value: 'Interactive HTML5', apply: { fileFormat: 'interactive-html' } },
      { label: 'Recommended Animation', value: 'None', apply: { animation: 'none' } },
      { label: 'Recommended Accessibility', value: 'WCAG 2.1 AA', apply: { accessibility: ['alt-text', 'readability-distance', 'wcag-aa', 'high-contrast'] } },
      { label: 'AI Model Recommendation', value: 'Claude or ChatGPT', apply: { model: 'claude' } }
    ]
  }
};
