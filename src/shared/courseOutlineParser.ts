/**
 * Course Outline Parser
 * Extracts module and topic structure from plain text (PDF or Markdown)
 * Returns structured data compatible with ModuleConfig format
 */

export type ParsedModule = {
  title: string;
  confidence: number; // 0-1, confidence in this module detection
  topics: Array<{
    title: string;
    confidence: number; // 0-1, confidence in this topic detection
  }>;
};

export type ParsedOutline = {
  modules: ParsedModule[];
  overallConfidence: number; // Average confidence across all modules
};

// Common patterns for module headers in ECG course outlines
const MODULE_PATTERNS = [
  // English: "Module 1: Foundations of Cardiac Electrophysiology"
  /^module\s+(\d+)[\s\-_:]*(.+)$/i,
  // English: "Chapter 1: Introduction"
  /^chapter\s+(\d+)[\s\-_:]*(.+)$/i,
  // English: "Section 1: Overview"
  /^section\s+(\d+)[\s\-_:]*(.+)$/i,
  // Chinese: "第一模組：心臟電生理學基礎"
  /^第([一二三四五六七八九十\d]+)[\s\-_:]*模組[\s\-_:]*(.+)$/,
  // Chinese: "第一章：介紹"
  /^第([一二三四五六七八九十\d]+)[\s\-_:]*章[\s\-_:]*(.+)$/,
  // Numeric with dot: "1. Foundations of Cardiac Electrophysiology"
  /^(\d+)\.[\s\-_:]*(.+)$/,
  // Numeric with parentheses: "1) Foundations"
  /^(\d+)\)[\s\-_:]*(.+)$/,
];

// Common patterns for topic items (indented or listed)
const TOPIC_PATTERNS = [
  // Markdown list: "- Topic name" or "* Topic name"
  /^[\s\t]*[-\*\+]\s+(.+)$/,
  // Numbered list: "1. Topic name" or "1) Topic name"
  /^[\s\t]*(\d+)[\.)]\s+(.+)$/,
  // Indented with spaces (4+ spaces)
  /^[\s\t]{4,}(.+)$/,
  // Chinese numbering: "一、 Topic name" or "(一) Topic name"
  /^[\s\t]*([一二三四五六七八九十]+)[\、\.\)]\s+(.+)$/,
];

// Convert Chinese numerals to numbers (simple version for common cases)
const chineseToNum: Record<string, number> = {
  一: 1, 二: 2, 三: 3, 四: 4, 五: 5,
  六: 6, 七: 7, 八: 8, 九: 9, 十: 10,
};

/**
 * Parses raw text to extract module and topic structure
 * @param rawText Extracted text from PDF or Markdown
 * @returns Parsed outline with modules, topics, and confidence scores
 */
export const parseCourseOutline = (rawText: string): ParsedOutline => {
  if (!rawText || rawText.trim() === '') {
    return { modules: [], overallConfidence: 0 };
  }

  const lines = rawText.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
  const modules: ParsedModule[] = [];
  let currentModule: ParsedModule | null = null;
  let currentModuleLines: string[] = [];

  // First pass: identify module headers and group lines
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let moduleMatch: RegExpMatchArray | null = null;
    let matchedPattern = '';

    // Try each module pattern
    for (const pattern of MODULE_PATTERNS) {
      const match = line.match(pattern);
      if (match) {
        moduleMatch = match;
        matchedPattern = pattern.toString();
        break;
      }
    }

    if (moduleMatch) {
      // Save previous module if exists
      if (currentModule) {
const parsedModule = processModuleLines(currentModule.title, currentModuleLines, currentModule.confidence);
        modules.push(parsedModule);
      }

      // Start new module
      const moduleNumber = moduleMatch[1];
      const moduleTitle = moduleMatch[2]?.trim() || `Module ${moduleNumber}`;
      currentModule = {
        title: moduleTitle,
        confidence: calculateModuleConfidence(line, matchedPattern),
        topics: [],
      };
      currentModuleLines = [];
    } else if (currentModule !== null) {
      // Add line to current module's content
      currentModuleLines.push(line);
    }
    // If no module header and no current module, skip (content before first module)
  }

  // Process last module
  if (currentModule) {
    const parsedModule = processModuleLines(currentModule.title, currentModuleLines);
    modules.push(parsedModule);
  }

  // Calculate overall confidence
  const overallConfidence =
    modules.length > 0
      ? modules.reduce((sum, m) => sum + m.confidence, 0) / modules.length
      : 0;

  return { modules, overallConfidence };
};

/**
 * Process lines belonging to a module to extract topics
 */
