export type RequirementProfile = {
  title: string;
  items: string[];
  notes?: string[];
};

export type GenerationMode = 'lecture' | 'exercise';

export type LectureProfile = 'foundation' | 'rhythm' | 'cad' | 'advanced';

export type ModuleConfig = {
  strategy: string;
  topics: string[];
  lectureProfile: LectureProfile;
  exerciseCount?: number;
};

export const lectureRequirementProfiles: Record<LectureProfile, RequirementProfile> = {
  foundation: {
    title: 'Foundational Knowledge Slides',
    items: [
      'Slide Title',
      'Core Bullet Points (concise, high-yield)',
      'Mechanism Focus: Explain physiological or conceptual flow in plain teaching language',
      'Visual Suggestion: Describe exactly what ECG strip, diagram, or image should be placed on the slide. **CRITICAL: Keep all anatomical, physiological, and physical details accurate.**',
    ],
    notes: ['Prefer concept-building progression (basic → applied).'],
  },
  rhythm: {
    title: 'Rhythm/Arrhythmia Diagnostic Slides',
    items: [
      'Slide Title',
      'Core Bullet Points (concise, high-yield)',
      'ECG Strip Requirement: Include an accurate ECG strip showing the exact rhythm or arrhythmia',
      'Diagnostic Criteria: Provide detailed criteria for that rhythm/arrhythmia',
      'Recognition Summary: A featured statement showing how this rhythm is recognised and differentiated',
      'Visual Suggestion: Describe any additional diagram/image needed. **CRITICAL: Keep all anatomical, physiological, and physical details accurate.**',
    ],
    notes: ['Prioritize side-by-side differentiation for look-alike rhythms.'],
  },
  cad: {
    title: 'Coronary / Ischemia Pattern Slides',
    items: [
      'Slide Title',
      'Core Bullet Points (concise, high-yield)',
      'Lead Correlation: State lead group and likely anatomical territory',
      'Temporal Evolution: Note stage progression where relevant (hyperacute → ST elevation → Q-wave/T-wave changes)',
      'Visual Suggestion: Describe ECG or anatomy visuals with precise lead labeling and localization',
    ],
    notes: ['Emphasize localization and timeline interpretation.'],
  },
  advanced: {
    title: 'High-Risk & Integrative Clinical Slides',
    items: [
      'Slide Title',
      'Core Bullet Points (concise, high-yield)',
      'Red Flags: List immediate danger signs or escalation triggers',
      'Correlation Layer: Link ECG findings with electrolytes/genetics/hemodynamics where relevant',
      'Visual Suggestion: Describe ECG or supportive visuals with clinically accurate detail',
    ],
    notes: ['Highlight emergency recognition and practical decision support.'],
  },
};

