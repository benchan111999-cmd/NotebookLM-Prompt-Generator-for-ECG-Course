import { useState, useRef } from 'react';
import { Upload, CheckCircle, AlertTriangleIcon } from 'lucide-react';

interface FileUploaderProps {
  onFileProcessed: (extractedText: string, fileType: 'pdf' | 'md') => void;
  onError: (message: string) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFileProcessed, onError }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
