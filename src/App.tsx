import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Check, HeartPulse, Info } from 'lucide-react';
import { motion } from 'motion/react';
import { FocusEditor } from './components/FocusEditor';
import { ModeSelector } from './components/ModeSelector';
import { PromptOutput } from './components/PromptOutput';
import { TopicSelector } from './components/TopicSelector';
import { FileUploader } from './components/FileUploader';
import { ParsedOutline } from './shared/courseOutlineParser';
import { CourseProvider, useCourse } from './context/CourseContext';
import { courseData, type GenerationMode } from './data/courseData';
import { buildPrompt } from './features/prompt/buildPrompt';
import { MAX_CUSTOM_FOCUS_LENGTH, sanitizeCustomFocus } from '@/shared/sanitize';
import { parseCourseOutline } from './shared/courseOutlineParser';
import { ParsedDataReviewer } from './components/ParsedDataReviewer';

export default function App() {
  const { courseData: currentCourseData, isUsingParsedData, setParsedData, resetToDefault } = useCourse();
  const [selectedModule, setSelectedModule] = useState(Object.keys(currentCourseData)[0]);
  const [selectedTopics, setSelectedTopics] = useState([] as string[]);
  const [mode, setMode] = useState('lecture' as GenerationMode);
  const [useStyle, setUseStyle] = useState(true);
  const [customFocus, setCustomFocus] = useState('');
  const [copied, setCopied] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [aiError, setAiError] = useState(null as string | null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [parsingError, setParsingError] = useState<string | null>(null);
  const [isReviewingParsedData, setIsReviewingParsedData] = useState(false);
  const [parsedOutlineForReview, setParsedOutlineForReview] = useState<ParsedOutline | null>(null);

  useEffect(() => {
    setSelectedTopics([]);
  }, [selectedModule]);

  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev: string[]) =>
      prev.includes(topic) ? prev.filter((t: string) => t !== topic) : [...prev, topic],
    );
  };

  const selectAllTopics = () => {
    setSelectedTopics(currentCourseData[selectedModule].topics);
  };

  const handleFileProcessed = (extractedText: string, fileType: 'pdf' | 'md') => {
    setIsProcessingFile(false);
    setFileError(null);
    setParsingError(null);
    
    try {
      // Parse the extracted text using our course outline parser
      const parsedOutline: ParsedOutline = parseCourseOutline(extractedText);
      
      // Validate that we got some meaningful data
      if (parsedOutline.modules.length === 0) {
        throw new Error('無法從檔案中偵測到任何課程模組，請檢查檔案內容是否包含明確的模組標題');
      }
      
      // Set the parsed outline for review
      setParsedOutlineForReview(parsedOutline);
      setIsReviewingParsedData(true);
    } catch (err) {
      setParsingError(err instanceof Error ? err.message : '解析過程中發生錯誤，請重試');
      console.error('Parsing failed:', err);
    }
  };

  const handleFileError = (message: string) => {
    setIsProcessingFile(false);
    setFileError(message);
    setParsingError(null);
  };

  const handleReviewConfirm = (outline: ParsedOutline) => {
    setParsedData(outline);
    setIsReviewingParsedData(false);
    setParsedOutlineForReview(null);
  };

  const handleReviewCancel = () => {
    setIsReviewingParsedData(false);
    setParsedOutlineForReview(null);
  };

  const complexityLevel = useMemo(() => {
    const count = selectedTopics.length;
    if (count === 0) return { label: 'None', color: 'text-slate-400', bg: 'bg-slate-100', icon: Info };
    if (count <= 2) return { label: 'Optimal', color: 'text-green-600', bg: 'bg-green-50', icon: Check };
    if (count <= 4) return { label: 'Moderate', color: 'text-amber-600', bg: 'bg-amber-50', icon: Info };
    return { label: 'High Complexity', color: 'text-red-600', bg: 'bg-red-50', icon: AlertCircle };
  }, [selectedTopics]);

  const generatedPrompt = useMemo(
    () =>
      buildPrompt({
        selectedModule,
        selectedTopics,
        mode,
        useStyle,
        customFocus,
      }),
    [selectedModule, selectedTopics, mode, useStyle, customFocus],
  );

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
    const cleanedFocus = sanitizeCustomFocus(customFocus);
    if (!cleanedFocus) return;

    setIsRefining(true);
    setAiError(null);
    try {
      const response = await fetch('/api/refine-focus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customFocus: cleanedFocus }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? 'Failed to refine prompt. Please check your server configuration.');
      }

      const data = (await response.json()) as { refinedText: string };
      if (data.refinedText) {
        setCustomFocus(sanitizeCustomFocus(data.refinedText));
      }
    } catch (err) {
      console.error('AI refinement failed:', err);
      setAiError(err instanceof Error ? err.message : 'Failed to refine prompt.');
      setTimeout(() => setAiError(null), 5000);
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20 font-sans">
      <header className="bg-slate-900 text-white py-10 px-4 mb-8 shadow-xl">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 mb-3">
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
        <div className="lg:col-span-5 space-y-6">
          <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <label className="block text-xs font-bold text-slate-500 mb-4 uppercase tracking-widest">
              Step 1: Select Module
            </label>
            <select
              value={selectedModule}
              onChange={(e: { target: { value: string } }) => setSelectedModule(e.target.value)}
              className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-slate-700 font-medium cursor-pointer"
            >
              {Object.keys(currentCourseData).map((mod) => (
                <option key={mod} value={mod}>
                  {mod}
                </option>
              ))}
            </select>
          </section>

          {/* File Upload Section */}
          <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <label className="block text-xs font-bold text-slate-500 mb-4 uppercase tracking-widest">
              Or Upload Course Outline
            </label>
            <FileUploader
              onFileProcessed={handleFileProcessed}
              onError={handleFileError}
            />
            {isProcessingFile && (
              <div className="mt-3 flex items-center gap-2 text-sm text-blue-600">
                <div className="h-3 w-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span>Processing file...</span>
              </div>
            )}
            {fileError && (
              <div className="mt-3 flex items-center gap-2 text-sm text-red-600">
                <AlertTriangle className="h-3 w-3" />
                <span>{fileError}</span>
              </div>
            )}
            {parsingError && (
              <div className="mt-3 flex items-center gap-2 text-sm text-red-600">
                <AlertTriangle className="h-3 w-3" />
                <span>{parsingError}</span>
              </div>
            )}
            {isReviewingParsedData && (
              <ParsedDataReviewer
                outline={parsedOutlineForReview!}
                onConfirm={handleReviewConfirm}
                onCancel={handleReviewCancel}
              />
            )}
            {isUsingParsedData && !isReviewingParsedData && (
              <div className="mt-4 flex items-center gap-2 text-sm text-green-600">
                <Check className="h-3 w-3" />
                <span>
                  Using parsed course data from uploaded file.{' '}
                  <button
                    onClick={resetToDefault}
                    className="ml-2 text-xs font-semibold text-blue-600 hover:text-blue-700 underline"
                  >
                    Reset to Default
                  </button>
                </span>
              </div>
            )}
          </section>

          <TopicSelector
            topics={currentCourseData[selectedModule].topics}
            selectedTopics={selectedTopics}
            onToggleTopic={toggleTopic}
            onSelectAll={selectAllTopics}
            complexityLevel={complexityLevel}
          />

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

          <ModeSelector mode={mode} onChangeMode={setMode} />

          <FocusEditor
            customFocus={customFocus}
            maxLength={MAX_CUSTOM_FOCUS_LENGTH}
            useStyle={useStyle}
            aiError={aiError}
            isRefining={isRefining}
            onRefineWithAI={refineWithAI}
            onChangeCustomFocus={(value) => setCustomFocus(sanitizeCustomFocus(value))}
            onChangeUseStyle={setUseStyle}
          />
        </div>

        <PromptOutput
          generatedPrompt={generatedPrompt}
          selectedTopicCount={selectedTopics.length}
          copied={copied}
          onCopy={copyToClipboard}
        />
      </main>

      <footer className="max-w-6xl mx-auto px-4 mt-12 text-center text-slate-400 text-sm">
        <p>© {new Date().getFullYear()} ECG Course Prompt Architect • Designed for Medical Educators</p>
      </footer>
    </div>
  );
}