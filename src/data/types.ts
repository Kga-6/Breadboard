import {
    Timestamp,
  } from "firebase/firestore";

export type UserType = {
    uid?: string;
    name: string | null;
    email: string | null;
    username: string | null;
    usernameLower: string | null;
    completed_onboarding: boolean;
    isPro?: boolean;
    profilePictureUrl: string | null;
    lastSeen?: Timestamp;
    online?: boolean;
    dob: string;
    dobChangeCount: number | null | undefined;
    bibleRoom: {
      invited: string [],
      sharing: boolean,
    },
    biblePersonalization: Record<string, Record<string, Record<string, Record<string, string>>>>
  };