const processModuleLines = (
  moduleTitle: string,
  lines: string[],
  headerConfidence: number = 0.5
): ParsedModule => {
  const topics: Array<{ title: string; confidence: number }> = [];
  let currentTopic: { title: string; confidence: number } | null = null;
  let currentTopicLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let topicMatch: RegExpMatchArray | null = null;

    // Try each topic pattern
    for (const pattern of TOPIC_PATTERNS) {
      const match = line.match(pattern);
      if (match) {
        topicMatch = match;
        break;
      }
    }

    if (topicMatch) {
      // Save previous topic if exists
      if (currentTopic) {
        const finalTopic = {
          title: currentTopicLines.join(' ').trim(),
          confidence: currentTopic.confidence,
        };
        topics.push(finalTopic);
      }

      // Extract topic title from match (usually the last capture group)
      const topicTitle =
        topicMatch[topicMatch.length - 1]?.trim() ||
        topicMatch[topicMatch.length - 2]?.trim() ||
        '';

      currentTopic = {
        title: topicTitle,
        confidence: calculateTopicConfidence(line, topicMatch[0]),
      };
      currentTopicLines = [topicTitle]; // Start with the matched part
    } else if (currentTopic !== null) {
      // Add line to current topic's content
      currentTopicLines.push(line);
    }
    // If no topic pattern and no current topic, treat as potential topic header
    else if (line.length > 0 && line.length < 100) {
      // Could be a topic header without special formatting
      currentTopic = {
        title: line,
        confidence: 0.3, // Low confidence for unmarked topics
      };
      currentTopicLines = [line];
    }
  }

  // Don't forget the last topic
  if (currentTopic) {
    const finalTopic = {
      title: currentTopicLines.join(' ').trim(),
      confidence: currentTopic.confidence,
    };
    topics.push(finalTopic);
  }

  // If no topics found, create a default topic from the module content
  if (topics.length === 0 && lines.length > 0) {
    // Use first non-empty line as topic, or split by common delimiters
    const firstLine = lines.find(l => l.trim().length > 0) || '';
    if (firstLine) {
      // Try to split by common delimiters to get multiple topics
      const potentialTopics = firstLine
        .split(/[;\n\r]/)
        .map(t => t.trim())
        .filter(t => t.length > 0);

      if (potentialTopics.length > 0) {
        topics.push(
          ...potentialTopics.map(t => ({
            title: t,
            confidence: 0.2, // Very low confidence for split topics
          }))
        );
      } else {
        topics.push({ title: firstLine, confidence: 0.2 });
      }
    }
  }

  // Calculate module confidence based on topic extraction success
  const topicConfidence =
    topics.length > 0
      ? topics.reduce((sum, t) => sum + t.confidence, 0) / topics.length
      : 0.1;

// Combine module header confidence with topic extraction confidence
const moduleConfidence = headerConfidence;

  return {
    title: moduleTitle,
    confidence: (moduleConfidence + topicConfidence) / 2,
    topics,
  };
};

/**
 * Calculate confidence for module header detection
 */
const calculateModuleConfidence = (line: string, pattern: string): number => {
  // Base confidence
  let confidence = 0.7;

  // Increase confidence for stronger indicators
  if (/module\s+\d+/i.test(line)) confidence += 0.15;
  if (/chapter\s+\d+/i.test(line)) confidence += 0.15;
  if (/第[\d一二三四五六七八九十]+模組/.test(line)) confidence += 0.2;
  if (/^[\d]+\)/.test(line)) confidence += 0.1;

  // Decrease confidence for unlikely patterns
  if (line.length > 100) confidence -= 0.2; // Too long to be a header
  if (line.includes(':')) confidence += 0.05; // Colon is good separator

  return Math.min(0.95, Math.max(0.1, confidence));
};

/**
 * Calculate confidence for topic detection
 */
const calculateTopicConfidence = (line: string, matchedPattern: string): number => {
  // Base confidence
  let confidence = 0.6;

  // Increase confidence for clear list markers
  if (/^[-\*\+]\s/.test(line)) confidence += 0.2; // Markdown list
  if (/^\d+\.\s/.test(line)) confidence += 0.2; // Numbered list
  if (/^\d+\)\s/.test(line)) confidence += 0.15; // Numbered with parenthesis
  if (/^[\s\t]{4,}/.test(line)) confidence += 0.1; // Indented

  // Decrease confidence for unlikely topic lines
  if (line.length > 200) confidence -= 0.3; // Too long
  if (line.length < 5) confidence -= 0.4; // Too short
  if (line.match(/[#{}]/)) confidence -= 0.2; // Contains markup chars

  return Math.min(0.9, Math.max(0.1, confidence));
};

/**
 * Convert Chinese numeral string to number (supports 1-99)
 */
export const chineseNumeralToNumber = (str: string): number | null => {
  if (/^\d+$/.test(str)) return parseInt(str, 10);

  // Handle simple cases: 一, 二, 三, ..., 十, 十一, 十二, etc.
  const units: Record<string, number> = {
    一: 1,
    二: 2,
    三: 3,
    四: 4,
    五: 5,
    六: 6,
    七: 7,
    八: 8,
    九: 9,
  };
  const tens: Record<string, number> = {
    十: 10,
    二十: 20,
    三十: 30,
    四十: 40,
    五十: 50,
    六十: 60,
    七十: 70,
    八十: 80,
    九十: 90,
  };

  if (str.length === 1 && units[str]) return units[str];
  if (str.length === 2) {
    const first = str[0];
    const second = str[1];
    if (tens[first] && units[second]) return tens[first] + units[second];
    if (first === '十' && units[second]) return 10 + units[second];
  }
  if (str === '十') return 10;

  return null; // Not implemented for complex cases
};