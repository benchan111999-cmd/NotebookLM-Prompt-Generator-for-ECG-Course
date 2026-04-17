import { courseData, lectureRequirementProfiles, type GenerationMode } from '../../data/courseData';

export const MAX_CUSTOM_FOCUS_LENGTH = 600;

export const sanitizeCustomFocus = (value: string): string => {
  return value
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_CUSTOM_FOCUS_LENGTH);
};

type BuildPromptArgs = {
  selectedModule: string;
  selectedTopics: string[];
  mode: GenerationMode;
  useStyle: boolean;
  customFocus: string;
};

export const buildPrompt = ({
  selectedModule,
  selectedTopics,
  mode,
  useStyle,
  customFocus,
}: BuildPromptArgs): string => {
  if (selectedTopics.length === 0) {
    return 'Please select at least one topic to generate a prompt...';
  }

  const modInfo = courseData[selectedModule];
  const moduleNumber = selectedModule.match(/Module (\d+)/)?.[1] || '';
  let prompt =
    '### ROLE\nYou are an expert Cardiology Educator and ECG Specialist. Your goal is to create a high-fidelity slide deck based on the provided source documents.\n\n';

  prompt += `### SOURCE PRIORITIZATION\nCross-reference and synthesize information from the following sources:\n1. **Master Curriculum**: Use all uploaded PDF files as the primary clinical and theoretical authority.\n2. **Module ${moduleNumber} Outline**: Use the file named "Module ${moduleNumber} Outline" (or similar version) to drive the specific structure and flow of this deck.\n\n`;

  if (useStyle) {
    prompt +=
      '### STYLE GUIDELINES\nRefer strictly to the uploaded "Style Template" document. You must follow the exact formatting, layout, and structural requirements for:\n- The Front Page/Title Slide\n- Section Headers\n- Content Slides\n- Footer/Reference layout\n\n';
  }

  if (mode === 'lecture') {
    prompt += `### TASK: LECTURE SLIDES\nCreate a detailed slide deck for the following topics within ${selectedModule}:\n${selectedTopics.map((t) => `- ${t}`).join('\n')}\n\n`;
    prompt += `### PEDAGOGICAL STRATEGY\n${modInfo.strategy}\n\n`;

    const profile = lectureRequirementProfiles[modInfo.lectureProfile];
    prompt += `### ADAPTIVE SLIDE REQUIREMENTS (${profile.title})\nFor each slide, provide:\n${profile.items.map((item, index) => `${index + 1}. ${item}`).join('\n')}\n`;
    if (profile.notes && profile.notes.length > 0) {
      prompt += `\nAdditional emphasis:\n${profile.notes.map((note) => `- ${note}`).join('\n')}\n`;
    }

    if (selectedTopics.length <= 2) {
      prompt += `\n### ADAPTIVE DEPTH CONTROL\nBecause only ${selectedTopics.length} topic(s) were selected, increase conceptual depth and include more nuanced explanations/examples per topic.\n`;
    } else if (selectedTopics.length >= 4) {
      prompt += `\n### ADAPTIVE DEPTH CONTROL\nBecause ${selectedTopics.length} topics were selected, prioritize must-know diagnostic and management points first, then add detail only if space allows.\n`;
    }
  } else {
    const questionCount = selectedTopics.length <= 2 ? 8 : 10;
    prompt += `### TASK: EXERCISE GENERATION\nGenerate ${questionCount} high-quality clinical exercise questions based on the following topics:\n${selectedTopics.map((t) => `- ${t}`).join('\n')}\n\n`;
    prompt += `### EXERCISE FORMAT\nFor each of the ${questionCount} questions, use this exact structure:\n1. Case Presentation: (Patient age, gender, chief complaint, vital signs)\n2. ECG Finding: (Describe the specific ECG abnormalities found)\n3. Multiple Choice Question: (A high-yield clinical question with 4 options)\n4. Correct Answer & Rationale: (Explain why the answer is correct and why others are wrong, referencing the source documents)\n`;
  }

  if (customFocus) {
    prompt += `\n### ADDITIONAL FOCUS\n${sanitizeCustomFocus(customFocus)}\n`;
  }

  prompt +=
    '\n\n### FINAL INSTRUCTION\nEnsure all information is extracted strictly from the uploaded sources. If information is missing, flag it as [Information not found in source].';

  return prompt;
};
