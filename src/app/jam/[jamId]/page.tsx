import Canvas from "./_components/canvas";
import { Room } from "@/components/room";

interface PageProps {
  params: {
    jamId: string;
  };
}

export default function Jam({ params }: PageProps) {
  const jamId = params.jamId;

  return (
    <Room roomId={jamId}>
      <Canvas jamId={jamId} />
    </Room>
  );
}
