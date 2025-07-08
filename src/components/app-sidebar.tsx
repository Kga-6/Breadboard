"use client"
import { useAuth } from "@/app/context/AuthContext"
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarRail,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar"
import { Home, Book, Users, BookOpen } from "lucide-react"
import { ProfileDropdownMenu } from "@/components/ProfileDropdownMenu"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"


export function AppSidebar() {

  const { userData } = useAuth();
  const pathname = usePathname();

  const isActive = (url: string) => pathname === url;
  const { isMobile } = useSidebar()

  const items = [
    {
      title: "Home",
      url: "/app/home",
      icon: Home,
    },
    {
      title: "Bible",
      url: `/app/bible/${userData?.uid}`,
      icon: Book,
    },
    {
      title: "Friends",
      url: "/app/friends",
      icon: Users,
    },
    {
      title: "Jams",
      url: "/app/jam",
      icon: BookOpen,
    },
  ]

  return (
    <Sidebar collapsible="icon">

      <SidebarHeader>

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="hover:bg-transparent" disabled={true} asChild>
              <div className="flex items-center px-2 ">
                <Link href="/" className="text-2xl font-bold">Breadboard</Link>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton tooltip={item.title} asChild>
                    <a className={`mb-2 ${isActive(item.url) ? "bg-muted" : ""}`} href={item.url}>
                      <item.icon />
                      <span className="text-lg font-semibold">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="mb-2">
        {userData ? (
          <ProfileDropdownMenu/>
        ) : (
          (<Skeleton className="h-[40px] w-full rounded-md" />)
        )}
      </SidebarFooter>

    </Sidebar>
  )
}