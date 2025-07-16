import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar";

export default function DashboardLayout({children}: {children: React.ReactNode}) {
  return (
    <SidebarProvider>
      <AppSidebar side="left" />
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}