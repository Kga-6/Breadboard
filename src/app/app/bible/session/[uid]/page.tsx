import BibleView from "@/components/BibleView";

async function fetchBibleData(path: string) {
  const API_KEY = process.env.BIBLE_API_KEY;
  if (!API_KEY) throw new Error("Missing BIBLE_API_KEY");

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
  const data = await response.json();
  return data.data;
}

export default async function BiblePage({ params, searchParams }: { params: { uid: string }, searchParams: { bibleId: string, bookId: string, chapterId: string } }) {
  const { uid } = await params

  // Get initial IDs from the URL
  const bibleId = await searchParams.bibleId || "de4e12af7f28f599-02";
  const bookId = await searchParams.bookId || "GEN";
  const chapterId = await searchParams.chapterId || "GEN.1";

  // Fetch ALL initial data in parallel on the server
  const [
    initialBibles,
    initialBooks,
    initialChapters,
    initialChapterContent
  ] = await Promise.all([
    fetchBibleData('bibles?ids=de4e12af7f28f599-02'),
    fetchBibleData(`bibles/${bibleId}/books`),
    fetchBibleData(`bibles/${bibleId}/books/${bookId}/chapters`),
    fetchBibleData(`bibles/${bibleId}/chapters/${chapterId}`)
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