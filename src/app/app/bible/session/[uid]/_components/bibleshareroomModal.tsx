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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { UserRoundPlusIcon } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function BibleShareRoomModal() {
  const router = useRouter();
  const { userData, friends, setBibleRoomSharing, manageBibleRoomInvite } = useAuth();
  const [isCopied, setIsCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [popoverOpen, setPopoverOpen] = useState(false);

  const handleToggleSharing = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      await setBibleRoomSharing(e.target.checked);
    } catch (error) {
      console.error("Failed to update sharing status:", error);
      // Optionally show an error message to the user
    }
  };

  const handleInviteAction = async (friendId: string, action: 'invite' | 'uninvite') => {
    try {
      await manageBibleRoomInvite(friendId, action);
    } catch (error) {
      console.error(`Failed to ${action} friend:`, error);
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  const filteredFriends = friends.filter(friend =>
    friend.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
          <Button className="rounded-full " variant="outline">Share</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-medium">Share Bible Room</DialogTitle>
          </DialogHeader>

          <div className="flex items-center justify-between p-3 border-1 border-gray-200 rounded-lg ">
            <span className="font-semibold">Allow access</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={userData?.bibleRoom.sharing || false} 
                onChange={handleToggleSharing}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="w-full">
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen} >
              <PopoverTrigger asChild>
                <input
                  type="text"
                  placeholder="Add friends..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPopoverOpen(true);
                  }}
                  className={`w-full p-2 border rounded-md ${popoverOpen ? "border-blue-500" : "border-gray-200"}`}
                  style={{width: "100%"}}
                />
              </PopoverTrigger>
              <PopoverContent
                className="flex flex-col bg-amber-100  overflow-hidden p-0"
                align="start"
                onInteractOutside={() => setPopoverOpen(false)}
                style={{ minWidth: 'var(--radix-popover-trigger-width)' }}

              >
                <div className="flex-1 w-full bg-blue-50">
                  {filteredFriends.length > 0 ? filteredFriends.slice(0, 5).map((friend) => {
                    const isInvited = userData?.bibleRoom.invited.includes(friend.id) || false;
                    return (
                      <div key={friend.id} className="flex items-center justify-between p-2 rounded-md ">
                        <div className="flex items-center">
                          <Image
                            src={friend.photoURL || "/default-avatar.jpg"}
                            alt={friend.username}
                            className="w-10 h-10 rounded-full mr-3 object-cover"
                            width={40}
                            height={40}
                          />
                          <div className="flex flex-col">
                            <span className="font-medium">{friend.name}</span>
                            <span className="text-sm text-gray-500">@{friend.username}</span>
                          </div>
                        </div>
                        <Button 
                          variant="outline"
                          onClick={() => handleInviteAction(friend.id, isInvited ? 'uninvite' : 'invite')}
                          className={`px-3 py-1 text-sm rounded-full  ${!isInvited &&  'bg-blue-500 hover:bg-blue-600 text-white'}`}
                        >
                          {isInvited ? 'Remove' : 'Invite'}
                        </Button>
                      </div>
                    );
                  }) : 
                  <div className="text-gray-500 p-2">
                    <div className="flex items-center justify-between h-full px-2">
                      <span className="text-gray-500">No friends found</span>
                      <Button variant="outline" onClick={() => router.push('/app/friends')} className="px-3 py-1 text-sm rounded-full ">Add Friends</Button>
                    </div>
                  </div>}
                </div>
              </PopoverContent>
            </Popover>

            
          </div>

          <div>
            <h1 className="text-lg font-medium mb-4">People with access</h1>
            <div className="flex flex-col gap-4 ">
              {userData?.bibleRoom.invited.map((friendId) => {
                const friend = friends.find(f => f.id === friendId);
                return (
                  <div key={friendId} className="flex items-center justify-between  rounded-md">
                    <div className="flex items-center">
                      <Image
                        src={friend?.photoURL || "/default-avatar.jpg"}
                        alt={friend?.username || ""}
                        className="w-10 h-10 rounded-full mr-3 object-cover"
                        width={40}
                        height={40}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">{friend?.name}</span>
                        <span className="text-sm text-gray-500">@{friend?.username}</span>
                      </div>
                    </div>
                    <Button variant="outline" onClick={() => handleInviteAction(friendId, 'uninvite')} className="px-3 py-1 text-sm rounded-full ">Remove</Button>
                  </div>
                )
              })}
            </div>
          </div>

          <DialogFooter>
            <div className="flex w-full justify-between">
              <Button variant="outline" onClick={handleCopyLink}>{isCopied ? "Copied" : "Copy Link"}</Button>
              <DialogClose asChild>
                <Button variant="outline" type="submit">Done</Button>
              </DialogClose>
            </div>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog> 
  )
}