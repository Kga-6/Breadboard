"use client"

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
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useState, useRef } from "react"

export default function DisplayNameEdit({ displayName, updateUserProfile, setShowDisplayNameEdit, showDisplayNameEdit }: { displayName: string, updateUserProfile: (payload: { name: string }) => void, setShowDisplayNameEdit: (show: boolean) => void, showDisplayNameEdit: boolean }) {
  
  const [value, setValue] = useState<string | ''>(displayName);
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    await updateUserProfile({ name: value });
    setIsLoading(false);
    setShowDisplayNameEdit(false);
  }

  return (
    <Dialog open={showDisplayNameEdit} onOpenChange={setShowDisplayNameEdit}>
      <form onSubmit={handleSaveChanges}>
        <DialogTrigger asChild>
          <Button variant="ghost">Edit</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Display Name</DialogTitle>
            <DialogDescription>
              This is how you will appear to others on Breadboard. Choose a name your friends will recognize you by, such as your real name.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              {/* <Label htmlFor="name-1">Display Name</Label> */}
              <Input id="name-1" name="name" value={value} onChange={(e) => setValue(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" >Cancel</Button>
            </DialogClose>
            <Button type="submit" onClick={handleSaveChanges} disabled={isLoading}>{isLoading ? 'Saving...' : 'Save changes'}</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog> 
  )
}