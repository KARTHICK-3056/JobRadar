import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ThemeProvider } from './context/ThemeContext';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { Listings } from './pages/Listings';
import { ReviewQueue } from './pages/ReviewQueue';
import { Tracker } from './pages/Tracker';
import { Sources } from './pages/Sources';
import { Evidence } from './pages/Evidence';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="listings" element={<Listings />} />
              <Route path="review" element={<ReviewQueue />} />
              <Route path="tracker" element={<Tracker />} />
              <Route path="sources" element={<Sources />} />
              <Route path="evidence" element={<Evidence />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              className: 'font-sans text-sm rounded-xl border border-border bg-surface text-foreground shadow-2xl backdrop-blur-xl',
            }}
          />
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
