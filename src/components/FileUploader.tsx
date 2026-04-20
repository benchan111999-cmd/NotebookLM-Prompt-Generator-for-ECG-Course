import { useState } from 'react';
import { Upload, CheckCircle, AlertTriangle } from 'lucide-react';

interface FileUploaderProps {
  onFileProcessed: (extractedText: string, fileType: 'pdf' | 'md') => void;
  onError: (message: string) => void;
}

export function FileUploader({ onFileProcessed, onError }: FileUploaderProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['application/pdf', 'text/markdown', 'text/plain'];
    if (!validTypes.includes(file.type)) {
      onError('請上傳 PDF 或 Markdown 檔案');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      onError('檔案大小不能超過 25MB');
      return;
    }

    setIsProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const text = await extractText(arrayBuffer, file.type, file.name);
      onFileProcessed(text, file.type === 'application/pdf' ? 'pdf' : 'md');
    } catch (err) {
      onError('檔案處理失敗，請重試');
      console.error(err);
    } finally {
      setIsProcessing(false);
      e.target.value = '';
    }
  };

  const extractText = async (
    arrayBuffer: ArrayBuffer,
    mimeType: string,
    fileName: string
  ): Promise<string> => {
    if (mimeType === 'application/pdf') {
      return `PDF 檔案內容：${fileName}\n（此處將實作 PDF 文字擷取）`;
    } else {
      const decoder = new TextDecoder('utf-8');
      return decoder.decode(arrayBuffer);
    }
  };

  return (
    <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
      <label className="block text-xs font-bold text-slate-500 mb-4 uppercase tracking-widest">
        上傳課程大綱 (PDF 或 Markdown)
      </label>
      <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-slate-400 transition-colors">
        <input
          type="file"
          accept=".pdf,.md,.txt"
          className="hidden"
          onChange={handleFileChange}
        />
        <div className="flex flex-col items-center gap-4">
          {!isProcessing ? (
            <>
              <Upload className="h-8 w-8 text-slate-400" />
              <p className="text-sm text-slate-600">
                點擊上傳或拖放檔案至此處
              </p>
              <p className="text-xs text-slate-400">
                支援 PDF 和 Markdown 格式，最大 25MB
              </p>
            </>
          ) : (
            <>
              <CheckCircle className="h-6 w-6 text-green-500 animate-pulse" />
              <p className="text-sm text-green-600">正在處理檔案...</p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}