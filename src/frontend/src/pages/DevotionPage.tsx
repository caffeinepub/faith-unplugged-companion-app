import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useDevotionalDay, useAllJournalEntries, useAddJournalEntry, useSetCurrentDay } from '../hooks/useQueries';
import { ChevronLeft, ChevronRight, Home, Loader2, Mic, MicOff, Save, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface DevotionPageProps {
  selectedDay: number | null;
  onNavigateToDay: (day: number) => void;
  onBack: () => void;
}

export default function DevotionPage({ selectedDay, onNavigateToDay, onBack }: DevotionPageProps) {
  const day = selectedDay || 1;
  const { data: devotion, isLoading } = useDevotionalDay(day);
  const { data: journalEntries } = useAllJournalEntries();
  const addJournalMutation = useAddJournalEntry();
  const setCurrentDayMutation = useSetCurrentDay();

  const [journalContent, setJournalContent] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    const existingEntry = journalEntries?.find(entry => Number(entry.dayNumber) === day);
    if (existingEntry) {
      setJournalContent(existingEntry.content);
    } else {
      setJournalContent('');
    }
  }, [day, journalEntries]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;

      recognitionInstance.onresult = (event: any) => {
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          }
        }

        if (finalTranscript) {
          setJournalContent(prev => prev + finalTranscript);
        }
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast.error('Voice input error. Please try again.');
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  const toggleVoiceInput = () => {
    if (!recognition) {
      toast.error('Voice input is not supported in your browser.');
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
      toast.success('Voice input stopped');
    } else {
      recognition.start();
      setIsListening(true);
      toast.success('Voice input started. Speak now...');
    }
  };

  const handleSaveJournal = async () => {
    try {
      await addJournalMutation.mutateAsync({ day, content: journalContent });
      setJustSaved(true);
      toast.success('Journal entry saved!');
      setTimeout(() => setJustSaved(false), 2000);
    } catch (error) {
      toast.error('Failed to save journal entry');
    }
  };

  const handleNavigate = (newDay: number) => {
    if (newDay >= 1 && newDay <= 30) {
      setCurrentDayMutation.mutate(newDay);
      onNavigateToDay(newDay);
    }
  };

  const handleJumpToToday = () => {
    const today = new Date();
    const startDate = new Date('2026-01-01');
    const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const todayDay = Math.min(Math.max(daysSinceStart + 1, 1), 30);
    handleNavigate(todayDay);
  };

  if (isLoading || !devotion) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between animate-fade-in">
        <Button variant="ghost" onClick={onBack} className="border-2 transition-all duration-300">
          <Home className="mr-2 h-4 w-4" />
          Home
        </Button>
        <Badge variant="secondary" className="border-2 px-4 py-2 text-base font-semibold">
          Day {day} of 30
        </Badge>
      </div>

      <Card className="mb-6 border-2 shadow-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <CardHeader className="bg-muted/50">
          <CardTitle className="text-2xl font-bold text-foreground md:text-3xl">{devotion.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8 p-6 md:p-10">
          {/* Scripture (KJV) */}
          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <h3 className="mb-4 flex items-center text-xl font-bold text-primary">
              <span className="mr-2">📖</span> Scripture (KJV)
            </h3>
            <p className="rounded-xl border-2 border-primary/20 bg-muted/50 p-6 font-serif text-base italic leading-relaxed text-foreground md:text-lg">
              {devotion.scripture}
            </p>
          </div>

          <Separator className="my-6" />

          {/* Action */}
          {devotion.action && (
            <>
              <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <h3 className="mb-4 flex items-center text-xl font-bold text-primary">
                  <span className="mr-2">🎯</span> Action
                </h3>
                <p className="rounded-xl border-2 border-accent/20 bg-accent/10 p-6 text-base leading-relaxed text-foreground md:text-lg">
                  {devotion.action}
                </p>
              </div>
              <Separator className="my-6" />
            </>
          )}

          {/* Guidance */}
          {devotion.guidance && (
            <>
              <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <h3 className="mb-4 flex items-center text-xl font-bold text-primary">
                  <span className="mr-2">💡</span> Guidance
                </h3>
                <p className="rounded-xl border-2 border-primary/20 bg-primary/10 p-6 text-base leading-relaxed text-foreground md:text-lg">
                  {devotion.guidance}
                </p>
              </div>
              <Separator className="my-6" />
            </>
          )}

          {/* Reflection Prompt */}
          {devotion.reflection && (
            <div className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <h3 className="mb-4 flex items-center text-xl font-bold text-primary">
                <span className="mr-2">🙏</span> Reflection Prompt
              </h3>
              <p className="rounded-xl border-2 border-secondary/30 bg-secondary/20 p-6 text-base leading-relaxed text-foreground md:text-lg">
                {devotion.reflection}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Journal Entry Section */}
      <Card className="mb-8 border-2 shadow-card animate-fade-in" style={{ animationDelay: '0.6s' }}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-foreground">
            <span className="text-xl font-bold">Journal Entry</span>
            <Button
              variant={isListening ? 'destructive' : 'outline'}
              size="sm"
              onClick={toggleVoiceInput}
              className="border-2 transition-all duration-300"
            >
              {isListening ? (
                <>
                  <MicOff className="mr-2 h-4 w-4" />
                  Stop
                </>
              ) : (
                <>
                  <Mic className="mr-2 h-4 w-4" />
                  Voice Input
                </>
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <Textarea
            placeholder="Write your thoughts, prayers, and reflections here..."
            value={journalContent}
            onChange={(e) => setJournalContent(e.target.value)}
            className="min-h-[200px] resize-none border-2 text-base leading-relaxed"
          />
          <Button
            onClick={handleSaveJournal}
            disabled={addJournalMutation.isPending || justSaved}
            className="w-full border-2 border-primary/20 shadow-button transition-all duration-300 hover:shadow-button-hover"
            size="lg"
          >
            {addJournalMutation.isPending ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : justSaved ? (
              <CheckCircle className="mr-2 h-5 w-5" />
            ) : (
              <Save className="mr-2 h-5 w-5" />
            )}
            {justSaved ? 'Saved!' : 'Save Journal Entry'}
          </Button>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex flex-col gap-4 sm:flex-row animate-fade-in" style={{ animationDelay: '0.7s' }}>
        <Button
          variant="outline"
          onClick={() => handleNavigate(day - 1)}
          disabled={day <= 1}
          className="flex-1 border-2 shadow-button transition-all duration-300 hover:border-primary hover:shadow-button-hover disabled:opacity-50"
          size="lg"
        >
          <ChevronLeft className="mr-2 h-5 w-5" />
          Previous Day
        </Button>
        <Button
          variant="secondary"
          onClick={handleJumpToToday}
          className="flex-1 border-2 shadow-button transition-all duration-300 hover:shadow-button-hover"
          size="lg"
        >
          <Home className="mr-2 h-5 w-5" />
          Jump to Today
        </Button>
        <Button
          variant="outline"
          onClick={() => handleNavigate(day + 1)}
          disabled={day >= 30}
          className="flex-1 border-2 shadow-button transition-all duration-300 hover:border-primary hover:shadow-button-hover disabled:opacity-50"
          size="lg"
        >
          Next Day
          <ChevronRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
