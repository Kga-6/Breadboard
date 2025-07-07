import DashNav from "@/components/DashNav";
import DashHeader from "@/components/DashHeader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col">
      {/* Fixed Header */}
      {/* <div className="h-14 shrink-0">
        <DashHeader />
      </div> */}

      {/* Main layout area below header */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-white shrink-0">
          <DashNav />
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-auto p-4">
          {children}
        </div>
      </div>
    </div>
  )
}
