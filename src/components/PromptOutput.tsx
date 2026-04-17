import { AlertCircle, Check, Copy } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

type PromptOutputProps = {
  generatedPrompt: string;
  selectedTopicCount: number;
  copied: boolean;
  onCopy: () => void;
};

export function PromptOutput({ generatedPrompt, selectedTopicCount, copied, onCopy }: PromptOutputProps) {
  return (
    <div className="lg:col-span-7">
      <div className="sticky top-8 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            Generated Prompt
            {selectedTopicCount > 0 && (
              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">{selectedTopicCount} topics</span>
            )}
          </h2>
          <button
            onClick={onCopy}
            disabled={selectedTopicCount === 0}
            className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
              copied ? 'bg-green-500 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </button>
        </div>

        <div className="relative group">
          {selectedTopicCount > 3 && (
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
              {selectedTopicCount === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4 mt-20">
                  <AlertCircle className="w-12 h-12 opacity-20" />
                  <p className="text-lg font-medium">Select topics to generate your prompt</p>
                </div>
              ) : (
                generatedPrompt
              )}
            </motion.div>
          </AnimatePresence>

          <div className="absolute -z-10 -top-4 -right-4 w-24 h-24 bg-blue-100 rounded-full blur-3xl opacity-50" />
          <div className="absolute -z-10 -bottom-4 -left-4 w-32 h-32 bg-red-100 rounded-full blur-3xl opacity-50" />
        </div>
      </div>
    </div>
  );
}
