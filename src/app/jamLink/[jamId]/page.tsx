import Canvas from "./_components/canvas";
import { Room } from "@/components/room";

export default async function JamLink({
  params,
}: {
  params: Promise<{ jamId: string }>;
}) {
  const { jamId } = await params;
  
  return (
    <Room roomId={jamId}>
      <Canvas jamId={jamId} />
    </Room>
  );
}