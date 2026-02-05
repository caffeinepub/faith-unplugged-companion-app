import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCurrentDay, useAllJournalEntries, useVerseBookmarks, useGetCallerUserProfile } from '../hooks/useQueries';
import { BookOpen, Loader2, Heart, Flame, BookMarked, PenLine, Award, TrendingUp } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

interface MyJourneyPageProps {
  onNavigateToDay: (day: number) => void;
}

export default function MyJourneyPage({ onNavigateToDay }: MyJourneyPageProps) {
  const { identity } = useInternetIdentity();
  const { data: currentDay, isLoading: dayLoading } = useCurrentDay();
  const { data: journalEntries, isLoading: journalLoading } = useAllJournalEntries();
  const { data: bookmarks, isLoading: bookmarksLoading } = useVerseBookmarks();
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();

  const isLoading = dayLoading || journalLoading || bookmarksLoading || profileLoading;

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const day = currentDay || 1;
  const progress = (day / 30) * 100;
  const completedDays = journalEntries?.length || 0;
  const bookmarkCount = bookmarks?.length || 0;
  const userName = userProfile?.name || 'Friend';
  const principalId = identity?.getPrincipal().toString() || '';

  // Get recent journal entries (last 3)
  const recentEntries = journalEntries
    ?.sort((a, b) => Number(b.dayNumber) - Number(a.dayNumber))
    .slice(0, 3) || [];

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 md:py-12 animate-in fade-in duration-500">
      {/* Welcome Header */}
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
          Welcome, {userName}!
        </h1>
        <p className="text-lg text-muted-foreground">
          Your personal spiritual journey with Faith Unplugged
        </p>
      </div>

      {/* Progress Overview */}
      <Card className="mb-8 border-2 shadow-xl">
        <CardHeader className="bg-muted/50">
          <CardTitle className="flex items-center gap-2 text-2xl text-foreground">
            <TrendingUp className="h-6 w-6 text-primary" />
            Your Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 md:p-8">
          <div className="mb-6">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-lg font-semibold text-muted-foreground">Devotional Journey</span>
              <span className="text-2xl font-bold text-primary">
                Day {day} of 30
              </span>
            </div>
            <Progress value={progress} className="h-4" />
            <p className="mt-2 text-center text-sm text-muted-foreground">
              {Math.round(progress)}% Complete
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-2">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15">
                  <PenLine className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{completedDays}</p>
                  <p className="text-sm text-muted-foreground">Journal Entries</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/15">
                  <BookMarked className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{bookmarkCount}</p>
                  <p className="text-sm text-muted-foreground">Bookmarked Verses</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/15">
                  <Award className="h-6 w-6 text-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{day}</p>
                  <p className="text-sm text-muted-foreground">Days Active</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Recent Journal Entries */}
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <PenLine className="h-5 w-5 text-primary" />
              Recent Journal Entries
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentEntries.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <BookOpen className="mx-auto mb-2 h-12 w-12 opacity-50" />
                <p>No journal entries yet</p>
                <p className="text-sm">Start writing to track your journey</p>
              </div>
            ) : (
              recentEntries.map((entry) => (
                <Card
                  key={Number(entry.dayNumber)}
                  className="cursor-pointer border transition-all hover:border-primary hover:shadow-md"
                  onClick={() => onNavigateToDay(Number(entry.dayNumber))}
                >
                  <CardContent className="p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <Badge variant="secondary">Day {Number(entry.dayNumber)}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {entry.content.length} characters
                      </span>
                    </div>
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {entry.content || 'No content yet...'}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>

        {/* Bookmarked Verses */}
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <BookMarked className="h-5 w-5 text-accent" />
              Favorite Verses
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {bookmarkCount === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <Heart className="mx-auto mb-2 h-12 w-12 opacity-50" />
                <p>No bookmarked verses yet</p>
                <p className="text-sm">Save your favorite scriptures</p>
              </div>
            ) : (
              bookmarks?.slice(0, 3).map((bookmark, index) => (
                <Card key={index} className="border">
                  <CardContent className="p-4">
                    <p className="mb-2 font-semibold text-primary">
                      {bookmark.verse.book} {Number(bookmark.verse.chapter)}:{Number(bookmark.verse.verse)}
                    </p>
                    <p className="mb-2 text-sm italic text-muted-foreground line-clamp-2">
                      "{bookmark.verse.text}"
                    </p>
                    {bookmark.note && (
                      <p className="text-xs text-muted-foreground">
                        Note: {bookmark.note}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Separator className="my-8" />

      {/* Spiritual Milestones */}
      <Card className="border-2 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Flame className="h-5 w-5 text-primary" />
            Spiritual Milestones
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {day >= 7 && (
              <div className="flex items-center gap-3 rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
                <Award className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-semibold text-foreground">First Week Complete!</p>
                  <p className="text-sm text-muted-foreground">You've completed 7 days of devotions</p>
                </div>
              </div>
            )}
            {completedDays >= 10 && (
              <div className="flex items-center gap-3 rounded-lg border-2 border-accent/20 bg-accent/5 p-4">
                <PenLine className="h-8 w-8 text-accent" />
                <div>
                  <p className="font-semibold text-foreground">Faithful Journaler</p>
                  <p className="text-sm text-muted-foreground">10+ journal entries written</p>
                </div>
              </div>
            )}
            {bookmarkCount >= 5 && (
              <div className="flex items-center gap-3 rounded-lg border-2 border-secondary/20 bg-secondary/5 p-4">
                <BookMarked className="h-8 w-8 text-foreground" />
                <div>
                  <p className="font-semibold text-foreground">Scripture Collector</p>
                  <p className="text-sm text-muted-foreground">5+ verses bookmarked</p>
                </div>
              </div>
            )}
            {day >= 30 && (
              <div className="flex items-center gap-3 rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
                <Heart className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-semibold text-foreground">Journey Complete!</p>
                  <p className="text-sm text-muted-foreground">You've finished all 30 days</p>
                </div>
              </div>
            )}
          </div>
          {day < 7 && completedDays < 10 && bookmarkCount < 5 && (
            <div className="py-8 text-center text-muted-foreground">
              <Award className="mx-auto mb-2 h-12 w-12 opacity-50" />
              <p>Keep going to unlock milestones!</p>
              <p className="text-sm">Complete devotions and journal entries to earn achievements</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Encouragement Message */}
      <Card className="mt-8 border-2 border-primary/20 bg-muted/30 shadow-lg">
        <CardContent className="p-6 text-center md:p-8">
          <Heart className="mx-auto mb-4 h-12 w-12 text-primary" />
          <h3 className="mb-2 text-xl font-bold text-foreground">Keep Growing in Faith</h3>
          <p className="text-muted-foreground">
            "But grow in grace, and in the knowledge of our Lord and Saviour Jesus Christ." - 2 Peter 3:18
          </p>
          <Button
            onClick={() => onNavigateToDay(day)}
            className="mt-6"
            size="lg"
          >
            <BookOpen className="mr-2 h-5 w-5" />
            Continue Day {day}
          </Button>
        </CardContent>
      </Card>

      {/* User Identity Info (for reference) */}
      <div className="mt-8 text-center text-xs text-muted-foreground">
        <p>Your Identity: {principalId.slice(0, 20)}...</p>
      </div>
    </div>
  );
}
