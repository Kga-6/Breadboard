import { Metadata } from "next"
import Canvas from "./_components/canvas";

interface JamPageProps {
  params: {
    jamId: string
  }
}

export default async function Jam({params}: JamPageProps){
    const jamId = (await params).jamId
    return (
      <Canvas jamId={jamId}/>
    )
}