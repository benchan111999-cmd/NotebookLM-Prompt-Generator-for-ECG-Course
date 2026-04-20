import { createContext, useContext, useState, useMemo, type ReactNode } from 'react';
import { ModuleConfig, courseData as defaultCourseData } from '../data/courseData';
import { ParsedOutline } from '../shared/courseOutlineParser';

type CourseContextType = {
  courseData: Record<string, ModuleConfig>;
  isUsingParsedData: boolean;
  setParsedData: (outline: ParsedOutline) => void;
  resetToDefault: () => void;
};

const CourseContext = createContext<CourseContextType | undefined>(undefined);

interface CourseProviderProps {
  children: any;
}

export function CourseProvider({ children }: CourseProviderProps) {
  const [parsedData, setParsedDataState] = useState<Record<string, ModuleConfig> | null>(null);
  const [isUsingParsedData, setIsUsingParsedData] = useState(false);

  const courseData = useMemo(() => {
    return parsedData && isUsingParsedData ? parsedData : defaultCourseData;
  }, [parsedData, isUsingParsedData]);

  const setParsedOutline = (outline: ParsedOutline) => {
    const newCourseData: Record<string, ModuleConfig> = {};

    outline.modules.forEach(module => {
      newCourseData[module.title] = {
        strategy: 'The Explainer: Focus on physiological mechanisms, ion flux, and conceptual flow. Request descriptions for diagrams.',
        topics: module.topics.map(t => t.title),
        lectureProfile: 'foundation',
      };
    });

    setParsedDataState(newCourseData);
    setIsUsingParsedData(true);
  };

  const resetToDefault = () => {
    setParsedDataState(null);
    setIsUsingParsedData(false);
  };

  return (
    <CourseContext.Provider
      value={{
        courseData,
        isUsingParsedData,
        setParsedData: setParsedOutline,
        resetToDefault,
      }}
    >
      {children}
    </CourseContext.Provider>
  );
}

export const useCourse = () => {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error('useCourse must be used within a CourseProvider');
  }
  return context;
};