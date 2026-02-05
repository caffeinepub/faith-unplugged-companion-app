import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAllJournalEntries } from '../hooks/useQueries';
import { BookOpen, Loader2, FileDown } from 'lucide-react';
import { toast } from 'sonner';

interface JournalPageProps {
  onNavigateToDay: (day: number) => void;
}

export default function JournalPage({ onNavigateToDay }: JournalPageProps) {
  const { data: journalEntries, isLoading } = useAllJournalEntries();

  const handleExport = () => {
    toast.info('Export feature coming soon!');
  };

  const sortedEntries = journalEntries
    ? [...journalEntries].sort((a, b) => Number(a.dayNumber) - Number(b.dayNumber))
    : [];

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-foreground md:text-4xl">
          Journal Entries
        </h1>
        <p className="text-muted-foreground">
          Review and reflect on your spiritual journey
        </p>
      </div>

      <div className="mb-6 flex justify-end">
        <Button variant="outline" onClick={handleExport}>
          <FileDown className="mr-2 h-4 w-4" />
          Export Journal
        </Button>
      </div>

      {sortedEntries.length === 0 ? (
        <Card className="border-2">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <BookOpen className="mb-4 h-16 w-16 text-muted-foreground/50" />
            <h3 className="mb-2 text-xl font-semibold">No Journal Entries Yet</h3>
            <p className="text-muted-foreground">
              Start your devotional journey and write your first entry
            </p>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[calc(100vh-300px)]">
          <div className="space-y-4">
            {sortedEntries.map((entry) => (
              <Card
                key={Number(entry.dayNumber)}
                className="cursor-pointer border-2 transition-all hover:border-primary hover:shadow-md"
                onClick={() => onNavigateToDay(Number(entry.dayNumber))}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      Day {Number(entry.dayNumber)}
                    </CardTitle>
                    <Badge variant="secondary">
                      {entry.content.length} characters
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-3 text-muted-foreground">
                    {entry.content || 'No content yet...'}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
