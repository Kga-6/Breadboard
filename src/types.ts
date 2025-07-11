// types.ts

// [ IMPORTS ] //

// [ USERS TYPES ] //
export interface UserTypes {
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
  onboarding: {
    profilePicture: boolean;
    username: boolean;
  };
  bibleRoom: {
    invited: string [],
    sharing: boolean,
  },
  biblePersonalization: {},//Record<string, Record<string, Record<string, Record<string, string>>>>
  lastSeen?: FirebaseFirestore.Timestamp;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}