import { useState, useEffect, useMemo } from 'react';
import { HeartPulse, Presentation, PenTool, Copy, Check, Info, AlertCircle, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, ThinkingLevel } from "@google/genai";

const getAI = () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === 'MY_GEMINI_API_KEY') {
    throw new Error('Gemini API Key is not configured. Please set GEMINI_API_KEY in your environment.');
  }
  return new GoogleGenAI({ apiKey: key });
};

const courseData: Record<string, { strategy: string; topics: string[] }> = {
  "Module 1: Foundations of Cardiac Electrophysiology & Public Health": {
    strategy: "The Explainer: Focus on physiological mechanisms, ion flux, and conceptual flow. Request descriptions for diagrams.",
    topics: [
      "Heart Disease Burden: Overview and impact of Coronary Heart Disease",
      "Anatomy and Physiology of the Heart: Chambers, valves, and circulation mechanics",
      "The Cardiac Conduction System: SA node, AV node, Bundle of His, and Purkinje system",
      "Action Potentials and Ion Flux: Na+, K+, Ca2+ movements and refractory periods"
    ]
  },
  "Module 2: Technical Fundamentals and the 8-Step Framework": {
    strategy: "The Manual: Focus on systematic algorithms, checklists, and mathematical formulas (e.g., the 300 rule).",
    topics: [
      "Principles of ECG Recording: Cardiac Vectors and rules of summation",
      "The 12-Lead Configuration: Limb, augmented, and precordial leads",
      "Technical Standards: WCT, electrode placement, and Color Coding (AHA/IEC)",
      "Alternative Systems: EASI electrode placement for continuous monitoring",
      "Normal Waveform Analysis: ECG Paper standards and Waveform Variations",
      "8-Step: Rhythm (P-P and R-R intervals)",
      "8-Step: Rate calculation for regular and irregular rhythms",
      "8-Step: Visible P wave, PR Interval, and 1:1 Conduction",
      "8-Step: QRS Complex (Narrow vs. Wide criteria)",
      "8-Step: QRS Axis (Quadrant and Equiphasic methods)",
      "8-Step: Tachycardia Assessment and re-entry screening",
      "8-Step: Bradycardia Assessment and QTc interval",
      "8-Step: ST Segment, T Wave, and Q Wave Changes"
    ]
  },
  "Module 3: Conduction Defects and Brady-arrhythmias": {
    strategy: "The Comparator: Focus on distinguishing between similar patterns. Request 'Key Diagnostic Features' tables.",
    topics: [
      "The Escape Mechanism: Concept, Hierarchy of Automaticity, and Escape vs. Ectopy",
      "Junctional and Idioventricular Escape Rhythms: Identification criteria",
      "SA Node Disorders: Sinus Bradycardia, Sinus Arrest, and Sick-Sinus-Syndrome",
      "SA Exit Blocks: 1st, 2nd (Type I/II), and 3rd-degree classification",
      "AV Blocks: 1st, 2nd (Mobitz I vs. II), and 3rd Degree (Complete) AVB",
      "Bundle Branch Blocks: Diagnostic criteria for LBBB and RBBB",
      "Fascicular Blocks: Concepts of Hemiblocks",
      "Pacemaker ECG: Atrial, Ventricular, and Dual-chamber fundamentals",
      "Pacemaker Troubleshooting: Capture, Sensing, Fusion, and Pseudofusion beats"
    ]
  },
  "Module 4: Ectopic Beats and Tachy-arrhythmias": {
    strategy: "The Decision Tree: Focus on rapid triage and diagnostic algorithms. Request 'If This → Then That' slide structures.",
    topics: [
      "Premature Complexes: Recognition of PACs, PJCs, and PVCs",
      "Narrow Complex Tachycardia: SVT (Atrial Tachy, AVNRT, Flutter, Fibrillation)",
      "SVT Management: Vagal Maneuvers and Adenosine",
      "Wide Complex Tachycardia: VT, VF, and Ashman Phenomenon",
      "Advanced Concepts: Pre-excitation (WPW) and Life-Threatening Arrest Rhythms (Asystole/PEA)"
    ]
  },
  "Module 5: Coronary Artery Disease and ACS Management": {
    strategy: "The Mapper: Focus on temporal evolution (Hyperacute → Q-wave) and lead-to-anatomy localization.",
    topics: [
      "Pathogenesis and Evolution: Atherosclerosis and STEMI evolution",
      "Localization of MI: Contiguous leads, RV leads (V4-6R), and Posterior leads (V7-9)",
      "Complex Ischemic Presentations: AMI with LBBB (Sgarbossa's Criteria)",
      "Non-Obstructive Patterns: MINOCA and Takotsubo Cardiomyopathy",
      "Management Framework: Risk stratification, pharmacotherapy, and Door-to-Balloon goals"
    ]
  },
  "Module 6: Advanced and Post-Acute Care": {
    strategy: "The Specialist: Focus on 'Red Flag' patterns and correlation between electrolytes and waveforms.",
    topics: [
      "High-Risk MI Variants: Wellens Syndrome, De Winter sign, and Shark Fin pattern",
      "Pulmonary Embolism (PE): S1Q3T3, RV strain, and T-wave inversions",
      "Genetic Basis: Brugada Syndrome and Long QT Syndrome (Schwartz-score)",
      "Electrolyte Disturbances: K+, Ca2+, and Mg2+ effects",
      "Chamber Changes: Atrial Enlargement and Ventricular Hypertrophy",
      "Miscellaneous: Low Voltage and Electrical Alternans",
      "Post-Acute Care: Cardiac Rehab, Digital Health, and Secondary Prevention targets"
    ]
  }
};

