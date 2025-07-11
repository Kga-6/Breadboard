import Nav from "../_components/Nav";

export default function Notifications() {
  return (
    <div className="p-4 w-[950px] mx-auto dark:bg-[#1a1a1e] flex flex-row gap-4">
      <Nav />
      <div className="flex-1">
        <h1>Notifications</h1>
      </div>
    </div>
  );
}