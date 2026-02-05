import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useCurrentDay, useInitializeDevotionalDays } from '../hooks/useQueries';
import { BookOpen, Loader2, ExternalLink, Book } from 'lucide-react';

interface HomePageProps {
  onNavigateToDay: (day: number) => void;
  onNavigateToBible: () => void;
}

export default function HomePage({ onNavigateToDay, onNavigateToBible }: HomePageProps) {
  const { data: currentDay, isLoading } = useCurrentDay();
  const initializeMutation = useInitializeDevotionalDays();

  useEffect(() => {
    initializeMutation.mutate();
  }, []);

  const day = currentDay || 1;
  const progress = (day / 30) * 100;

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 md:py-16">
      <div className="relative mb-12 overflow-hidden rounded-2xl shadow-2xl transition-all duration-300 hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.2)] animate-fade-in">
        <img
          src="/assets/FAITH UNPLUGGED.png"
          alt="Faith Unplugged - A 30-Day Devotional to Hearing God in the Noise of Life"
          className="w-full object-cover"
        />
      </div>

      <Card className="mb-8 border-2 shadow-card card-hover animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <CardContent className="p-6 md:p-10">
          <div className="mb-8 text-center">
            <h2 className="mb-3 text-2xl font-bold text-foreground md:text-3xl lg:text-4xl">
              Welcome to Day {day} of Faith Unplugged
            </h2>
            <p className="text-base font-medium text-muted-foreground md:text-lg">
              Continue your journey of hearing God in the noise of life
            </p>
          </div>

          <div className="mb-8">
            <div className="mb-3 flex items-center justify-between text-sm md:text-base">
              <span className="font-semibold text-muted-foreground">Your Progress</span>
              <span className="text-lg font-bold text-primary md:text-xl">
                Day {day} of 30
              </span>
            </div>
            <Progress value={progress} className="h-4 transition-all duration-500" />
            <p className="mt-2 text-center text-sm font-medium text-muted-foreground">
              {Math.round(progress)}% Complete
            </p>
          </div>

          <div className="space-y-4">
            <Button
              onClick={() => onNavigateToDay(day)}
              size="lg"
              className="w-full border-2 border-primary/20 text-lg font-semibold shadow-button transition-all duration-300 hover:shadow-button-hover"
            >
              <BookOpen className="mr-2 h-5 w-5" />
              Continue Today's Devotion
            </Button>

            <Button
              onClick={onNavigateToBible}
              variant="outline"
              size="lg"
              className="w-full border-2 text-lg font-semibold shadow-button transition-all duration-300 hover:border-primary hover:shadow-button-hover"
            >
              <Book className="mr-2 h-5 w-5" />
              Open Bible (KJV)
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="mb-10 grid gap-6 md:grid-cols-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <Card className="group card-hover cursor-pointer border-2 transition-all duration-300 hover:border-primary">
          <CardContent className="flex items-center gap-4 p-6">
            <img
              src="/assets/generated/bible-reading.dim_400x300.jpg"
              alt="Bible reading"
              className="h-24 w-24 rounded-lg object-cover shadow-md transition-transform duration-300 group-hover:scale-105"
            />
            <div>
              <h3 className="mb-2 text-lg font-bold text-foreground">Daily Scripture</h3>
              <p className="text-sm font-medium text-muted-foreground">
                Reflect on God's Word each day (KJV)
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="group card-hover cursor-pointer border-2 transition-all duration-300 hover:border-primary">
          <CardContent className="flex items-center gap-4 p-6">
            <img
              src="/assets/generated/praying-hands.dim_300x400.jpg"
              alt="Praying hands"
              className="h-24 w-24 rounded-lg object-cover shadow-md transition-transform duration-300 group-hover:scale-105"
            />
            <div>
              <h3 className="mb-2 text-lg font-bold text-foreground">Prayer & Journal</h3>
              <p className="text-sm font-medium text-muted-foreground">
                Document your spiritual journey
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:justify-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
        <Button
          asChild
          variant="outline"
          size="lg"
          className="group border-2 font-semibold shadow-button transition-all duration-300 hover:border-primary hover:shadow-button-hover"
        >
          <a
            href="https://a.co/d/6QZIynW"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center"
          >
            <BookOpen className="mr-2 h-5 w-5" />
            Get the Book on Amazon
            <ExternalLink className="ml-2 h-4 w-4 opacity-70 transition-opacity duration-300 group-hover:opacity-100" />
          </a>
        </Button>

        <Button
          asChild
          variant="outline"
          size="lg"
          className="group border-2 font-semibold shadow-button transition-all duration-300 hover:border-primary hover:shadow-button-hover"
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
  );
}
