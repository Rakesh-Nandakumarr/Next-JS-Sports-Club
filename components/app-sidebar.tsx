"use client";

import * as React from "react";
import {
  ArrowUpCircleIcon,
  BarChartIcon,
  CameraIcon,
  ClipboardListIcon,
  DatabaseIcon,
  FileCodeIcon,
  FileIcon,
  FileTextIcon,
  FolderIcon,
  HelpCircleIcon,
  LayoutDashboardIcon,
  ListIcon,
  SearchIcon,
  SettingsIcon,
  UsersIcon,
  Volleyball,
  CalendarIcon,
} from "lucide-react";

import { NavGroup } from "@/components/nav-group";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import dynamic from "next/dynamic";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: LayoutDashboardIcon,
    },
    {
      title: "Sports",
      url: "/admin/sports",
      icon: BarChartIcon,
    },
    {
      title: "Teams",
      url: "/admin/teams",
      icon: FolderIcon,
    },
    {
      title: "Players",
      url: "/admin/players",
      icon: UsersIcon,
    },
    {
      title: "Events",
      url: "/admin/events",
      icon: CalendarIcon,
    },
    {
      title: "Blogs",
      url: "/admin/blogs",
      icon: FileTextIcon,
    },
  ],

  navSecondary: [
    // {
    //   title: "Settings",
    //   url: "#",
    //   icon: SettingsIcon,
    // },
    // {
    //   title: "Get Help",
    //   url: "#",
    //   icon: HelpCircleIcon,
    // },
    // {
    //   title: "Search",
    //   url: "#",
    //   icon: SearchIcon,
    // },
  ],
  // dynamicData: [
  //   {
  //     name: "Form Configurations",
  //     url: "/admin/form-configurations",
  //     icon: FileCodeIcon,
  //   }
  // ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <Volleyball />
                <span className="text-base font-semibold">
                  Ceylon Sport Club
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavGroup items={data.dynamicData} title={'Dynamic Data'} /> */}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        {/* <NavUser user={data.user} /> */}
      </SidebarFooter>
    </Sidebar>
  );
}
