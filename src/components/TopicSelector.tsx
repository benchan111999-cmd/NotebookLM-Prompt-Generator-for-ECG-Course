import { AlertCircle, Check, type LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';

type ComplexityLevel = {
  label: string;
  color: string;
  bg: string;
  icon: LucideIcon;
};

type TopicSelectorProps = {
  topics: string[];
  selectedTopics: string[];
  onToggleTopic: (topic: string) => void;
  onSelectAll: () => void;
  complexityLevel: ComplexityLevel;
};

export function TopicSelector({
  topics,
  selectedTopics,
  onToggleTopic,
  onSelectAll,
  complexityLevel,
}: TopicSelectorProps) {
  return (
    <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
      <div className="flex justify-between items-center mb-4">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Step 2: Select Content (Chunking)</label>
        <button onClick={onSelectAll} className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
          Select All
        </button>
      </div>
      <div className="space-y-2 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
        {topics.map((topic, index) => (
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
              onChange={() => onToggleTopic(topic)}
              className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium leading-tight">{topic}</span>
          </label>
        ))}
      </div>
      <div
        className={`flex items-center justify-between mt-4 p-3 rounded-xl border ${complexityLevel.bg
          .replace('bg-', 'border-')
          .replace('50', '200')} ${complexityLevel.bg}`}
      >
        <div className="flex items-center gap-2">
          <complexityLevel.icon className={`w-4 h-4 ${complexityLevel.color}`} />
          <span className={`text-xs font-bold uppercase tracking-wider ${complexityLevel.color}`}>
            Complexity: {complexityLevel.label}
          </span>
        </div>
        <span className={`text-xs font-medium ${complexityLevel.color}`}>{selectedTopics.length} / 3 recommended</span>
      </div>

      {selectedTopics.length > 3 && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 p-3 bg-red-50 border border-red-100 rounded-xl flex gap-3">
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
  );
}
