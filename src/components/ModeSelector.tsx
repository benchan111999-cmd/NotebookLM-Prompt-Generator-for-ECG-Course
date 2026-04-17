import { PenTool, Presentation } from 'lucide-react';
import type { GenerationMode } from '../data/courseData';

type ModeSelectorProps = {
  mode: GenerationMode;
  onChangeMode: (mode: GenerationMode) => void;
};

export function ModeSelector({ mode, onChangeMode }: ModeSelectorProps) {
  return (
    <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
      <label className="block text-xs font-bold text-slate-500 mb-4 uppercase tracking-widest">Step 3: Generation Mode</label>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onChangeMode('lecture')}
          className={`py-4 px-4 rounded-2xl border-2 transition-all flex items-center justify-center gap-2 font-semibold ${
            mode === 'lecture'
              ? 'border-blue-600 bg-blue-50 text-blue-700'
              : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'
          }`}
        >
          <Presentation className="w-5 h-5" /> Lecture
        </button>
        <button
          onClick={() => onChangeMode('exercise')}
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
  );
}
