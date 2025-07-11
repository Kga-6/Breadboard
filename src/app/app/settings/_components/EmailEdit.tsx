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
import { useState } from "react"

export default function EmailEdit({ email, updateUserProfile, setShowEmailEdit, showEmailEdit }: { email: string, updateUserProfile: (payload: { newEmail: string }) => void, setShowEmailEdit: (show: boolean) => void, showEmailEdit: boolean }) {
  const [value, setValue] = useState<string | ''>(email);
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUserProfile({ newEmail: value });
    setIsLoading(false);
    setShowEmailEdit(false);
  }

  return (
    <Dialog open={showEmailEdit} onOpenChange={setShowEmailEdit}>
      <form onSubmit={handleSaveChanges}>
        <DialogTrigger asChild>
          <Button variant="ghost">Edit</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Email</DialogTitle>
            <DialogDescription>
              This is your Breadboard email. It will be used to identify you on Breadboard.
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
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" onClick={handleSaveChanges} disabled={isLoading}>{isLoading ? 'Saving...' : 'Save changes'}</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog> 
  )
}