/**
 * Prompt Builder — composes the master instructional-graphic prompt
 * from the current application state.
 *
 * Model-specific templates (role, style notes, closing) live in config.js
 * under MODELS. Quick-start type context further tailors the opening line.
 */

import {
  GRAPHIC_TYPES,
  OPTIONS,
  ICON_PREFERENCES,
  ACCESSIBILITY,
  PEDAGOGICAL,
  MODELS,
  QUICK_STARTS,
  ANIMATION_OPTIONS,
  QUIZ_QUESTION_TYPES,
  PROG_VIDEO_OPTIONS
} from './config.js';

/** Look up a label from an options list by value */
function labelOf(list, value) {
  const item = list.find(o => o.value === value);
  return item ? item.label : value || '';
}

/** Look up graphic type object */
function getGraphicType(id) {
  return GRAPHIC_TYPES.find(g => g.id === id) || null;
}

/** Look up model object */
function getModel(id) {
  return MODELS.find(m => m.id === id) || MODELS[MODELS.length - 1];
}

/** Active quick-start template + selected type label */
function getTemplateContext(state) {
  if (!state.templateId) return null;
  const qs = QUICK_STARTS.find(q => q.id === state.templateId);
  if (!qs) return null;
  const typeValue = state[qs.typeKey] || qs.defaultType;
  const typeOpt = (qs.typeOptions || []).find(o => o.value === typeValue);
  return {
    template: qs,
    typeValue,
    typeLabel: typeOpt ? typeOpt.label : typeValue,
    typeFieldLabel: qs.typeLabel
  };
}

/**
 * Role / intent line — prefers quick-start+type tailoring when present,
 * otherwise falls back to the model's default role.
 */
function buildRoleLine(state, model, ctx) {
  if (!ctx) return model.role;

  const { template, typeLabel, typeValue } = ctx;
  const map = {
    classroom: {
      quiz: `${model.role} Design it specifically to support a Quiz: help students prepare for or engage with quiz-style questions and recall.`,
      assignment: `${model.role} Design it specifically to support an Assignment: clarify expectations, steps, or key concepts needed to complete the work.`,
      'interactive-activity': `${model.role} Design it specifically to support an Interactive Activity: guide participation and provide visual anchors for hands-on engagement.`
    },
    lecture: {
      lesson: `${model.role} Design it for a Lesson: support clear explanation and concept development during instruction.`,
      powerpoint: `${model.role} Optimize it for a PowerPoint slide: keep hierarchy clear and text readable when projected.`,
      examples: `${model.role} Focus on Examples: emphasize concrete instances, comparisons, or worked samples that illustrate the concept.`
    },
    training: {
      'faculty-training': `${model.role} Design it for Faculty Training: support professional development for instructors and adult learners.`,
      workshop: `${model.role} Design it for a Workshop: support active, hands-on professional learning and practical application.`
    },
    summary: {
      'study-guide': `${model.role} Design it as a Study Guide: prioritize scannable structure, key terms, and review-friendly layout.`,
      'chapter-summary': `${model.role} Design it as a Chapter Summary: condense essential ideas into a clear hierarchical overview.`
    }
  };

  const byTemplate = map[template.id];
  if (byTemplate && byTemplate[typeValue]) return byTemplate[typeValue];
  return `${model.role} Context: ${template.label} — ${typeLabel}.`;
}

/** Section heading helper */
function sectionHeading(title, model) {
  if (model.sectionStyle === 'numbered') return title;
  return `## ${title}`;
}

/**
 * Build the complete prompt string from state.
 * Structure is shared; framing (role, style notes, closing) is model-specific.
 */
function labelProg(list, value) {
  const item = list.find(o => o.value === value);
  return item ? item.label : value || '';
}

