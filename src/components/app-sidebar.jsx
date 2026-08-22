import * as React from "react";
import {
  Activity,
  FileText,
  HeartPulse,
  User2Icon,
  LayoutTemplate,
  ImageIcon,
  Grid,
  ShoppingBag,
  Shield,
  BarChart3,
  Quote,
  Tag,
  Megaphone,
  PhoneCall,
  Building2,
  Users,
  Database,
  Stethoscope,
} from "lucide-react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { DashboardIcon } from "@radix-ui/react-icons";
import { Config } from "@/lib/Config";

export function AppSidebar({ ...props }) {
  const [userDetails, setUserDetails] = React.useState(() => {
    const data = localStorage.getItem("UserDetails");
    return data ? JSON.parse(data) : null;
  });

  React.useEffect(() => {
    const interval = setInterval(() => {
      const data = JSON.parse(localStorage.getItem("UserDetails"));
      setUserDetails((prev) =>
        JSON.stringify(prev) !== JSON.stringify(data) ? data : prev
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const initials = userDetails
    ? `${userDetails?.name[0] ?? ""}`.toUpperCase()
    : "";

  const data = {
    user: {
      name: userDetails?.name,
      lastname: userDetails?.lastname,
      email: userDetails?.email,
      avatar: `${Config.API_URL}${userDetails?.image}`,
      initials: initials,
    },
    navMain: [
      { title: "Dashboard", url: "/dashboard", icon: DashboardIcon },
      {
        title: "Quantum Health Analysis",
        url: "/quantum/patients",
        icon: Stethoscope,
        items: [
          { title: "Patient Directory", url: "/quantum/patients", icon: Users },
          { title: "Master Data Library", url: "/quantum/master-data", icon: Database },
        ],
      },
      {
        title: "Frontend CMS",
        url: "/frontend-cms",
        icon: LayoutTemplate,
        items: [
          { title: "Hero Banner", url: "/frontend-cms/hero", icon: ImageIcon },
          { title: "Shop Categories", url: "/frontend-cms/categories", icon: Grid },
          { title: "Shop Products", url: "/frontend-cms/products", icon: ShoppingBag },
          { title: "Trust Badges", url: "/frontend-cms/trust-badges", icon: Shield },
          { title: "Mission & Stats", url: "/frontend-cms/mission", icon: BarChart3 },
          { title: "Testimonials", url: "/frontend-cms/testimonials", icon: Quote },
          { title: "Distributor Banner", url: "/frontend-cms/distributor-banner", icon: Tag },
          { title: "Header & Footer", url: "/frontend-cms/header-footer", icon: Megaphone },
          { title: "Contact & Social", url: "/frontend-cms/contact", icon: PhoneCall },
        ],
      },
      { title: "User Management", url: "/user", icon: User2Icon },
    ],
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
