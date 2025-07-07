import { firestore } from "@/app/../../firebase/server";

interface CacheEntry<T> {
  cachedAt: number;
  data: T;
}

const CACHE_COLLECTION = "cache";
const DEFAULT_CACHE_DURATION = 1000 * 60 * 60 * 24 * 14;

export async function getCache<T>(
  key: string,
  duration: number = DEFAULT_CACHE_DURATION
): Promise<T | null> {
  try {
    const docRef = firestore!.collection(CACHE_COLLECTION).doc(key);
    const docSnap = await docRef.get();
    const now = Date.now();

    if (docSnap.exists) {
      const { cachedAt, data } = docSnap.data() as CacheEntry<T>;
      const isFresh = now - cachedAt < duration;

      if (isFresh) {
        console.log(`CACHE HIT: Found fresh data for key: ${key}`);
        return data;
      }
      console.log(`CACHE STALE: Data found but expired for key: ${key}`);
    } else {
      console.log(`CACHE MISS: No data found for key: ${key}`);
    }

    return null;
  } catch (error) {
    console.error(`Error getting cache for key "${key}":`, error);
    return null;
  }
}

export async function setCache<T>(key: string, data: T): Promise<void> {
  try {
    const docRef = firestore!.collection(CACHE_COLLECTION).doc(key);
    const cacheEntry: CacheEntry<T> = {
      cachedAt: Date.now(),
      data,
    };
    await docRef.set(cacheEntry);
    console.log(`CACHE SET: Successfully saved data for key: ${key}`);
  } catch (error) {
    console.error(`Error setting cache for key "${key}":`, error);
  }
}