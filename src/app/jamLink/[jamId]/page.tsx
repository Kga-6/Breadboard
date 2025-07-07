import Canvas from "./_components/canvas";
import { Room } from "@/components/room";

export default function JamLink({
  params,
}: {
  params: { jamId: string };
}) {
  return (
    <Room roomId={params.jamId}>
      <Canvas jamId={params.jamId} />
    </Room>
  );
}