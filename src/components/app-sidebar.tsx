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
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Home, Book, Users, BookOpen, Play } from "lucide-react"
import { ProfileDropdownMenu } from "@/components/ProfileDropdownMenu"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"
import { useEffect } from "react"


export function AppSidebar() {

  const { userData } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isActive = (url: string) => pathname === url;
  const { state } = useSidebar()

  useEffect(() => {
    console.log(state)
  }, [state])

  const items = [
    // {
    //   title: "Home",
    //   url: "/app/home",
    //   icon: Home,
    // },
    {
      title: "Bible",
      url: `/app/bible/session/${userData?.uid}`,
      icon: Book,
    },
    {
      title: "Play",
      url: "/app/play",
      icon: Play,
    },
    {
      title: "Friends",
      url: "/app/friends",
      icon: Users,
    },
    // {
    //   title: "Jams",
    //   url: "/app/jam",
    //   icon: BookOpen,
    // },
  ]

  return (
    <Sidebar collapsible="icon">

      <SidebarHeader>

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="hover:bg-transparent" disabled={true} asChild>
              <div className="flex items-center px-2 ">
                {state === "collapsed" ? (
                  <Link href="/" className="text-2xl font-bold">B</Link>
                ) : (
                  <Link href="/" className="text-2xl font-bold">Breadboard</Link>
                )}
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
                  <SidebarMenuButton onClick={() => router.push(item.url)} tooltip={item.title} asChild>
                    <a className={`mb-2 ${isActive(item.url) ? "bg-muted" : ""}`}>
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
          <SidebarContent className="flex flex-col items-center justify-between">
            <div className={`flex ${state === "collapsed" ? "flex-col gap-2" : "flex-row gap-2"} items-center justify-between w-full `}>
              <ProfileDropdownMenu/>
              <SidebarTrigger />
            </div>
          </SidebarContent>
        ) : (
          (<Skeleton className="h-[40px] w-full rounded-md" />)
        )}
      </SidebarFooter>

    </Sidebar>
  )
}