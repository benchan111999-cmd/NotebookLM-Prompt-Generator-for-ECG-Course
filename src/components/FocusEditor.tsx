import { AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

type FocusEditorProps = {
  customFocus: string;
  maxLength: number;
  useStyle: boolean;
  aiError: string | null;
  isRefining: boolean;
  onRefineWithAI: () => void;
  onChangeCustomFocus: (value: string) => void;
  onChangeUseStyle: (value: boolean) => void;
};

export function FocusEditor({
  customFocus,
  maxLength,
  useStyle,
  aiError,
  isRefining,
  onRefineWithAI,
  onChangeCustomFocus,
  onChangeUseStyle,
}: FocusEditorProps) {
  return (
    <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
      <div className="flex justify-between items-center mb-4">
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Step 4: Final Adjustments</label>
        <button
          onClick={onRefineWithAI}
          disabled={isRefining || !customFocus.trim()}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
            isRefining ? 'bg-slate-100 text-slate-400' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
          }`}
        >
          {isRefining ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
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
          onChange={(e: { target: { checked: boolean } }) => onChangeUseStyle(e.target.checked)}
          className="w-5 h-5 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
        />
        <label htmlFor="styleTemplate" className="text-xs text-amber-900 leading-snug font-medium">
          <strong>Use Institutional Style Template:</strong> I have uploaded the template file to NotebookLM.
        </label>
      </div>
      <textarea
        value={customFocus}
        onChange={(e: { target: { value: string } }) => onChangeCustomFocus(e.target.value)}
        placeholder="Add specific focus (e.g., 'Emphasize the difference between Mobitz I and II' or 'Keep it simple for beginners')..."
        maxLength={maxLength}
        className="w-full p-4 text-sm rounded-2xl border border-slate-200 bg-slate-50 h-32 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-slate-700 placeholder:text-slate-400"
      />
      <p className="mt-2 text-[10px] text-slate-500 text-right">
        {customFocus.length} / {maxLength} characters
      </p>
    </section>
  );
}
