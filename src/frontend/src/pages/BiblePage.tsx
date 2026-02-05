import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useAllBibleVerses, useSearchBible, useVerseBookmarks, useAddVerseBookmark, useRemoveVerseBookmark } from '../hooks/useQueries';
import { Search, Bookmark, BookmarkCheck, Loader2, Book, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import type { BibleVerse } from '../backend';

const BIBLE_BOOKS = {
  'Old Testament': [
    'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
    'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel',
    '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra',
    'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs',
    'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah', 'Lamentations',
    'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos',
    'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk',
    'Zephaniah', 'Haggai', 'Zechariah', 'Malachi'
  ],
  'New Testament': [
    'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans',
    '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians',
    'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy',
    'Titus', 'Philemon', 'Hebrews', 'James', '1 Peter',
    '2 Peter', '1 John', '2 John', '3 John', 'Jude',
    'Revelation'
  ]
};

export default function BiblePage() {
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [bookmarkNote, setBookmarkNote] = useState('');
  const [selectedVerseForBookmark, setSelectedVerseForBookmark] = useState<BibleVerse | null>(null);

  const { data: allVerses, isLoading: versesLoading } = useAllBibleVerses();
  const { data: searchResults, isLoading: searchLoading } = useSearchBible(searchTerm);
  const { data: bookmarks } = useVerseBookmarks();
  const addBookmarkMutation = useAddVerseBookmark();
  const removeBookmarkMutation = useRemoveVerseBookmark();

  const chapters = useMemo(() => {
    if (!selectedBook || !allVerses) return [];
    const bookVerses = allVerses.filter(v => v.book === selectedBook);
    const chapterNumbers = [...new Set(bookVerses.map(v => Number(v.chapter)))].sort((a, b) => a - b);
    return chapterNumbers;
  }, [selectedBook, allVerses]);

  const verses = useMemo(() => {
    if (!selectedBook || !selectedChapter || !allVerses) return [];
    return allVerses
      .filter(v => v.book === selectedBook && Number(v.chapter) === selectedChapter)
      .sort((a, b) => Number(a.verse) - Number(b.verse));
  }, [selectedBook, selectedChapter, allVerses]);

  const isBookmarked = (verse: BibleVerse) => {
    return bookmarks?.some(b => 
      b.verse.book === verse.book && 
      Number(b.verse.chapter) === Number(verse.chapter) && 
      Number(b.verse.verse) === Number(verse.verse)
    );
  };

  const handleAddBookmark = async () => {
    if (!selectedVerseForBookmark) return;
    try {
      await addBookmarkMutation.mutateAsync({
        verse: selectedVerseForBookmark,
        note: bookmarkNote
      });
      toast.success('Verse bookmarked!');
      setBookmarkNote('');
      setSelectedVerseForBookmark(null);
    } catch (error) {
      toast.error('Failed to bookmark verse');
    }
  };

  const handleRemoveBookmark = async (verse: BibleVerse) => {
    try {
      await removeBookmarkMutation.mutateAsync(verse);
      toast.success('Bookmark removed');
    } catch (error) {
      toast.error('Failed to remove bookmark');
    }
  };

  if (versesLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-foreground md:text-4xl">
          Holy Bible (KJV)
        </h1>
        <p className="text-muted-foreground">
          King James Version - Public Domain
        </p>
      </div>

      {/* External Bible Link Button */}
      <div className="mb-6 flex justify-center">
        <Button
          asChild
          size="lg"
          className="border-2 bg-gradient-to-r from-primary to-accent font-semibold text-primary-foreground shadow-button transition-all hover:scale-105 hover:shadow-button-hover"
        >
          <a
            href="https://m.kingjamesbibleonline.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            <Book className="h-5 w-5" />
            Open Full KJV Bible
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </div>

      <Tabs defaultValue="browse" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="browse">Browse</TabsTrigger>
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6">
          {!selectedBook ? (
            <div className="space-y-6">
              {Object.entries(BIBLE_BOOKS).map(([testament, books]) => (
                <Card key={testament} className="border-2">
                  <CardHeader>
                    <CardTitle className="text-foreground">{testament}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                      {books.map(book => (
                        <Button
                          key={book}
                          variant="outline"
                          onClick={() => {
                            setSelectedBook(book);
                            setSelectedChapter(null);
                          }}
                          className="justify-start border-2 text-foreground"
                        >
                          <Book className="mr-2 h-4 w-4" />
                          {book}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : !selectedChapter ? (
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-foreground">{selectedBook}</CardTitle>
                  <Button variant="ghost" onClick={() => setSelectedBook(null)} className="border-2">
                    Back to Books
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 md:grid-cols-10">
                  {chapters.map(chapter => (
                    <Button
                      key={chapter}
                      variant="outline"
                      onClick={() => setSelectedChapter(chapter)}
                      className="aspect-square border-2 text-foreground"
                    >
                      {chapter}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="font-serif text-2xl text-foreground">
                    {selectedBook} {selectedChapter}
                  </CardTitle>
                  <Button variant="ghost" onClick={() => setSelectedChapter(null)} className="border-2">
                    Back to Chapters
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[calc(100vh-350px)]">
                  <div className="space-y-4 pr-4">
                    {verses.map(verse => (
                      <div key={`${verse.book}-${verse.chapter}-${verse.verse}`} className="group relative">
                        <div className="flex gap-3">
                          <Badge variant="secondary" className="h-6 shrink-0">
                            {Number(verse.verse)}
                          </Badge>
                          <p className="font-serif leading-relaxed text-foreground">
                            {verse.text}
                          </p>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                                onClick={() => setSelectedVerseForBookmark(verse)}
                              >
                                {isBookmarked(verse) ? (
                                  <BookmarkCheck className="h-4 w-4 text-primary" />
                                ) : (
                                  <Bookmark className="h-4 w-4" />
                                )}
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle className="text-foreground">
                                  {isBookmarked(verse) ? 'Remove Bookmark' : 'Add Bookmark'}
                                </DialogTitle>
                              </DialogHeader>
                              {isBookmarked(verse) ? (
                                <div className="space-y-4">
                                  <p className="text-sm text-muted-foreground">
                                    Remove this verse from your bookmarks?
                                  </p>
                                  <Button
                                    onClick={() => handleRemoveBookmark(verse)}
                                    variant="destructive"
                                    className="w-full"
                                  >
                                    Remove Bookmark
                                  </Button>
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  <div>
                                    <p className="mb-2 font-serif text-sm text-foreground">
                                      {verse.book} {Number(verse.chapter)}:{Number(verse.verse)}
                                    </p>
                                    <p className="font-serif text-sm italic text-muted-foreground">
                                      {verse.text}
                                    </p>
                                  </div>
                                  <Textarea
                                    placeholder="Add a personal note (optional)..."
                                    value={bookmarkNote}
                                    onChange={(e) => setBookmarkNote(e.target.value)}
                                    className="min-h-[100px] border-2"
                                  />
                                  <Button
                                    onClick={handleAddBookmark}
                                    disabled={addBookmarkMutation.isPending}
                                    className="w-full"
                                  >
                                    {addBookmarkMutation.isPending ? (
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                      <Bookmark className="mr-2 h-4 w-4" />
                                    )}
                                    Save Bookmark
                                  </Button>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="search" className="space-y-6">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-foreground">Search the Bible</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by keyword, verse reference (e.g., John 3:16), or phrase..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-2 pl-10"
                />
              </div>

              {searchLoading && (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              )}

              {searchTerm && !searchLoading && searchResults && (
                <ScrollArea className="h-[calc(100vh-400px)]">
                  <div className="space-y-4 pr-4">
                    {searchResults.length === 0 ? (
                      <p className="py-8 text-center text-muted-foreground">
                        No results found for "{searchTerm}"
                      </p>
                    ) : (
                      <>
                        <p className="text-sm text-muted-foreground">
                          Found {searchResults.length} verse{searchResults.length !== 1 ? 's' : ''}
                        </p>
                        {searchResults.map((verse, idx) => (
                          <Card key={idx} className="border-2">
                            <CardContent className="p-4">
                              <div className="mb-2 flex items-center justify-between">
                                <Badge variant="outline">
                                  {verse.book} {Number(verse.chapter)}:{Number(verse.verse)}
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedBook(verse.book);
                                    setSelectedChapter(Number(verse.chapter));
                                  }}
                                  className="border-2"
                                >
                                  Go to Chapter
                                </Button>
                              </div>
                              <p className="font-serif leading-relaxed text-foreground">
                                {verse.text}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                      </>
                    )}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookmarks" className="space-y-6">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-foreground">My Bookmarks</CardTitle>
            </CardHeader>
            <CardContent>
              {!bookmarks || bookmarks.length === 0 ? (
                <div className="py-12 text-center">
                  <Bookmark className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                  <p className="text-muted-foreground">No bookmarks yet</p>
                  <p className="text-sm text-muted-foreground">
                    Bookmark verses while reading to save them here
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[calc(100vh-350px)]">
                  <div className="space-y-4 pr-4">
                    {bookmarks.map((bookmark, idx) => (
                      <Card key={idx} className="border-2">
                        <CardContent className="p-4">
                          <div className="mb-2 flex items-center justify-between">
                            <Badge variant="outline">
                              {bookmark.verse.book} {Number(bookmark.verse.chapter)}:{Number(bookmark.verse.verse)}
                            </Badge>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedBook(bookmark.verse.book);
                                  setSelectedChapter(Number(bookmark.verse.chapter));
                                }}
                                className="border-2"
                              >
                                Go to Verse
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveBookmark(bookmark.verse)}
                              >
                                <BookmarkCheck className="h-4 w-4 text-primary" />
                              </Button>
                            </div>
                          </div>
                          <p className="mb-2 font-serif leading-relaxed text-foreground">
                            {bookmark.verse.text}
                          </p>
                          {bookmark.note && (
                            <>
                              <Separator className="my-2" />
                              <p className="text-sm italic text-muted-foreground">
                                Note: {bookmark.note}
                              </p>
                            </>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

