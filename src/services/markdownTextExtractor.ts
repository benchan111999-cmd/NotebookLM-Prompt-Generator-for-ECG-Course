// Markdown/Text Text Extraction Service

// Extract text from Markdown/plain text files
export const extractMarkdownText = (arrayBuffer: ArrayBuffer): string => {
  const decoder = new TextDecoder('utf-8');
  return decoder.decode(arrayBuffer);
};

// For consistency with PDF service interface
export const extractText = extractMarkdownText;