/** Specialized prompt package for Lecture → Programming Video */
function buildProgrammingVideoPrompt(state, model) {
  const lines = [];
  const lang = labelProg(PROG_VIDEO_OPTIONS.language, state.progLanguage);
  const audience = labelProg(PROG_VIDEO_OPTIONS.audience, state.progAudienceLevel);
  const length = labelProg(PROG_VIDEO_OPTIONS.videoLength, state.progVideoLength);
  const presenter = labelProg(PROG_VIDEO_OPTIONS.presenter, state.progPresenter);
  const style = labelProg(PROG_VIDEO_OPTIONS.presentationStyle, state.progPresentationStyle);
  const anim = labelProg(PROG_VIDEO_OPTIONS.codeAnimation, state.progCodeAnimation);
  const explain = labelProg(PROG_VIDEO_OPTIONS.explanationStyle, state.progExplanationStyle);
  const includeIds = state.progInclude || [];
  const includeLabels = includeIds
    .map(id => PROG_VIDEO_OPTIONS.include.find(i => i.id === id)?.label)
    .filter(Boolean);

  const hasCode = Boolean(state.progSourceCode?.trim());
  const animMode = state.progCodeAnimation || 'type-line-by-line';

  lines.push('You are producing a professional instructional programming video for a college classroom.');
  lines.push('Your job is to teach the EXACT program provided below — not a generic example, not a simplified version, and not a summary.');
  lines.push('');

  lines.push(sectionHeading('Critical Code Integrity Rule (mandatory)', model));
  lines.push('Use the uploaded/pasted source code exactly as provided below. Display that actual code throughout the video.');
  lines.push('Never replace the uploaded code with another programming example.');
  lines.push('Never summarize the program instead of walking through it.');
  lines.push('Never skip executable statements.');
  lines.push('Never modify the uploaded source code.');
  lines.push('Never rename variables.');
  lines.push('Never remove comments.');
  lines.push('Never change values, operators, or string literals.');
  lines.push('Never change formatting, indentation, spacing, or line breaks.');
  lines.push('Never invent additional code that is not in the provided source.');
  lines.push('Explain the program line by line while the instructor speaks and the code is typed or highlighted on screen.');
  lines.push('');

  lines.push(sectionHeading('Course & Audience', model));
  if (state.progCourseName?.trim()) lines.push(`- Course: ${state.progCourseName.trim()}`);
  if (state.topic?.trim()) lines.push(`- Topic / Lesson Title: ${state.topic.trim()}`);
  lines.push(`- Programming Language: ${lang}`);
  lines.push(`- Audience Level: ${audience}`);
  lines.push(`- Target Video Length: ${length}`);
  if (state.learningObjective?.trim()) {
    lines.push(`- Learning Objective: ${state.learningObjective.trim()}`);
  }
  lines.push('');

  lines.push(sectionHeading('Presentation', model));
  lines.push(`- Presenter: ${presenter}`);
  lines.push(`- Presentation Style: ${style}`);
  lines.push(`- Code Animation: ${anim}`);
  lines.push(`- Explanation Style: ${explain}`);
  lines.push('- Visual style: professional college classroom');
  lines.push('- Tone: friendly, professional, and educational');
  lines.push('- Accessibility: closed captions, high contrast, large readable code, ADA/WCAG 2.1 AA');
  lines.push('');

  if (presenter.toLowerCase().includes('female')) {
    lines.push('Use a friendly female college instructor as the presenter. Show the instructor speaking naturally while teaching.');
  } else if (presenter.toLowerCase().includes('male')) {
    lines.push('Use a friendly male college instructor as the presenter. Show the instructor speaking naturally while teaching.');
  } else {
    lines.push('Use a clear professional voice-over with the code editor as the primary visual.');
  }
  if (style.toLowerCase().includes('split')) {
    lines.push('Present the instructor and code editor in a split-screen layout.');
  }
  lines.push('');

  lines.push(sectionHeading('Source Code to Teach (use this exact code — do not substitute)', model));
  if (state.progCodeFileName) lines.push(`- Source file name: ${state.progCodeFileName}`);
  if (hasCode) {
    lines.push('- The following source code is the ONLY program that may appear in the video:');
    lines.push('```' + (state.progLanguage === 'cpp' ? 'cpp' : state.progLanguage || ''));
    lines.push(state.progSourceCode.replace(/\s+$/, ''));
    lines.push('```');
  } else {
    lines.push('- [No source code has been provided yet. Do not invent a sample program. Ask for the instructor’s exact source code before generating the video walkthrough.]');
  }
  lines.push('');

  lines.push(sectionHeading('Mandatory Line-by-Line Teaching Requirements', model));
  lines.push('Follow every rule below. Do not omit any of them.');
  lines.push('');
  lines.push('1. Walk through the program in execution order. Explain statements in the order the computer would execute them (not merely top-to-bottom if order differs).');
  lines.push('2. Explain the purpose of every statement — why that line exists and what it contributes to the program’s result.');
  lines.push('3. Never skip an executable statement. Cover declarations, assignments, method calls, control-structure headers, and output statements.');
  lines.push('4. When a language keyword, variable, data type, operator, method, comment, or punctuation symbol first appears, explain what it means and why it is used. Cover braces, parentheses, semicolons, quotation marks, and string concatenation when they appear.');
  lines.push('5. Highlight the current line on screen while that line is being explained.');
  if (animMode === 'type-line-by-line') {
    lines.push('6. Code animation: Type the program naturally, one statement (or line) at a time, while the instructor explains it. Do not flash the entire finished program first.');
  } else if (animMode === 'highlight-lines') {
    lines.push('6. Code animation: Show the completed program, then highlight each line as the instructor explains it.');
  } else if (animMode === 'type-important') {
    lines.push('6. Code animation: Type only the important statements while explaining them; still do not skip explaining any executable line.');
  } else {
    lines.push('6. Code animation: Follow the selected animation mode while keeping the explanation line-by-line.');
  }
  lines.push('7. Match IPO or pseudocode steps to the corresponding source-code statements so students see how design maps to code.');
  lines.push('8. Show how variable values change during execution (variable trace). Update on-screen values as assignments and updates occur.');
  lines.push('9. Explain exactly how the program output is produced. Display the final output exactly as it would appear when the program runs.');
  lines.push('10. Do not summarize the program in place of a line-by-line walkthrough. A short closing review is allowed only after every executable statement has been taught.');
  lines.push('11. End with a review of the key concepts and common student mistakes related to this exact program.');
  if (audience.toLowerCase().includes('beginner')) {
    lines.push('12. Use clear, beginner-friendly language suitable for first-semester college students.');
  }
  lines.push('');

  if (includeLabels.length) {
    lines.push(sectionHeading('Include These Instructional Elements', model));
    includeLabels.forEach(l => lines.push(`- ${l}`));
    lines.push('');
  }

  lines.push(sectionHeading('Required Generated Outputs', model));
  lines.push('Produce all of the following:');
  lines.push('1. Video Generation Prompt');
  lines.push('2. Scene-by-Scene Storyboard');
  lines.push('3. Narration Script');
  lines.push('4. On-Screen Visual Instructions');
  lines.push('5. Code Animation Instructions');
  lines.push('6. Pseudocode Mapping');
  lines.push('7. Variable Trace');
  lines.push('8. Program Flow');
  lines.push('9. Expected Output');
  lines.push('10. Common Student Mistakes');
  lines.push('11. Closing Summary');
  lines.push('');

  if (state.extraNotes?.trim()) {
    lines.push(sectionHeading('Additional Instructor Notes', model));
    lines.push(state.extraNotes.trim());
    lines.push('');
  }

  lines.push(sectionHeading('Generation Rules', model));
  lines.push('- Produce a complete instructional programming VIDEO package for the exact source code above — not a static graphic.');
  lines.push('- Keep every instructional element tied to this specific program (IPO mapping, variable values, output, and mistakes must match the code).');
  lines.push('- Prefer accuracy and learner clarity over entertainment or decorative effects.');
  lines.push('- If a detail is unspecified, make one grounded assumption appropriate for a first-semester college programming class and state it briefly.');
  lines.push('- Deliver all required outputs listed above in a clear, usable structure a video-production AI or instructor can follow scene by scene.');

  return lines.join('\n').trim() + '\n';
}

