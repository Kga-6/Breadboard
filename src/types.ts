// types.ts

// [ IMPORTS ] //

// [ USERS TYPES ] //
export interface UserTypes {
  // update firebase functions index.ts too
  uid?: string;
  name: string | null;
  email: string | null;
  username: string | null;
  usernameLower: string | null;
  completed_onboarding: boolean;
  isPro?: boolean;
  profilePictureUrl: string | null;
  online?: boolean;
  dob: string;
  isTesting: boolean;
  dobChangeCount: number | null | undefined;
  gender: string | null;
  language: string | null;
  // update firebase functions index.ts too
  onboarding: {
    profilePicture: boolean;
    username: boolean;
  };
  bibleRoom: {
    invited: string [],
    sharing: boolean,
  },
  biblePersonalization: Record<string, Record<string, Record<string, Record<string, string>>>>; // User highlights, notes
  readerSettings: {
    font: string;
    fontSize: string;
    numbersAndTitles: boolean;
  };
  lastSeen?: FirebaseFirestore.Timestamp;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
  // update firebase functions index.ts too
}

// [ FRIENDS TYPES ] //

export interface FriendTypes {
  id: string;
  name: string;
  username: string;
  online: boolean;
  photoURL: string | null;
}

export interface FriendRequestTypes extends FriendTypes {
  from: string;
}

// [ JAMS TYPES ] //
export interface JamTypes {
  id: string;
  title: string;
  authorId: string;
  authorUsername?: string;
  lastModified: FirebaseFirestore.Timestamp;
}

// [ BIBLE TYPES ] //
export interface BibleTypes {
  id: string;
  dblId: string;
  abbreviation: string;
  abbreviationLocal: string;
  copyright: string;
  name: string;
  nameLocal: string;
  description: string;
  descriptionLocal: string;
  info: string;
  type: string;
  relatedDbl: string;
  language: {
    id: string;
  };
}

export interface BookTypes {
  id: string;
  bibleId: string;
  abbreviation: string;
  name: string;
  nameLong: string;
  chapters: ChapterSummaryTypes[];
}

export interface ChapterTypes {
  id: string;
  bibleId: string;
  number: string;
  bookId: string;
  reference: string;
  content: string;
  verseCount: number;
  previous?: ChapterRefTypes;
  next?: ChapterRefTypes;
  copyright?: string;
}

export interface ChapterRefTypes {
  id: string;
  bookId: string;
  reference: string;
}

export interface ChapterSummaryTypes {
  id: string;
  bibleId: string;
  number: string;
  bookId: string;
  reference: string;
}