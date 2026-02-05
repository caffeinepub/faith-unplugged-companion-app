import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, PenLine, Flame, Bell, ExternalLink, ArrowRight, Book, LogIn } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { toast } from 'sonner';

interface LandingPageProps {
  onStartJourney: () => void;
  isAuthenticated: boolean;
}

export default function LandingPage({ onStartJourney, isAuthenticated }: LandingPageProps) {
  const { login, loginStatus } = useInternetIdentity();

  const handleGetStarted = async () => {
    if (isAuthenticated) {
      onStartJourney();
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        toast.error('Login failed. Please try again.');
      }
    }
  };

  const disabled = loginStatus === 'logging-in';

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-background via-muted/30 to-secondary/20">
      <div className="container mx-auto max-w-5xl px-4 py-12 md:py-20">
        {/* Hero Logo */}
        <div className="mb-12 flex justify-center animate-fade-in">
          <img
            src="/assets/FAITH UNPLUGGED.png"
            alt="Faith Unplugged - A 30-Day Devotional"
            className="max-w-full rounded-2xl shadow-2xl md:max-w-2xl"
            style={{ animationDelay: '0.1s' }}
          />
        </div>

        {/* Introduction Text */}
        <div className="mb-16 text-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <p className="mx-auto max-w-2xl text-lg font-bold leading-relaxed text-foreground md:text-xl lg:text-2xl">
            Faith Unplugged is a 30-day devotional journey designed to help you quiet the noise, 
            hear God clearly, and strengthen your walk with Christ.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="mb-16 grid gap-6 md:grid-cols-2 lg:grid-cols-5 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <Card className="group card-hover border-2 bg-card shadow-card">
            <CardContent className="flex flex-col items-center p-6 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 shadow-md transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/25">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-base font-bold text-foreground">Daily Devotions</h3>
              <p className="text-sm font-medium text-muted-foreground">
                Guided by scripture and reflection
              </p>
            </CardContent>
          </Card>

          <Card className="group card-hover border-2 bg-card shadow-card">
            <CardContent className="flex flex-col items-center p-6 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 shadow-md transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/25">
                <Book className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-base font-bold text-foreground">KJV Bible Access</h3>
              <p className="text-sm font-medium text-muted-foreground">
                Complete offline Bible with search
              </p>
            </CardContent>
          </Card>

          <Card className="group card-hover border-2 bg-card shadow-card">
            <CardContent className="flex flex-col items-center p-6 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 shadow-md transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/25">
                <PenLine className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-base font-bold text-foreground">Journaling</h3>
              <p className="text-sm font-medium text-muted-foreground">
                Save your insights each day
              </p>
            </CardContent>
          </Card>

          <Card className="group card-hover border-2 bg-card shadow-card">
            <CardContent className="flex flex-col items-center p-6 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 shadow-md transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/25">
                <Flame className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-base font-bold text-foreground">Fasting Tracker</h3>
              <p className="text-sm font-medium text-muted-foreground">
                Deepen your faith through discipline
              </p>
            </CardContent>
          </Card>

          <Card className="group card-hover border-2 bg-card shadow-card">
            <CardContent className="flex flex-col items-center p-6 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 shadow-md transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/25">
                <Bell className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-base font-bold text-foreground">Daily Reminders</h3>
              <p className="text-sm font-medium text-muted-foreground">
                Stay consistent in your spiritual routine
              </p>
            </CardContent>
          </Card>
        </div>

        {/* How It Works Section */}
        <Card className="mb-16 border-2 bg-card shadow-2xl animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <CardContent className="p-8 md:p-12">
            <h2 className="mb-8 text-center text-3xl font-bold text-foreground md:text-4xl">
              How It Works
            </h2>
            <div className="space-y-6 text-center">
              <p className="text-lg font-medium leading-relaxed text-foreground">
                Open the app each day to read a devotion based on scripture from the King James Version. 
                Access the complete KJV Bible anytime for deeper study and reflection.
              </p>
              <p className="text-lg font-medium leading-relaxed text-foreground">
                Use the journal feature to save your insights, link scripture verses to your entries, 
                and track your spiritual growth over time.
              </p>
              <p className="text-lg font-medium leading-relaxed text-foreground">
                Engage with the fasting tracker to deepen your discipline, bookmark favorite verses, 
                and watch your faith flourish over 30 days.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="mb-12 text-center animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <Button
            onClick={handleGetStarted}
            disabled={disabled}
            size="lg"
            className="group mb-4 border-2 px-10 py-7 text-xl font-bold shadow-button-hover transition-all duration-300 hover:scale-105 hover:shadow-2xl disabled:opacity-50"
          >
            {isAuthenticated ? (
              <>
                Get Started
                <ArrowRight className="ml-3 h-6 w-6 transition-transform duration-300 group-hover:translate-x-2" />
              </>
            ) : (
              <>
                <LogIn className="mr-3 h-6 w-6" />
                {disabled ? 'Logging in...' : 'Login to Get Started'}
              </>
            )}
          </Button>
          <p className="text-base font-semibold text-muted-foreground">
            {isAuthenticated ? 'Begin your 30-day devotional journey today' : 'Secure login with Internet Identity'}
          </p>
        </div>

        {/* Reference Links */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="group border-2 bg-card font-semibold shadow-button transition-all duration-300 hover:scale-105 hover:border-primary hover:shadow-button-hover"
          >
            <a
              href="https://a.co/d/6QZIynW"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center"
            >
              <BookOpen className="mr-2 h-5 w-5" />
              Read the Book on Amazon
              <ExternalLink className="ml-2 h-4 w-4 opacity-70 transition-opacity duration-300 group-hover:opacity-100" />
            </a>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="group border-2 bg-card font-semibold shadow-button transition-all duration-300 hover:scale-105 hover:border-primary hover:shadow-button-hover"
          >
            <a
              href="https://templeofpraisefl.org"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center"
            >
              <img
                src="/assets/generated/cross-icon-transparent.dim_64x64.png"
                alt="Cross"
                className="mr-2 h-5 w-5"
              />
              Visit Temple of Praise Ministries
              <ExternalLink className="ml-2 h-4 w-4 opacity-70 transition-opacity duration-300 group-hover:opacity-100" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
