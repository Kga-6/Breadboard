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
  import { useEffect, useState } from "react"
  import { useAuth } from "@/app/context/AuthContext";
  import { Loader2 } from "lucide-react";

  export default function UsernameEdit({ username, updateUserProfile, setShowUsernameEdit, showUsernameEdit }: { username: string, updateUserProfile: (payload: { newUsername: string }) => void, setShowUsernameEdit: (show: boolean) => void, showUsernameEdit: boolean }) {
    
    const { checkUsernameAvailability } = useAuth();
    const [value, setValue] = useState<string | ''>(username);
    const [isLoading, setIsLoading] = useState(false);

    // State for real-time validation
    const [isChecking, setIsChecking] = useState(false);
    const [availability, setAvailability] = useState<{ status: 'idle' | 'available' | 'taken' | 'invalid' | 'error'; message: string; }>({ status: 'idle', message: '' });

    const handleSaveChanges = async (e: React.FormEvent) => {
      e.preventDefault();
      await updateUserProfile({ newUsername: value });
      setIsLoading(false);
      setShowUsernameEdit(false);
    }

    // Debounce effect for username checking
    useEffect(() => {
      // Don't check if the username is the same as the initial one
      if (value === username) {
          setAvailability({ status: 'idle', message: '' });
          return;
      }

      const handler = setTimeout(async () => {
          if (value.length < 3) {
              setAvailability({ status: 'invalid', message: 'Username must be at least 3 characters.' });
              return;
          }
          if (!/^[a-zA-Z0-9_]+$/.test(value)) {
              setAvailability({ status: 'invalid', message: 'Only letters, numbers, and underscores.' });
              return;
          }

          setIsChecking(true);
          try {
              const isAvailable = await checkUsernameAvailability(value);
              if (isAvailable) {
                  setAvailability({ status: 'available', message: 'Username is available!' });
              } else {
                  setAvailability({ status: 'taken', message: 'This username is already taken.' });
              }
          } catch (error) {
              setAvailability({ status: 'error', message: 'Could not verify username.' });
          } finally {
              setIsChecking(false);
          }
      }, 500); // Wait 500ms after the user stops typing

      // Cleanup function
      return () => {
          clearTimeout(handler);
      };
    }, [value, username, checkUsernameAvailability]);

    return (
      <Dialog open={showUsernameEdit} onOpenChange={setShowUsernameEdit}>
        <form onSubmit={handleSaveChanges}>
          <DialogTrigger asChild>
            <Button variant="ghost">Edit</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Username</DialogTitle>
              <DialogDescription>
                This is your Breadboard username. It will be used to identify you on Breadboard.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-3">
                {/* <Label htmlFor="name-1">Username</Label> */}
                <div className="relative">
                  <Input id="name-1" name="name" value={value} onChange={(e) => setValue(e.target.value)} autoComplete="off" />
                  {isChecking && <Loader2 className="animate-spin w-4 h-4 absolute right-2 top-2.5 text-gray-400" />}
                </div>
              </div>
              {availability.status !== 'idle' && (
                <p className={`text-sm ${
                  availability.status === 'available' ? 'text-green-600' :
                  availability.status === 'taken' || availability.status === 'invalid' ? 'text-red-600' :
                  'text-gray-500'
                }`}>
                  {availability.message}
                </p>
              )}
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