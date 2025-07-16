"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button";
import { ChevronDownIcon } from "lucide-react";
import { FaMoon, FaSun, FaDesktop } from "react-icons/fa";

export default function Personal() {

  const { userData, updateUserProfile } = useAuth();

  const [open, setOpen] = useState(false)

  const [dob, setDob] = useState<string | undefined>(userData?.dob || undefined);
  const [gender, setGender] = useState<string | undefined>(userData?.gender || "Select gender")
  const [language, setLanguage] = useState<string | undefined>(userData?.language || "Select language")
  const { setTheme, theme } = useTheme()

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

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
      // Personal
      setGender(userData.gender || 'Select gender');
      setLanguage(userData.language || 'Select language');
    }
  }, [userData, message]);
  
  return (
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
          <p className="text-[15px] ">
            {mounted ? (theme ? theme.charAt(0).toUpperCase() + theme.slice(1) : "Select theme") : ""}
          </p>
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
  );
}