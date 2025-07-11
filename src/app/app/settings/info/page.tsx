"use client"

import { useAuth } from "@/app/context/AuthContext";
import Nav from "../_components/Nav";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit, ChevronDownIcon  } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useRef } from "react";
import { FaMoon, FaSun, FaDesktop } from "react-icons/fa";

// import Calendar from "../_components/Calendar"
import DisplayNameEdit from "../_components/DisplayNameEdit"
import UsernameEdit from "../_components/UsernameEdit"
import EmailEdit from "../_components/EmailEdit"
import PasswordEdit from "../_components/PasswordEdit"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "next-themes";

export default function Settings() {
  const {currentUser, userData, updateUserProfile, sendVerificationEmail, sendPasswordReset } = useAuth();

  const [open, setOpen] = useState(false)
  const [showDisplayNameEdit, setShowDisplayNameEdit] = useState(false)
  const [showUsernameEdit, setShowUsernameEdit] = useState(false)
  const [showEmailEdit, setShowEmailEdit] = useState(false)


  // Account
  const [displayName, setDisplayName] = useState<string | ''>(userData?.name || '');
  const [username, setUsername] = useState<string | ''>(userData?.username || '');
  const [email, setEmail] = useState<string | "">(currentUser?.email || '');
  const [dob, setDob] = useState<string | undefined>(userData?.dob || undefined);

  // Personal
  const [gender, setGender] = useState<string | undefined>(userData?.gender || "Select gender")
  const [language, setLanguage] = useState<string | undefined>(userData?.language || "Select language")
  const { setTheme, theme } = useTheme()

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 2. Add state for the verification email message
  const [verificationMessage, setVerificationMessage] = useState('');


  // 3. Create a handler to send the verification email
  const handleSendVerification = async () => {
    // Reset message and disable button while sending
    setVerificationMessage('Sending...'); 
    try {
      await sendVerificationEmail();
      setVerificationMessage('A new verification email has been sent. Please check your inbox.');
    } catch (error) {
      console.error("Failed to send verification email:", error);
      setVerificationMessage('Failed to send email. Please try again in a moment.');
    }
  };

  const handleSendResetEmail = async () => {
    if (!currentUser?.email) {
      setMessage({ type: 'error', text: 'No email found for this user.' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      await sendPasswordReset(currentUser.email);
      setMessage({ type: 'success', text: 'Password reset email sent! Please check your inbox.' });
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Failed to send reset email. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // VALIDATION: Check if the file type starts with "image/"
      if (!file.type.startsWith("image/")) {
        setMessage({ type: 'error', text: 'Invalid file type. Please select an image.' });
        return; // Stop the function here
      }

      setMessage(null);
      setIsSubmitting(true);
      try {
          await updateUserProfile({ photoFile: file });
          setMessage({ type: 'success', text: 'Profile picture updated!' });
      } catch (error: unknown) {
          setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to upload image.' });
      } finally {
          setIsSubmitting(false);
      }
  };

  const handleGenderChange = (gender: string) => {
    setGender(gender);
    updateUserProfile({ newGender: gender });
  }

  const handleLanguageChange = (language: string) => {
    setLanguage(language);
    updateUserProfile({ newLanguage: language });
  }

  const handleDobChange = (date: Date) => {
    // Format the date to "YYYY-MM-DD"
    const formattedDate = date.toISOString().split('T')[0];
    setDob(formattedDate);
    updateUserProfile({ dob: formattedDate });
  }

  useEffect(() => {
    if (userData) {
      // Account
      setDisplayName(userData.name || '');
      setUsername(userData.username || '');
      setEmail(userData.email || '');
      setDob(userData.dob || '');

      // Personal
      setGender(userData.gender || 'Select gender');
      setLanguage(userData.language || 'Select language');
    }
  }, [userData, message]);
  
  return (
    <div className="p-4 w-[950px] mx-auto dark:bg-[#1a1a1e] flex flex-row gap-8 min-h-screen mt-16">
      <Nav />
      <div className="flex-1">
        <div className="flex flex-row justify-between mb-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-black dark:text-white">My Profile</h1>
            <p className="text-gray-500">Manage your account details and preferences.</p>
          </div>

          <div className="relative">
            <Avatar className="w-24 h-24" onClick={() => fileInputRef.current?.click()}>
              <AvatarImage className="object-cover" src={userData?.profilePictureUrl || "/default-avatar.jpg"} />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <input type="file" accept="image/*" onChange={handleProfilePictureChange} ref={fileInputRef} className="hidden" />
            <Edit className="w-7 h-7 absolute bottom-0 right-0 bg-white rounded-full p-1" onClick={() => fileInputRef.current?.click()} />
          </div>
        </div>

        <div className="mb-4">
          <h1 className="text-2xl font-bold text-black dark:text-white border-b-1 border-gray-200 pb-4 ">Account</h1>
          <div className="flex flex-row justify-between items-center py-4 border-b-1 border-gray-200">
            <div>
              <p className="text-[15px] font-medium mb-1">Display Name</p>
              <p className="text-[15px] ">{displayName}</p>
            </div>
            <DisplayNameEdit displayName={displayName} updateUserProfile={updateUserProfile} setShowDisplayNameEdit={setShowDisplayNameEdit} showDisplayNameEdit={showDisplayNameEdit} />
          </div>
          <div className="flex flex-row justify-between items-center py-4 border-b-1 border-gray-200">
            <div>
              <p className="text-[15px] font-medium mb-1">Username</p>
              <p className="text-[15px] ">{username}</p>
            </div>
            <UsernameEdit username={username} updateUserProfile={updateUserProfile} setShowUsernameEdit={setShowUsernameEdit} showUsernameEdit={showUsernameEdit} />
          </div>
          <div className="flex flex-row justify-between items-center py-4 border-b-1 border-gray-200">
            <div>
              <p className="text-[15px] font-medium mb-1">Email</p>
              <p className="text-[15px] ">{email}</p>
            </div>
            <div className="flex flex-row gap-2">
              {currentUser?.emailVerified === false ? (
                  <Button onClick={handleSendVerification} variant="outline" className="w-24">
                    Verify
                  </Button>
              ) : (
                  <Button variant="outline" className="w-24" disabled>
                    Verified
                  </Button>
              )}
              <EmailEdit email={email} updateUserProfile={updateUserProfile} setShowEmailEdit={setShowEmailEdit} showEmailEdit={showEmailEdit} />
            </div>
          </div>
          <div className="flex flex-row justify-between items-center py-4">
            <div>
              <p className="text-[15px] font-medium mb-1">Password</p>
              <p className="text-[15px] ">Receive a password reset email</p>
            </div>
            <Button onClick={handleSendResetEmail} variant="ghost"  disabled={isLoading}>
              {isLoading ? "Sending..." : "Send"}
            </Button>
          </div>
        </div>

        <div className="mb-4">
          <h1 className="text-2xl font-bold text-black dark:text-white border-b-1 border-gray-200 pb-4">Personal</h1>
          <div className="flex flex-row justify-between items-center py-4 border-b-1 border-gray-200">
            <div>
              <p className="text-[15px] font-medium mb-1">Date of Birth</p>
              <p className="text-[15px] ">{dob ? dob : "Select date"}</p>
            </div>
            {(userData?.dobChangeCount || 0) < 2 && (
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    id="date"
      
                  >
                    {dob ? dob : "Select date"}
                    <ChevronDownIcon />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dob ? new Date(dob) : undefined}
                    captionLayout="dropdown"
                    onSelect={(date) => {
                      if (date) {
                        handleDobChange(date);
                      }
                      setOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            )}
            
          </div>
          <div className="flex flex-row justify-between items-center py-4 border-b-1 border-gray-200">
            <div>
              <p className="text-[15px] font-medium mb-1">Gender</p>
              <p className="text-[15px] ">{gender}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" >
                  {gender ? gender : "Select gender"}
                  <ChevronDownIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleGenderChange("Male")}>Male</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleGenderChange("Female")}>Female</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex flex-row justify-between items-center py-4 border-b-1 border-gray-200">
            <div>
              <p className="text-[15px] font-medium mb-1">Language</p>
              <p className="text-[15px] ">{language}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" >
                  {language ? language : "Select Language"}
                  <ChevronDownIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleLanguageChange("English")}>English</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleLanguageChange("Spanish")}>Spanish</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleLanguageChange("French")}>French</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex flex-row justify-between items-center py-4">
            <div>
              <p className="text-[15px] font-medium mb-1">Theme</p>
              <p className="text-[15px] ">{theme ? theme.charAt(0).toUpperCase() + theme.slice(1) : "Select theme"}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" >
                  Change
                  <ChevronDownIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  <FaSun />
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  <FaMoon />
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  <FaDesktop />
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

      </div>
    </div>
  );
}