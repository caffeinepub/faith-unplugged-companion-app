import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { 
  DevotionalDay, 
  JournalEntry, 
  MinistryInfo, 
  FastingContent, 
  FastingSession,
  BibleVerse,
  Bookmarks,
  VerseReference
} from '../backend';

// User Profile Types
interface UserProfile {
  name: string;
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const role = await actor.getCallerUserRole();
      // If user has a role other than guest, they have a profile
      if (role === 'guest') {
        return null;
      }
      // User is authenticated and has interacted with the backend
      // Return a basic profile (in a real app with profile storage, fetch actual data here)
      return { name: 'User' };
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not initialized');
      // The backend automatically creates user data when they first interact
      // We just need to trigger any backend call to initialize the user
      // Using getCurrentDay as a simple way to ensure user is initialized
      await actor.getCurrentDay();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['currentDay'] });
    },
  });
}

export function useCurrentDay() {
  const { actor, isFetching } = useActor();

  return useQuery<number>({
    queryKey: ['currentDay'],
    queryFn: async () => {
      if (!actor) return 1;
      const day = await actor.getCurrentDay();
      return Number(day);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetCurrentDay() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (day: number) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.setCurrentDay(BigInt(day));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentDay'] });
    },
  });
}

export function useDevotionalDay(day: number) {
  const { actor, isFetching } = useActor();

  return useQuery<DevotionalDay>({
    queryKey: ['devotionalDay', day],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      return await actor.getDevotionalDay(BigInt(day));
    },
    enabled: !!actor && !isFetching && day >= 1 && day <= 30,
  });
}

export function useAllJournalEntries() {
  const { actor, isFetching } = useActor();

  return useQuery<JournalEntry[]>({
    queryKey: ['journalEntries'],
    queryFn: async () => {
      if (!actor) return [];
      return await actor.getAllJournalEntries();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddJournalEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ day, content }: { day: number; content: string }) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.addJournalEntry(BigInt(day), content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journalEntries'] });
    },
  });
}

export function useAddLinkedScripture() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ day, reference }: { day: number; reference: VerseReference }) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.addLinkedScripture(BigInt(day), reference);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journalEntries'] });
    },
  });
}

export function useRemoveLinkedScripture() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ day, reference }: { day: number; reference: VerseReference }) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.removeLinkedScripture(BigInt(day), reference);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journalEntries'] });
    },
  });
}

export function useMinistryInfo() {
  const { actor, isFetching } = useActor();

  return useQuery<MinistryInfo>({
    queryKey: ['ministryInfo'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      return await actor.getMinistryInfo();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useInitializeDevotionalDays() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.initializeDevotionalDays();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devotionalDay'] });
    },
  });
}

export function useFastingContent() {
  const { actor, isFetching } = useActor();

  return useQuery<FastingContent>({
    queryKey: ['fastingContent'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      return await actor.getFastingContent();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useFastingProgress() {
  const { actor, isFetching } = useActor();

  return useQuery<FastingSession>({
    queryKey: ['fastingProgress'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      return await actor.getFastingProgress();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 60000,
  });
}

export function useStartFast() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (goalHours: number) => {
      if (!actor) throw new Error('Actor not initialized');
      return await actor.startNewFast(BigInt(goalHours));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fastingProgress'] });
      queryClient.invalidateQueries({ queryKey: ['fastingSessions'] });
    },
  });
}

export function useCompleteFast() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reflectionJournal: string) => {
      if (!actor) throw new Error('Actor not initialized');
      return await actor.completeFast(reflectionJournal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fastingProgress'] });
      queryClient.invalidateQueries({ queryKey: ['fastingSessions'] });
      queryClient.invalidateQueries({ queryKey: ['fastingHistory'] });
    },
  });
}

export function useCancelFast() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      return await actor.cancelCurrentFast();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fastingProgress'] });
      queryClient.invalidateQueries({ queryKey: ['fastingSessions'] });
    },
  });
}

// Bible queries
export function useAllBibleVerses() {
  const { actor, isFetching } = useActor();

  return useQuery<BibleVerse[]>({
    queryKey: ['allBibleVerses'],
    queryFn: async () => {
      if (!actor) return [];
      return await actor.getAllBibleVerses();
    },
    enabled: !!actor && !isFetching,
    staleTime: Infinity,
  });
}

export function useSearchBible(searchTerm: string) {
  const { actor, isFetching } = useActor();

  return useQuery<BibleVerse[]>({
    queryKey: ['searchBible', searchTerm],
    queryFn: async () => {
      if (!actor || !searchTerm) return [];
      return await actor.searchBible(searchTerm);
    },
    enabled: !!actor && !isFetching && searchTerm.length > 0,
  });
}

export function useGetBibleVerse(book: string, chapter: number, verse: number) {
  const { actor, isFetching } = useActor();

  return useQuery<BibleVerse | null>({
    queryKey: ['bibleVerse', book, chapter, verse],
    queryFn: async () => {
      if (!actor) return null;
      return await actor.getBibleVerse(book, BigInt(chapter), BigInt(verse));
    },
    enabled: !!actor && !isFetching && !!book && chapter > 0 && verse > 0,
  });
}

export function useVerseBookmarks() {
  const { actor, isFetching } = useActor();

  return useQuery<Bookmarks[]>({
    queryKey: ['verseBookmarks'],
    queryFn: async () => {
      if (!actor) return [];
      return await actor.getVerseBookmarks();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddVerseBookmark() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ verse, note }: { verse: BibleVerse; note: string }) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.addVerseBookmark(verse, note);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verseBookmarks'] });
    },
  });
}

export function useRemoveVerseBookmark() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (verse: BibleVerse) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.removeVerseBookmark(verse);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verseBookmarks'] });
    },
  });
}