export function buildPrompt(state) {
  const lines = [];
  const model = getModel(state.model);
  const graphic = getGraphicType(state.graphicType);
  const ctx = getTemplateContext(state);

  // Programming Video uses a specialized prompt package
  if (state.templateId === 'lecture' && state.outputType === 'programming-video') {
    return buildProgrammingVideoPrompt(state, model);
  }

  // --- Role (model default + optional quick-start type tailoring) ---
  lines.push(buildRoleLine(state, model, ctx));
  lines.push('');

  // --- Model style note ---
  if (model.styleNotes) {
    lines.push(`Style guidance for ${model.name}: ${model.styleNotes}`);
    lines.push('');
  }

  // --- Content source ---
  if (state.contentSource === 'file') {
    lines.push(sectionHeading('Content Source', model));
    lines.push('- Source: Uploaded file' + (state.uploadedFileName ? ` (${state.uploadedFileName})` : ''));
    if (state.extractedContent?.trim()) {
      lines.push('- Extracted text context (use as primary content reference):');
      lines.push(state.extractedContent.trim().slice(0, 4000));
    } else if (state.uploadedFileName) {
      lines.push('- Note: Binary file selected; base the graphic on the topic and learning objective below, and any additional instructions.');
    }
    lines.push('');
  }

  // --- Content ---
  lines.push(sectionHeading('Content', model));
  if (state.topic?.trim()) {
    lines.push(`- Topic / Lesson Title: ${state.topic.trim()}`);
  } else {
    lines.push('- Topic / Lesson Title: [Please specify the topic]');
  }

  if (ctx) {
    lines.push(`- Context: ${ctx.template.label} — ${ctx.typeFieldLabel}: ${ctx.typeLabel}`);
  }

  if (state.subjectArea) {
    lines.push(`- Subject Area: ${labelOf(OPTIONS.subjectArea, state.subjectArea)}`);
  }
  if (state.gradeLevel) {
    lines.push(`- Grade / Skill Level: ${labelOf(OPTIONS.gradeLevel, state.gradeLevel)}`);
  }
  if (state.audience?.trim()) {
    lines.push(`- Target Audience: ${state.audience.trim()}`);
  }
  if (state.learningObjective?.trim()) {
    lines.push(`- Learning Objective: By the end of viewing this graphic, the learner will be able to ${state.learningObjective.trim()}`);
  }
  if (state.bloomLevel) {
    lines.push(`- Bloom's Taxonomy Level: ${labelOf(OPTIONS.bloomLevel, state.bloomLevel)}`);
  }
  lines.push('');

  // --- Quiz settings (Classroom Activity → Quiz only) ---
  if (state.templateId === 'classroom' && state.activityType === 'quiz') {
    const count = state.quizQuestionCount || 10;
    const types = (state.quizQuestionTypes || [])
      .map(id => QUIZ_QUESTION_TYPES.find(q => q.id === id)?.label)
      .filter(Boolean);
    const typeList = types.length ? types.join(', ') : 'Multiple Choice';

    lines.push(sectionHeading('Quiz Requirements', model));
    lines.push(`Create exactly ${count} interactive quiz questions using ${typeList} question types. Create a balanced variety of the selected question types throughout the quiz.`);
    lines.push('');
    lines.push('Quiz delivery and interaction rules (required):');
    lines.push('- Create a single self-contained HTML5 file with embedded CSS and JavaScript.');
    lines.push('- Require the student to enter their full name before starting the quiz.');
    lines.push('- Allow only one attempt per question.');
    lines.push('- Lock each question after it is answered.');
    lines.push('- Do not reveal the correct answer if the student answers incorrectly.');
    lines.push('- Display only whether the answer is correct or incorrect.');
    lines.push('- Automatically calculate the total points and percentage score.');
    lines.push("- Display the student's name, total points earned, total possible points, and percentage score at the end of the quiz.");
    lines.push('- Make the quiz responsive, keyboard accessible, and ADA/WCAG 2.1 AA compliant.');
    lines.push('');
  }

  // --- Graphic type ---
  lines.push(sectionHeading('Graphic Type', model));
  if (graphic) {
    lines.push(`- Type: ${graphic.title}`);
    lines.push(`- Purpose: ${graphic.description}`);
    lines.push(`- Design intent: ${graphic.subtitle}`);
  } else {
    lines.push('- Type: [Select a graphic type]');
  }
  lines.push('');

  // --- Visual style ---
  lines.push(sectionHeading('Visual Style & Aesthetic', model));
  lines.push(`- Visual Style: ${labelOf(OPTIONS.visualStyle, state.visualStyle)}`);
  lines.push(`- Tone: ${labelOf(OPTIONS.tone, state.tone)}`);
  lines.push(`- Color Palette: ${labelOf(OPTIONS.colorScheme, state.colorScheme)}`);
  lines.push(`- Complexity / Density: ${labelOf(OPTIONS.complexity, state.complexity)}`);

  if (state.iconPreferences?.length) {
    const iconLabels = state.iconPreferences
      .map(id => ICON_PREFERENCES.find(p => p.id === id)?.label)
      .filter(Boolean);
    if (iconLabels.length) {
      lines.push(`- Icon & Illustration Preference: ${iconLabels.join('; ')}`);
    }
  }
  lines.push('');

  // --- Layout & size ---
  lines.push(sectionHeading('Layout & Image Size', model));
  lines.push(`- Size Preset: ${labelOf(OPTIONS.sizePreset, state.sizePreset)}`);
  lines.push(`- Orientation: ${labelOf(OPTIONS.orientation, state.orientation)}`);
  lines.push(`- Amount of Text: ${labelOf(OPTIONS.amountOfText, state.amountOfText)}`);
  lines.push('');

  // --- Output specs ---
  lines.push(sectionHeading('Output Format', model));
  lines.push(`- File Format: ${labelOf(OPTIONS.fileFormat, state.fileFormat)}`);
  lines.push(`- Resolution: ${labelOf(OPTIONS.resolution, state.resolution)}`);
  lines.push(`- Transparent Background: ${state.transparentBg ? 'Yes' : 'No'}`);
  lines.push(`- Include Safe Margins / Bleed Area: ${state.safeMargins ? 'Yes' : 'No'}`);
  lines.push('');

  // --- Animation (optional) ---
  const anim = ANIMATION_OPTIONS.find(a => a.value === (state.animation || 'none'));
  if (anim && anim.value !== 'none') {
    lines.push(sectionHeading('Animation', model));
    lines.push(`- Animation: ${anim.label}`);
    lines.push(`- Guidance: ${anim.help}`);
    lines.push('- Apply animation only where it supports learning; keep motion purposeful and accessible.');
    const fmt = (state.fileFormat || '').toLowerCase();
    if (fmt === 'interactive-html') {
      lines.push('- Output is Interactive HTML: implement the animation with embedded CSS/JS so it plays in the browser.');
    } else {
      lines.push('- Note: Selected file format is static; describe the intended animation in captions or production notes, but do not assume the image file itself can animate.');
    }
    lines.push('');
  }

  // --- Accessibility ---
  const activeA11y = (state.accessibility || [])
    .map(id => ACCESSIBILITY.find(p => p.id === id)?.label)
    .filter(Boolean);

  if (activeA11y.length) {
    lines.push(sectionHeading('Accessibility', model));
    activeA11y.forEach(label => lines.push(`- ${label}`));
    lines.push('');
  }

  // --- Pedagogical constraints ---
  const activePed = (state.pedagogical || [])
    .map(id => PEDAGOGICAL.find(p => p.id === id)?.label)
    .filter(Boolean);

  if (activePed.length) {
    lines.push(sectionHeading('Pedagogical Constraints', model));
    activePed.forEach(label => lines.push(`- ${label}`));
    lines.push('');
  }

  // --- Extra notes ---
  if (state.extraNotes?.trim()) {
    lines.push(sectionHeading('Additional Instructions', model));
    lines.push(state.extraNotes.trim());
    lines.push('');
  }

  // --- Model-specific generation instructions ---
  lines.push(sectionHeading('Generation Instructions', model));
  lines.push(`Target model: ${model.name} (${model.tagline})`);
  if (Array.isArray(model.closing)) {
    model.closing.forEach(line => lines.push(line));
  } else if (model.closing) {
    lines.push(model.closing);
  } else if (model.promptHint) {
    lines.push(model.promptHint);
  }

  return lines.join('\n').trim();
}

/**
 * Returns a short status summary for the UI (completeness indicator).
 */
export function getPromptStatus(state) {
  const hasTopic = Boolean(state.topic?.trim());
  const hasType = Boolean(state.graphicType);
  const hasObjective = Boolean(state.learningObjective?.trim());

  if (hasTopic && hasType && hasObjective) {
    return { level: 'complete', label: 'Ready to generate' };
  }
  if (hasTopic && hasType) {
    return { level: 'partial', label: 'Add a learning objective for best results' };
  }
  if (hasTopic || hasType) {
    return { level: 'partial', label: 'Select a topic and graphic type' };
  }
  return {
    level: 'empty',
    label: 'Begin by entering a topic and selecting a graphic type'
  };
}
