import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

import { CaseUpper, CaseSensitive } from "lucide-react";
import { UserTypes } from "@/types";

export default function ReaderSettings({
  userData,
  updateReaderSettings
}: {
  userData: UserTypes;
  updateReaderSettings: (settings: { fontSize: string; font: string; numbersAndTitles: boolean }) => Promise<void>;
}) {

  const handleReaderSettingsChange = async (type: 'fontSize' | 'font' | 'numbersAndTitles', value: string | boolean) => {
    const newSettings = {
      ...userData?.readerSettings,
      [type]: value,
    };
    await updateReaderSettings(newSettings as { fontSize: string; font: string; numbersAndTitles: boolean });
  }     

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div>
          <Button className="rounded-full h-10 w-10" variant="outline"><CaseUpper /></Button>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80 mt-4">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="leading-none font-medium">Reader Settings</h4>
          </div>

          <div className="flex">
            <Button onClick={() => handleReaderSettingsChange('fontSize', '18')} variant="outline" className={`flex-1 rounded-none rounded-l-full h-[64px] ${userData?.readerSettings.fontSize === "18" ? 'bg-black text-white' : ''}`}><CaseSensitive style={{width: "20px", height: "20px"}}/></Button>
            <Button onClick={() => handleReaderSettingsChange('fontSize', '26')} variant="outline" className={`flex-1 rounded-none h-[64px] ${userData?.readerSettings.fontSize === "26" ? 'bg-black text-white' : ''}`}><CaseSensitive style={{width: "30px", height: "30px"}}/></Button>
            <Button onClick={() => handleReaderSettingsChange('fontSize', '30')} variant="outline" className={`flex-1 rounded-none rounded-r-full h-[64px] ${userData?.readerSettings.fontSize === "30" ? 'bg-black text-white' : ''}`}><CaseSensitive style={{width: "44px", height: "44px"}}/></Button>
          </div>

          <div className="flex">
            <Button onClick={() => handleReaderSettingsChange('font', 'Arial')} variant="outline" className={`flex-1 font-sans rounded-none rounded-l-full h-[44px] ${userData?.readerSettings.font === "Arial" ? 'bg-black text-white' : ''}`}>Arial</Button>
            <Button onClick={() => handleReaderSettingsChange('font', 'Times New Roman')} variant="outline" className={`flex-1 rounded-r-full h-[44px] font-serif ${userData?.readerSettings.font === "Times New Roman" ? 'bg-black text-white' : ''}`}>Times New Roman</Button>
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="numbersAndTitles" checked={userData?.readerSettings.numbersAndTitles} onCheckedChange={(checked) => handleReaderSettingsChange('numbersAndTitles', checked)} />
            <Label htmlFor="numbersAndTitles">Numbers and Titles</Label>
          </div>

        </div>
      </PopoverContent>
    </Popover>
  )
}