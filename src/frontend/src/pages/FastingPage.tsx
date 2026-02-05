import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useFastingContent, useFastingProgress, useStartFast, useCompleteFast, useCancelFast } from '../hooks/useQueries';
import { Loader2, Play, Square, CheckCircle, Mic, MicOff } from 'lucide-react';
import { toast } from 'sonner';

export default function FastingPage() {
  const { data: fastingContent, isLoading: isLoadingContent } = useFastingContent();
  const { data: fastingProgress, isLoading: isLoadingProgress, refetch: refetchProgress } = useFastingProgress();
  const startFastMutation = useStartFast();
  const completeFastMutation = useCompleteFast();
  const cancelFastMutation = useCancelFast();

  const [goalHours, setGoalHours] = useState<number>(6);
  const [reflectionText, setReflectionText] = useState('');
  const [elapsedHours, setElapsedHours] = useState(0);
  const [elapsedMinutes, setElapsedMinutes] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  // Initialize speech recognition
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
          setReflectionText(prev => prev + finalTranscript);
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

  // Update elapsed time from backend progress
  useEffect(() => {
    if (fastingProgress && fastingProgress.status.__kind__ === 'inProgress') {
      const totalMinutes = Number(fastingProgress.status.inProgress.elapsed) * 60;
      setElapsedHours(Math.floor(totalMinutes / 60));
      setElapsedMinutes(Math.floor(totalMinutes % 60));
    }
  }, [fastingProgress]);

  // Auto-refresh progress every minute when fasting is in progress
  useEffect(() => {
    if (fastingProgress && fastingProgress.status.__kind__ === 'inProgress') {
      const interval = setInterval(() => {
        refetchProgress();
      }, 60000); // Refresh every minute

      return () => clearInterval(interval);
    }
  }, [fastingProgress, refetchProgress]);

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

  const handleStartFast = async () => {
    if (goalHours <= 0) {
      toast.error('Please enter a valid goal in hours');
      return;
    }

    try {
      const success = await startFastMutation.mutateAsync(goalHours);
      if (success) {
        toast.success(`Fast started! Goal: ${goalHours} hours`);
        setReflectionText('');
      } else {
        toast.error('Failed to start fast');
      }
    } catch (error) {
      toast.error('Failed to start fast');
    }
  };

  const handleCompleteFast = async () => {
    try {
      const success = await completeFastMutation.mutateAsync(reflectionText);
      if (success) {
        toast.success('Fast completed! Well done!');
        setReflectionText('');
        setElapsedHours(0);
        setElapsedMinutes(0);
      } else {
        toast.error('Failed to complete fast');
      }
    } catch (error) {
      toast.error('Failed to complete fast');
    }
  };

  const handleCancelFast = async () => {
    try {
      const success = await cancelFastMutation.mutateAsync();
      if (success) {
        toast.success('Fast cancelled');
        setReflectionText('');
        setElapsedHours(0);
        setElapsedMinutes(0);
      } else {
        toast.error('Failed to cancel fast');
      }
    } catch (error) {
      toast.error('Failed to cancel fast');
    }
  };

  if (isLoadingContent || isLoadingProgress) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isFasting = fastingProgress && fastingProgress.status.__kind__ === 'inProgress';
  const isCompleted = fastingProgress && fastingProgress.status.__kind__ === 'completed';
  const currentGoalHours = fastingProgress ? Number(fastingProgress.goalHours) : goalHours;
  const progressPercentage = isFasting ? Math.min((elapsedHours / currentGoalHours) * 100, 100) : 0;
  const currentHourIndex = Math.min(Math.floor(elapsedHours), (fastingContent?.hourlyEncouragement.length || 6) - 1);

  // Format scripture references
  const formatDescription = (text: string) => {
    const parts = text.split(/(\n\n)/);
    return parts.map((part, index) => {
      // Check if this part contains scripture references
      if (part.includes('Matthew 6:16–18') || part.includes('Isaiah 58:6–9') || part.includes('Joel 2:12')) {
        return (
          <p key={index} className="mb-4 font-semibold text-primary">
            {part}
          </p>
        );
      }
      return part === '\n\n' ? null : (
        <p key={index} className="mb-4 leading-relaxed text-foreground">
          {part}
        </p>
      );
    });
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold text-foreground md:text-4xl">Fasting</h1>
        <p className="text-muted-foreground">A spiritual discipline to draw closer to God</p>
      </div>

      {/* Description Section */}
      <Card className="mb-6 border-2 shadow-lg">
        <CardHeader className="bg-muted/50">
          <CardTitle className="text-xl text-foreground">Biblical Fasting</CardTitle>
        </CardHeader>
        <CardContent className="p-6 md:p-8">
          <div className="prose prose-sm max-w-none">
            {fastingContent && formatDescription(fastingContent.description)}
          </div>
        </CardContent>
      </Card>

      {/* Goal Hours Tracker */}
      {!isFasting && !isCompleted && (
        <Card className="mb-6 border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="text-foreground">Start Your Fast</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="goalHours" className="text-base text-foreground">
                Fasting Goal (Hours)
              </Label>
              <Input
                id="goalHours"
                type="number"
                min="1"
                max="72"
                value={goalHours}
                onChange={(e) => setGoalHours(Number(e.target.value))}
                className="mt-2 border-2"
              />
              <p className="mt-2 text-sm text-muted-foreground">
                Set your fasting goal between 1 and 72 hours
              </p>
            </div>
            <Button
              onClick={handleStartFast}
              disabled={startFastMutation.isPending}
              className="w-full border-2"
              size="lg"
            >
              {startFastMutation.isPending ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Play className="mr-2 h-5 w-5" />
              )}
              Start Fast
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Active Fast Progress */}
      {isFasting && (
        <>
          <Card className="mb-6 border-2 shadow-lg">
            <CardHeader className="bg-muted/50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-foreground">Fast in Progress</CardTitle>
                <Badge variant="default" className="text-base">
                  Active
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 p-6 md:p-8">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Progress</span>
                  <span className="text-lg font-bold text-primary">
                    {elapsedHours}h {elapsedMinutes}m / {currentGoalHours}h
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-4" />
              </div>

              <Separator />

              {/* Hourly Encouragement */}
              <div>
                <h3 className="mb-3 flex items-center text-lg font-semibold text-primary">
                  <span className="mr-2">💪</span> Hour {currentHourIndex + 1} Encouragement
                </h3>
                <div className="rounded-lg border-2 border-accent/20 bg-accent/10 p-4">
                  <p className="leading-relaxed text-foreground">
                    {fastingContent?.hourlyEncouragement[currentHourIndex]}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={handleCancelFast}
                  variant="outline"
                  disabled={cancelFastMutation.isPending}
                  className="flex-1 border-2"
                >
                  {cancelFastMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Square className="mr-2 h-4 w-4" />
                  )}
                  Cancel Fast
                </Button>
                <Button
                  onClick={handleCompleteFast}
                  disabled={completeFastMutation.isPending}
                  className="flex-1 border-2"
                >
                  {completeFastMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="mr-2 h-4 w-4" />
                  )}
                  Complete Fast
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Reflection Section During Fast */}
          <Card className="mb-6 border-2 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-foreground">
                <span>Reflection Journal</span>
                <Button
                  variant={isListening ? 'destructive' : 'outline'}
                  size="sm"
                  onClick={toggleVoiceInput}
                  className="border-2"
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
            <CardContent className="space-y-4">
              <div>
                <p className="mb-3 text-sm text-muted-foreground">
                  {fastingContent?.reflectionPrompt}
                </p>
                <Textarea
                  placeholder="Record your thoughts, prayers, and revelations during this fast..."
                  value={reflectionText}
                  onChange={(e) => setReflectionText(e.target.value)}
                  className="min-h-[200px] resize-none border-2"
                />
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Completion Encouragement */}
      {isCompleted && (
        <Card className="mb-6 border-2 border-success shadow-lg">
          <CardHeader className="bg-success/10">
            <div className="flex items-center justify-between">
              <CardTitle className="text-foreground">Fast Completed!</CardTitle>
              <Badge variant="default" className="bg-success text-base text-success-foreground">
                <CheckCircle className="mr-1 h-4 w-4" />
                Completed
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            <div className="rounded-lg border-2 border-success/20 bg-success/10 p-6">
              <p className="text-lg leading-relaxed text-foreground">
                {fastingContent?.completionEncouragement}
              </p>
            </div>
            <Button
              onClick={() => {
                setElapsedHours(0);
                setElapsedMinutes(0);
                refetchProgress();
              }}
              className="mt-6 w-full border-2"
              size="lg"
            >
              Start New Fast
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
