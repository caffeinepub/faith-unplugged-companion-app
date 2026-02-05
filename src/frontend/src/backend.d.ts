import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface FastingSession {
    startTime?: Time;
    status: {
        __kind__: "notStarted";
        notStarted: null;
    } | {
        __kind__: "completed";
        completed: null;
    } | {
        __kind__: "inProgress";
        inProgress: {
            elapsed: bigint;
        };
    };
    goalHours: bigint;
    timestamp: Time;
    reflectionJournal: string;
}
export type Time = bigint;
export interface Reminder {
    time: bigint;
    enabled: boolean;
    message: string;
}
export interface JournalEntry {
    content: string;
    linkedScriptures: Array<VerseReference>;
    dayNumber: bigint;
}
export interface FastingContent {
    completionEncouragement: string;
    description: string;
    reflectionPrompt: string;
    scriptureReferences: Array<VerseReference>;
    hourlyEncouragement: Array<string>;
}
export interface MinistryInfo {
    missionStatement: string;
    email: string;
    website: string;
    address: string;
    supportLink: string;
}
export interface FastHistory {
    startTime: Time;
    endTime: Time;
    goalHours: bigint;
    timestamp: bigint;
    reflectionJournal: string;
}
export interface DevotionalDay {
    title: string;
    action: string;
    scripture: string;
    dayNumber: bigint;
    guidance: string;
    reflection: string;
}
export interface Bookmarks {
    verse: BibleVerse;
    note: string;
}
export interface VerseReference {
    book: string;
    verseStart: bigint;
    chapter: bigint;
    verseEnd: bigint;
}
export interface BibleVerse {
    verse: bigint;
    book: string;
    text: string;
    chapter: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addJournalEntry(day: bigint, content: string): Promise<void>;
    addLinkedScripture(day: bigint, reference: VerseReference): Promise<void>;
    addReminder(time: bigint, enabled: boolean, message: string): Promise<void>;
    addVerseBookmark(verse: BibleVerse, note: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    cancelCurrentFast(): Promise<boolean>;
    completeFast(reflectionJournal: string): Promise<boolean>;
    getAllBibleVerses(): Promise<Array<BibleVerse>>;
    getAllFastingSessions(): Promise<Array<FastingSession>>;
    getAllJournalEntries(): Promise<Array<JournalEntry>>;
    getBibleVerse(book: string, chapter: bigint, verse: bigint): Promise<BibleVerse | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCurrentDay(): Promise<bigint>;
    getDevotionalDay(day: bigint): Promise<DevotionalDay>;
    getFastingContent(): Promise<FastingContent>;
    getFastingHistory(): Promise<Array<FastHistory>>;
    getFastingProgress(): Promise<FastingSession>;
    getMinistryInfo(): Promise<MinistryInfo>;
    getReminders(): Promise<Array<Reminder>>;
    getUserDay(user: Principal): Promise<bigint>;
    getVerseBookmarks(): Promise<Array<Bookmarks>>;
    initializeBibleVerses(verses: Array<[string, bigint, bigint, string]>): Promise<void>;
    initializeDevotionalDays(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    listAllUsers(): Promise<Array<Principal>>;
    removeLinkedScripture(day: bigint, reference: VerseReference): Promise<void>;
    removeVerseBookmark(verse: BibleVerse): Promise<void>;
    searchBible(term: string): Promise<Array<BibleVerse>>;
    setCurrentDay(day: bigint): Promise<void>;
    startNewFast(goalHours: bigint): Promise<boolean>;
    updateFastingProgress(): Promise<boolean>;
    updateReminderStatus(index: bigint, enabled: boolean): Promise<boolean>;
}