export const courseData: Record<string, ModuleConfig> = {
  'Module 1: Foundations of Cardiac Electrophysiology & Public Health': {
    strategy:
      'The Explainer: Focus on physiological mechanisms, ion flux, and conceptual flow. Request descriptions for diagrams.',
    lectureProfile: 'foundation',
    topics: [
      'Heart Disease Burden: Overview and impact of Coronary Heart Disease',
      'Anatomy and Physiology of the Heart: Chambers, valves, and circulation mechanics',
      'The Cardiac Conduction System: SA node, AV node, Bundle of His, and Purkinje system',
      'Action Potentials and Ion Flux: Na+, K+, Ca2+ movements and refractory periods',
    ],
  },
  'Module 2: Technical Fundamentals and the 8-Step Framework': {
    strategy:
      'The Manual: Focus on systematic algorithms, checklists, and mathematical formulas (e.g., the 300 rule).',
    lectureProfile: 'rhythm',
    topics: [
      'Principles of ECG Recording: Cardiac Vectors and rules of summation',
      'The 12-Lead Configuration: Limb, augmented, and precordial leads',
      'Technical Standards: WCT, electrode placement, and Color Coding (AHA/IEC)',
      'Alternative Systems: EASI electrode placement for continuous monitoring',
      'Normal Waveform Analysis: ECG Paper standards and Waveform Variations',
      '8-Step: Rhythm (P-P and R-R intervals)',
      '8-Step: Rate calculation for regular and irregular rhythms',
      '8-Step: Visible P wave, PR Interval, and 1:1 Conduction',
      '8-Step: QRS Complex (Narrow vs. Wide criteria)',
      '8-Step: QRS Axis (Quadrant and Equiphasic methods)',
      '8-Step: Tachycardia Assessment and re-entry screening',
      '8-Step: Bradycardia Assessment and QTc interval',
      '8-Step: ST Segment, T Wave, and Q Wave Changes',
    ],
  },
  'Module 3: Conduction Defects and Brady-arrhythmias': {
    strategy:
      "The Comparator: Focus on distinguishing between similar patterns. Request 'Key Diagnostic Features' tables.",
    lectureProfile: 'rhythm',
    topics: [
      'The Escape Mechanism: Concept, Hierarchy of Automaticity, and Escape vs. Ectopy',
      'Junctional and Idioventricular Escape Rhythms: Identification criteria',
      'SA Node Disorders: Sinus Bradycardia, Sinus Arrest, and Sick-Sinus-Syndrome',
      'SA Exit Blocks: 1st, 2nd (Type I/II), and 3rd-degree classification',
      'AV Blocks: 1st, 2nd (Mobitz I vs. II), and 3rd Degree (Complete) AVB',
      'Bundle Branch Blocks: Diagnostic criteria for LBBB and RBBB',
      'Fascicular Blocks: Concepts of Hemiblocks',
      'Pacemaker ECG: Atrial, Ventricular, and Dual-chamber fundamentals',
      'Pacemaker Troubleshooting: Capture, Sensing, Fusion, and Pseudofusion beats',
    ],
  },
  'Module 4: Ectopic Beats and Tachy-arrhythmias': {
    strategy:
      "The Decision Tree: Focus on rapid triage and diagnostic algorithms. Request 'If This → Then That' slide structures.",
    lectureProfile: 'rhythm',
    topics: [
      'Premature Complexes: Recognition of PACs, PJCs, and PVCs',
      'Narrow Complex Tachycardia: SVT (Atrial Tachy, AVNRT, Flutter, Fibrillation)',
      'SVT Management: Vagal Maneuvers and Adenosine',
      'Wide Complex Tachycardia: VT, VF, and Ashman Phenomenon',
      'Advanced Concepts: Pre-excitation (WPW) and Life-Threatening Arrest Rhythms (Asystole/PEA)',
    ],
  },
  'Module 5: Coronary Artery Disease and ACS Management': {
    strategy:
      'The Mapper: Focus on temporal evolution (Hyperacute → Q-wave) and lead-to-anatomy localization.',
    lectureProfile: 'cad',
    topics: [
      'Pathogenesis and Evolution: Atherosclerosis and STEMI evolution',
      'Localization of MI: Contiguous leads, RV leads (V4-6R), and Posterior leads (V7-9)',
      "Complex Ischemic Presentations: AMI with LBBB (Sgarbossa's Criteria)",
      'Non-Obstructive Patterns: MINOCA and Takotsubo Cardiomyopathy',
      'Management Framework: Risk stratification, pharmacotherapy, and Door-to-Balloon goals',
    ],
  },
  'Module 6: Advanced and Post-Acute Care': {
    strategy:
      "The Specialist: Focus on 'Red Flag' patterns and correlation between electrolytes and waveforms.",
    lectureProfile: 'advanced',
    topics: [
      'High-Risk MI Variants: Wellens Syndrome, De Winter sign, and Shark Fin pattern',
      'Pulmonary Embolism (PE): S1Q3T3, RV strain, and T-wave inversions',
      'Genetic Basis: Brugada Syndrome and Long QT Syndrome (Schwartz-score)',
      'Electrolyte Disturbances: K+, Ca2+, and Mg2+ effects',
      'Chamber Changes: Atrial Enlargement and Ventricular Hypertrophy',
      'Miscellaneous: Low Voltage and Electrical Alternans',
      'Post-Acute Care: Cardiac Rehab, Digital Health, and Secondary Prevention targets',
    ],
  },
};
