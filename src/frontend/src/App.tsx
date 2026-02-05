import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import DevotionPage from './pages/DevotionPage';
import JournalPage from './pages/JournalPage';
import MinistryPage from './pages/MinistryPage';
import SettingsPage from './pages/SettingsPage';
import FastingPage from './pages/FastingPage';
import BiblePage from './pages/BiblePage';
import MyJourneyPage from './pages/MyJourneyPage';
import ProfileSetupModal from './components/ProfileSetupModal';
import Header from './components/Header';
import Footer from './components/Footer';
import { Loader2 } from 'lucide-react';

const queryClient = new QueryClient();

type Page = 'landing' | 'home' | 'devotion' | 'journal' | 'ministry' | 'settings' | 'fasting' | 'bible' | 'myjourney';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const { identity, isInitializing, loginStatus } = useInternetIdentity();

  const isAuthenticated = !!identity;

  useEffect(() => {
    // If user logs out, return to landing page and clear query cache
    if (!isAuthenticated && currentPage !== 'landing') {
      setCurrentPage('landing');
      queryClient.clear();
    }
  }, [isAuthenticated, currentPage]);

  const navigateToDevotionDay = (day: number) => {
    setSelectedDay(day);
    setCurrentPage('devotion');
  };

  const navigateToPage = (page: Page) => {
    setCurrentPage(page);
  };

  const showHeader = currentPage !== 'landing';

  // Show loading screen while initializing authentication
  if (isInitializing || loginStatus === 'logging-in') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" />
          <p className="text-lg text-muted-foreground">
            {loginStatus === 'logging-in' ? 'Logging in...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {showHeader && (
        <Header
          currentPage={currentPage}
          onNavigate={navigateToPage}
          isAuthenticated={isAuthenticated}
        />
      )}

      <main className="flex-1">
        {currentPage === 'landing' && (
          <LandingPage
            onStartJourney={() => navigateToPage('home')}
            isAuthenticated={isAuthenticated}
          />
        )}
        {currentPage === 'home' && isAuthenticated && (
          <HomePage
            onNavigateToDay={navigateToDevotionDay}
            onNavigateToBible={() => navigateToPage('bible')}
          />
        )}
        {currentPage === 'devotion' && isAuthenticated && (
          <DevotionPage
            selectedDay={selectedDay}
            onNavigateToDay={navigateToDevotionDay}
            onBack={() => setCurrentPage('home')}
          />
        )}
        {currentPage === 'journal' && isAuthenticated && (
          <JournalPage onNavigateToDay={navigateToDevotionDay} />
        )}
        {currentPage === 'ministry' && <MinistryPage />}
        {currentPage === 'settings' && isAuthenticated && <SettingsPage />}
        {currentPage === 'fasting' && isAuthenticated && <FastingPage />}
        {currentPage === 'bible' && isAuthenticated && <BiblePage />}
        {currentPage === 'myjourney' && isAuthenticated && (
          <MyJourneyPage onNavigateToDay={navigateToDevotionDay} />
        )}
      </main>

      <Footer />
      <Toaster />
      <ProfileSetupModal />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <AppContent />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
