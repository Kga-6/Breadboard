import BibleView from "./_components/bible";
import { getCache, setCache } from "@/utils/appcache";
import { BibleTypes, BookTypes, ChapterRefTypes, ChapterTypes } from "@/types";

interface CacheEntry {
  cachedAt: number;
  data: BibleTypes | BookTypes | ChapterRefTypes | ChapterTypes;
}

async function fetchBibleData(path: string, cacheKey?: string) {
  const API_KEY = process.env.BIBLE_API_KEY;
  if (!API_KEY) throw new Error("Missing BIBLE_API_KEY");

  if (cacheKey) {
    const cachedData = await getCache(cacheKey) as CacheEntry;
    if (cachedData) return cachedData.data;
  }

  const url = `https://api.scripture.api.bible/v1/${path}`;
  const response = await fetch(url, {
    headers: { 'api-key': API_KEY },
    // Use Next.js's built-in caching for performance
    next: { revalidate: 3600 }, // Cache for 1 hour
  });

  if (!response.ok) {
    console.error(`Failed to fetch: ${url}`);
    return null; // Handle errors gracefully
  }

  const data = (await response.json());

  if (cacheKey) {
    setCache(cacheKey, data);
  }

  return data.data;
}

export default async function BiblePage({ params, searchParams }: { params: Promise<{ uid: string }>, searchParams: Promise<{ bibleId: string, bookId: string, chapterId: string }> }) {
  const { uid } = await params
  const resolvedSearchParams = await searchParams

  // Get initial IDs from the URL
  const bibleId = resolvedSearchParams.bibleId || "de4e12af7f28f599-02";
  const bookId = resolvedSearchParams.bookId || "GEN";
  const chapterId = resolvedSearchParams.chapterId || "GEN.1";

  // Fetch ALL initial data in parallel on the server
  const [
    initialBibles,
    initialBooks,
    initialChapters,
    initialChapterContent
  ] = await Promise.all([
    fetchBibleData('bibles?ids=de4e12af7f28f599-02'),
    fetchBibleData(`bibles/${bibleId}/books`, `bible_${bibleId}_books`),
    fetchBibleData(`bibles/${bibleId}/books/${bookId}/chapters`, `bible_${bibleId}_books_${bookId}_chapters`),
    fetchBibleData(`bibles/${bibleId}/chapters/${chapterId}`, `bible_${bibleId}_chapters_${chapterId}`)
  ]);

  // Pass the server-fetched data as props to the Client Component
  return (
    <BibleView
      uid={uid}
      initialBibles={initialBibles || []}
      initialBooks={initialBooks || []}
      initialChapters={initialChapters || []}
      initialChapter={initialChapterContent}
      initialBibleId={bibleId}
      initialBookId={bookId}
      initialChapterId={chapterId}
    />
  );
}