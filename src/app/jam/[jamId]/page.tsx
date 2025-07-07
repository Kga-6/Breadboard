import Canvas from "./_components/canvas";
import { Room } from "@/components/room";

interface JamPageProps {
  params: {
    jamId: string
  }
}

export default function Jam({params}: JamPageProps){
  const jamId = params.jamId;

  return (
    <Room roomId={jamId}>
      <Canvas jamId={jamId}/>
    </Room>
  )
}