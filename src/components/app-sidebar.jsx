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
import { useLanguage } from "@/context/LanguageContext";

export function AppSidebar({ ...props }) {
  const { t } = useLanguage();
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
      { title: t("dashboard"), url: "/dashboard", icon: DashboardIcon },
      {
        title: t("quantumModule"),
        url: "/quantum/patients",
        icon: Stethoscope,
        items: [
          { title: t("patientDirectory"), url: "/quantum/patients", icon: Users },
          { title: t("masterDataLibrary"), url: "/quantum/master-data", icon: Database },
          { title: t("disclaimerContent"), url: "/quantum/disclaimers", icon: FileText },
        ],
      },
      {
        title: t("frontendCMS"),
        url: "/frontend-cms",
        icon: LayoutTemplate,
        items: [
          { title: t("heroBanner"), url: "/frontend-cms/hero", icon: ImageIcon },
          { title: t("shopCategories"), url: "/frontend-cms/categories", icon: Grid },
          { title: t("shopProducts"), url: "/frontend-cms/products", icon: ShoppingBag },
          { title: t("trustBadges"), url: "/frontend-cms/trust-badges", icon: Shield },
          { title: t("missionStats"), url: "/frontend-cms/mission", icon: BarChart3 },
          { title: t("testimonials"), url: "/frontend-cms/testimonials", icon: Quote },
          { title: t("distributorBanner"), url: "/frontend-cms/distributor-banner", icon: Tag },
          { title: t("headerFooter"), url: "/frontend-cms/header-footer", icon: Megaphone },
          { title: t("contactSocial"), url: "/frontend-cms/contact", icon: PhoneCall },
        ],
      },
      { title: t("userManagement"), url: "/user", icon: User2Icon },
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
