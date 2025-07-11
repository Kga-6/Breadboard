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
  
  export default function PasswordEdit() {
    return (
      <Dialog>
        <form>
          <DialogTrigger asChild>
            <Button variant="ghost">Edit</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Password</DialogTitle>
              <DialogDescription>
                Must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, and one number.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-3">
                <Label htmlFor="name-1">Current Password</Label>
                <Input id="name-1" name="name" defaultValue="********" />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="name-1">New Password</Label>
                <Input id="name-1" name="name" defaultValue="********" />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="name-1">Confirm New Password</Label>
                <Input id="name-1" name="name" defaultValue="********" />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </DialogContent>
        </form>
      </Dialog> 
    )
  }