export default function App() {
  const [selectedModule, setSelectedModule] = useState(Object.keys(courseData)[0]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [mode, setMode] = useState<'lecture' | 'exercise'>('lecture');
  const [useStyle, setUseStyle] = useState(true);
  const [customFocus, setCustomFocus] = useState('');
  const [copied, setCopied] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Reset selected topics when module changes
  useEffect(() => {
    setSelectedTopics([]);
  }, [selectedModule]);

  const toggleTopic = (topic: string) => {
    setSelectedTopics(prev => 
      prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]
    );
  };

  const selectAllTopics = () => {
    setSelectedTopics(courseData[selectedModule].topics);
  };

  const complexityLevel = useMemo(() => {
    const count = selectedTopics.length;
    if (count === 0) return { label: 'None', color: 'text-slate-400', bg: 'bg-slate-100', icon: Info };
    if (count <= 2) return { label: 'Optimal', color: 'text-green-600', bg: 'bg-green-50', icon: Check };
    if (count <= 4) return { label: 'Moderate', color: 'text-amber-600', bg: 'bg-amber-50', icon: Info };
    return { label: 'High Complexity', color: 'text-red-600', bg: 'bg-red-50', icon: AlertCircle };
  }, [selectedTopics]);

  const generatedPrompt = useMemo(() => {
    if (selectedTopics.length === 0) {
      return "Please select at least one topic to generate a prompt...";
    }

    const modInfo = courseData[selectedModule];
    let prompt = `### ROLE\nYou are an expert Cardiology Educator and ECG Specialist. Your goal is to create a high-fidelity slide deck based on the provided source documents.\n\n`;

    if (useStyle) {
      prompt += `### STYLE GUIDELINES\nRefer strictly to the uploaded "Style Template" document. You must follow the exact formatting, layout, and structural requirements for:\n- The Front Page/Title Slide\n- Section Headers\n- Content Slides\n- Footer/Reference layout\n\n`;
    }

    if (mode === 'lecture') {
      prompt += `### TASK: LECTURE SLIDES\nCreate a detailed slide deck for the following topics within ${selectedModule}:\n${selectedTopics.map(t => `- ${t}`).join('\n')}\n\n`;
      prompt += `### PEDAGOGICAL STRATEGY\n${modInfo.strategy}\n\n`;
      
      const isRhythmModule = !selectedModule.startsWith("Module 1");
      
      if (isRhythmModule) {
        prompt += `### SLIDE REQUIREMENTS\nFor each slide, provide:\n1. Slide Title\n2. Core Bullet Points (concise, high-yield)\n3. ECG Strip Requirement: Include an accurate ECG strip showing the exact ECG rhythm or arrhythmia, corresponding to the diagnosis referring to.\n4. Diagnostic Criteria: Provide detailed diagnostic criteria of that particular rhythm/arrhythmia.\n5. Recognition Summary: A featured statement to summarise, how that particular rhythm/arrhythmia can be recognised or distinguished from others.\n6. Visual Suggestion: Describe any additional diagram or image needed to illustrate the point.\n`;
      } else {
        prompt += `### SLIDE REQUIREMENTS\nFor each slide, provide:\n1. Slide Title\n2. Core Bullet Points (concise, high-yield)\n3. Visual Suggestion: Describe exactly what ECG strip, diagram, or image should be placed on the slide to illustrate the point.\n`;
      }
    } else {
      prompt += `### TASK: EXERCISE GENERATION\nGenerate 10 high-quality clinical exercise questions based on the following topics:\n${selectedTopics.map(t => `- ${t}`).join('\n')}\n\n`;
      prompt += `### EXERCISE FORMAT\nFor each of the 10 questions, use this exact structure:\n1. Case Presentation: (Patient age, gender, chief complaint, vital signs)\n2. ECG Finding: (Describe the specific ECG abnormalities found)\n3. Multiple Choice Question: (A high-yield clinical question with 4 options)\n4. Correct Answer & Rationale: (Explain why the answer is correct and why others are wrong, referencing the source documents)\n`;
    }

    if (customFocus) {
      prompt += `\n### ADDITIONAL FOCUS\n${customFocus}\n`;
    }

    prompt += `\n\n### FINAL INSTRUCTION\nEnsure all information is extracted strictly from the uploaded sources. If information is missing, flag it as [Information not found in source].`;

    return prompt;
  }, [selectedModule, selectedTopics, mode, useStyle, customFocus]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const refineWithAI = async () => {
    if (!customFocus.trim()) return;
    
    setIsRefining(true);
    setAiError(null);
    try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Refine the following user request for an ECG slide deck into a highly effective, AI-readable prompt for NotebookLM. 
        The goal is to make it clear, instructional, and structured so the AI knows exactly what to emphasize or simplify.
        Keep it concise but powerful.
        
        User Request: "${customFocus}"
        
        Refined Prompt:`,
        config: {
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.LOW
          }
        }
      });
      
      const refinedText = response.text;
      if (refinedText) {
        setCustomFocus(refinedText.trim());
      }
    } catch (err) {
      console.error('Gemini refinement failed:', err);
      setAiError(err instanceof Error ? err.message : 'Failed to refine prompt. Check your API key.');
      setTimeout(() => setAiError(null), 5000);
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20 font-sans">
      {/* Header */}
      <header className="bg-slate-900 text-white py-10 px-4 mb-8 shadow-xl">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-3"
          >
            <div className="bg-red-500/20 p-3 rounded-2xl">
              <HeartPulse className="text-red-500 w-8 h-8" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">ECG Course Prompt Architect</h1>
          </motion.div>
          <p className="text-slate-400 text-lg max-w-2xl">
            Generate high-precision prompts for NotebookLM slide decks based on your institutional templates.
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Configuration */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Step 1: Module Selection */}
          <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <label className="block text-xs font-bold text-slate-500 mb-4 uppercase tracking-widest">Step 1: Select Module</label>
            <select 
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-slate-700 font-medium cursor-pointer"
            >
              {Object.keys(courseData).map(mod => (
                <option key={mod} value={mod}>{mod}</option>
              ))}
            </select>
          </section>

          {/* Step 2: Chunking / Sub-topic Selection */}
          <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Step 2: Select Content (Chunking)</label>
              <button 
                onClick={selectAllTopics}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Select All
              </button>
            </div>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
              {courseData[selectedModule].topics.map((topic, index) => (
                <label 
                  key={index}
                  className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                    selectedTopics.includes(topic) 
                      ? 'bg-blue-50 border-blue-200 text-blue-900' 
                      : 'hover:bg-slate-50 border-transparent text-slate-600'
                  }`}
                >
                  <input 
                    type="checkbox" 
                    checked={selectedTopics.includes(topic)}
                    onChange={() => toggleTopic(topic)}
                    className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium leading-tight">{topic}</span>
                </label>
              ))}
            </div>
            <div className={`flex items-center justify-between mt-4 p-3 rounded-xl border ${complexityLevel.bg.replace('bg-', 'border-').replace('50', '200')} ${complexityLevel.bg}`}>
              <div className="flex items-center gap-2">
                <complexityLevel.icon className={`w-4 h-4 ${complexityLevel.color}`} />
                <span className={`text-xs font-bold uppercase tracking-wider ${complexityLevel.color}`}>
                  Complexity: {complexityLevel.label}
                </span>
              </div>
              <span className={`text-xs font-medium ${complexityLevel.color}`}>
                {selectedTopics.length} / 3 recommended
              </span>
            </div>

            {selectedTopics.length > 3 && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3 p-3 bg-red-50 border border-red-100 rounded-xl flex gap-3"
              >
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-red-800">NotebookLM Warning</p>
                  <p className="text-[10px] text-red-700 leading-tight">
                    Selecting more than 3 topics often causes NotebookLM to truncate content or hit its internal slide generation limit (~20 slides). Consider splitting this into two separate prompts.
                  </p>
                </div>
              </motion.div>
            )}
          </section>

          {/* NotebookLM Best Practices */}
          <section className="bg-slate-900 p-6 rounded-3xl shadow-lg border border-slate-800 text-white">
            <div className="flex items-center gap-2 mb-4">
              <Info className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-blue-400">NotebookLM Best Practices</h3>
            </div>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  <strong className="text-white">Upload Sources First:</strong> Ensure all relevant ECG textbooks or institutional PDFs are uploaded to the NotebookLM source panel before pasting this prompt.
                </p>
              </li>
              <li className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  <strong className="text-white">Slide Limit:</strong> NotebookLM typically generates 15-25 slides. If your topic is broad, it will skip details to stay within this limit.
                </p>
              </li>
              <li className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  <strong className="text-white">Context Window:</strong> If you get "Information not found" errors, check if your source PDFs are text-searchable (OCR).
                </p>
              </li>
            </ul>
          </section>

          {/* Step 3: Generation Mode */}
          <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <label className="block text-xs font-bold text-slate-500 mb-4 uppercase tracking-widest">Step 3: Generation Mode</label>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setMode('lecture')}
                className={`py-4 px-4 rounded-2xl border-2 transition-all flex items-center justify-center gap-2 font-semibold ${
                  mode === 'lecture' 
                    ? 'border-blue-600 bg-blue-50 text-blue-700' 
                    : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'
                }`}
              >
                <Presentation className="w-5 h-5" /> Lecture
              </button>
              <button 
                onClick={() => setMode('exercise')}
                className={`py-4 px-4 rounded-2xl border-2 transition-all flex items-center justify-center gap-2 font-semibold ${
                  mode === 'exercise' 
                    ? 'border-blue-600 bg-blue-50 text-blue-700' 
                    : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'
                }`}
              >
                <PenTool className="w-5 h-5" /> Exercises
              </button>
            </div>
          </section>

          {/* Step 4: Style & Customization */}
          <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Step 4: Final Adjustments</label>
              <button
                onClick={refineWithAI}
                disabled={isRefining || !customFocus.trim()}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isRefining ? 'bg-slate-100 text-slate-400' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                }`}
              >
                {isRefining ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Sparkles className="w-3 h-3" />
                )}
                {isRefining ? 'Refining...' : 'Refine with AI'}
              </button>
            </div>
            
            <AnimatePresence>
              {aiError && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-600 text-[10px] font-medium"
                >
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {aiError}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center gap-3 mb-4 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
              <input 
                type="checkbox" 
                id="styleTemplate" 
                checked={useStyle}
                onChange={(e) => setUseStyle(e.target.checked)}
                className="w-5 h-5 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
              />
              <label htmlFor="styleTemplate" className="text-xs text-amber-900 leading-snug font-medium">
                <strong>Use Institutional Style Template:</strong> I have uploaded the template file to NotebookLM.
              </label>
            </div>
            <textarea 
              value={customFocus}
              onChange={(e) => setCustomFocus(e.target.value)}
              placeholder="Add specific focus (e.g., 'Emphasize the difference between Mobitz I and II' or 'Keep it simple for beginners')..." 
              className="w-full p-4 text-sm rounded-2xl border border-slate-200 bg-slate-50 h-32 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-slate-700 placeholder:text-slate-400"
            />
          </section>
        </div>

        {/* Right Column: Output */}
        <div className="lg:col-span-7">
          <div className="sticky top-8 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                Generated Prompt
                {selectedTopics.length > 0 && (
                  <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                    {selectedTopics.length} topics
                  </span>
                )}
              </h2>
              <button 
                onClick={copyToClipboard}
                disabled={selectedTopics.length === 0}
                className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                  copied ? 'bg-green-500 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy to Clipboard'}
              </button>
            </div>
            
            <div className="relative group">
              {selectedTopics.length > 3 && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 bg-red-600 text-white px-4 py-1.5 rounded-full text-[10px] font-bold shadow-xl flex items-center gap-2 animate-bounce">
                  <AlertCircle className="w-3 h-3" />
                  HIGH COMPLEXITY: MAY EXCEED NOTEBOOKLM LIMITS
                </div>
              )}
              <AnimatePresence mode="wait">
                <motion.div 
                  key={generatedPrompt}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white border border-slate-200 p-8 rounded-[2rem] shadow-inner min-h-[600px] text-slate-700 text-sm leading-relaxed whitespace-pre-wrap font-mono overflow-hidden"
                >
                  {selectedTopics.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4 mt-20">
                      <AlertCircle className="w-12 h-12 opacity-20" />
                      <p className="text-lg font-medium">Select topics to generate your prompt</p>
                    </div>
                  ) : (
                    generatedPrompt
                  )}
                </motion.div>
              </AnimatePresence>
              
              {/* Decorative background elements */}
              <div className="absolute -z-10 -top-4 -right-4 w-24 h-24 bg-blue-100 rounded-full blur-3xl opacity-50" />
              <div className="absolute -z-10 -bottom-4 -left-4 w-32 h-32 bg-red-100 rounded-full blur-3xl opacity-50" />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 mt-12 text-center text-slate-400 text-sm">
        <p>© {new Date().getFullYear()} ECG Course Prompt Architect • Designed for Medical Educators</p>
      </footer>
    </div>
  );
}
