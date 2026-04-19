import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {ErrorBoundary} from './components/ErrorBoundary.tsx';
import {CourseProvider} from './context/CourseContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CourseProvider>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </CourseProvider>
  </StrictMode>,
);