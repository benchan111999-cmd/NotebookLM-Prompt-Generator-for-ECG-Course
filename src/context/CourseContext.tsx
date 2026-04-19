import { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { ModuleConfig, courseData as defaultCourseData } from '../data/courseData';
import { ParsedOutline } from '../shared/courseOutlineParser';

type CourseContextType = {
  courseData: Record<string, ModuleConfig>;
  isUsingParsedData: boolean;
  setParsedData: (outline: ParsedOutline) => void;
  resetToDefault: () => void;
};

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export const CourseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Default course data from courseData.ts
  const [parsedData, setParsedData] = useState<Record<string, ModuleConfig> | null>(null);
  const [isUsingParsedData, setIsUsingParsedData] = useState(false);

  const courseData = useMemo(() => {
    // If we have parsed data and are using it, return parsed data
    // Otherwise, fall back to hardcoded data
    return parsedData && isUsingParsedData ? parsedData : defaultCourseData;
  }, [parsedData, isUsingParsedData]);

  const setParsedOutline = (outline: ParsedOutline) => {
    // Convert parsed outline to ModuleConfig format
    // This is a simplified conversion - in reality, we'd need to map to the full ModuleConfig
    // including strategy, lectureProfile, etc.
    // For now, we'll just create a basic structure and log a warning about missing fields.
    const newCourseData: Record<string, ModuleConfig> = {};
    
    outline.modules.forEach(module => {
      // We need to map the parsed module title to the exact key in courseData
      // For simplicity, we'll assume the module title matches the key in courseData
      // In a real implementation, we'd have a mapping or use fuzzy matching
      newCourseData[module.title] = {
        // Default values - these should be inferred or provided by the user
        strategy: 'The Explainer: Focus on physiological mechanisms, ion flux, and conceptual flow. Request descriptions for diagrams.',
        topics: module.topics.map(t => t.title),
        lectureProfile: 'foundation', // Default, should be determined from content or user input
        // exerciseCount is optional
      };
    });

    setParsedData(newCourseData);
    setIsUsingParsedData(true);
  };

  const resetToDefault = () => {
    setParsedData(null);
    setIsUsingParsedData(false);
  };

  return (
    <CourseContext.Provider value={{
      courseData,
      isUsingParsedData,
      setParsedData: setParsedOutline,
      resetToDefault,
    }}>
      {children}
    </CourseContext.Provider>
  );
};

export const useCourse = () => {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error('useCourse must be used within a CourseProvider');
  }
  return context;
};