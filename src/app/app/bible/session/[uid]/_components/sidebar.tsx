import { UserTypes } from "@/types";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, BotIcon, MessageCircle, SettingsIcon, BookOpen, Notebook } from "lucide-react";

interface ParticipantTypes {
  uid: string;
  info: {
    // Example properties, for useSelf, useUser, useOthers, etc.
    name: string;
    username: string
    avatar: string;
  };
};

export default function Sidebar({
  sideSelected,
  handleSideSelected,
  userData,
  uid,
  participants,
  isLiveblocksConnected
}: {
  sideSelected: "Settings" | "Chat" | "AI" | "Participants" | "Notes" | null;
  handleSideSelected: (side: "Settings" | "Chat" | "AI" | "Participants" | "Notes" | null) => void;
  userData: UserTypes;
  uid: string;
  participants: ParticipantTypes[];
  isLiveblocksConnected: boolean;
}) {
  return (
    <>
      <div className="mb-4">
        {sideSelected === "Settings" && (
          <div className="w-[300px] h-full border border-gray-200 rounded-lg mx-4 p-2">
            <header className="flex justify-between items-center border-b border-gray-200 pb-2">
              <h1 className="text-lg font-medium ml-2">Settings</h1>
              <Button className="rounded-full h-12 w-12" variant="ghost" onClick={() => handleSideSelected(null)}><X style={{width: "20px", height: "20px"}} /></Button>
            </header>
          </div>
        )}
        {sideSelected === "Participants" &&  userData && (userData.bibleRoom.sharing || userData.uid != uid) && participants.length > 0 && (
          <div className="w-[300px] h-full border border-gray-200 rounded-lg mx-4 p-2">
            <header className="flex justify-between items-center border-b border-gray-200 pb-2 mb-4">
              <h1 className="text-lg font-medium ml-2">Participants</h1>
              <Button className="rounded-full h-12 w-12" variant="ghost" onClick={() => handleSideSelected(null)}><X style={{width: "20px", height: "20px"}} /></Button>
            </header>
            <div className="flex flex-col gap-2">
              {participants.length > 0 && participants.map((participant) => (
                <div key={participant.info?.username} className="flex items-center gap-2">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={participant.info?.avatar || "/default-avatar.jpg"} className="object-cover" />
                    <AvatarFallback>{participant.info?.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span>{participant.info?.name} {participant.uid == userData.uid && "(You)"} {participant.uid === uid && participant.uid != userData.uid && "(Host)"}</span>
                    <span>@{participant.info?.username}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {sideSelected === "Notes" && (
          <div className="w-[300px] h-full border border-gray-200 rounded-lg mx-4 p-2">
            <header className="flex justify-between items-center border-b border-gray-200 pb-2">
              <h1 className="text-lg font-medium ml-2">Notes</h1>
              <Button className="rounded-full h-12 w-12" variant="ghost" onClick={() => handleSideSelected(null)}><X style={{width: "20px", height: "20px"}} /></Button>
            </header>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 h-full px-2">
        {userData && (userData.bibleRoom.sharing || userData.uid != uid) && isLiveblocksConnected && (
          <div >
            <Button className="rounded-full h-12 w-12" variant="ghost" onClick={() => handleSideSelected("Participants")}><Users style={{width: "24px", height: "24px"}} /></Button>
          </div>
        )}

        {userData && (userData.bibleRoom.sharing || userData.uid != uid) && isLiveblocksConnected && (
          <div >
            <Button className="rounded-full h-12 w-12" variant="ghost" onClick={() => handleSideSelected("Chat")}><MessageCircle style={{width: "24px", height: "24px"}} /></Button>
          </div>
        )}
        
        <div >
          <Button className="rounded-full h-12 w-12" variant="ghost" onClick={() => handleSideSelected("AI")}><BotIcon style={{width: "24px", height: "24px"}} /></Button>
        </div>

        <div >
          <Button className="rounded-full h-12 w-12" variant="ghost" onClick={() => handleSideSelected("AI")}><BookOpen style={{width: "24px", height: "24px"}} /></Button>
        </div>

        <div >
          <Button className="rounded-full h-12 w-12" variant="ghost" onClick={() => handleSideSelected("Notes")}><Notebook style={{width: "24px", height: "24px"}} /></Button>
        </div>
        

        <div className="mr-2">
          <Button className="rounded-full h-12 w-12" variant="ghost" onClick={() => handleSideSelected("Settings")}><SettingsIcon style={{width: "24px", height: "24px"}} /></Button>
        </div>
      </div>
    </>
  )
}