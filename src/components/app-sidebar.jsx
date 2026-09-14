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
  Scale,
  BarChart3,
  Quote,
  Tag,
  Megaphone,
  PhoneCall,
  Building2,
  Users,
  Database,
  Stethoscope,
  Tags,
  Pill,
  IndianRupee,
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
import { useTranslation } from "react-i18next";

export function AppSidebar({ ...props }) {
  const { t } = useTranslation();
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
      { title: t("nav.dashboard"), url: "/dashboard", icon: DashboardIcon },
      {
        title: t("nav.healthAnalysis"),
        url: "/quantum/patients",
        icon: Stethoscope,
        items: [
          { title: t("nav.clientDirectory"), url: "/quantum/patients", icon: Users },
          { title: t("nav.masterDataLibrary"), url: "/quantum/master-data", icon: Database },
          { title: t("nav.disclaimerContent"), url: "/quantum/disclaimers", icon: FileText },
          { title: t("nav.parameterCategories"), url: "/quantum/categories", icon: Tags },
          { title: t("nav.medicineManagement"), url: "/quantum/medicines", icon: Pill },
          { title: t("nav.scanPricingManagement"), url: "/quantum/scan-pricing", icon: IndianRupee },
        ],
      },
      {
        title: t("nav.frontendCms"),
        url: "/frontend-cms",
        icon: LayoutTemplate,
        items: [
          { title: t("nav.heroBanner"), url: "/frontend-cms/hero", icon: ImageIcon },
          { title: t("nav.shopCategories"), url: "/frontend-cms/categories", icon: Grid },
          { title: t("nav.shopProducts"), url: "/frontend-cms/products", icon: ShoppingBag },
          { title: t("nav.trustBadges"), url: "/frontend-cms/trust-badges", icon: Shield },
          { title: t("nav.missionStats"), url: "/frontend-cms/mission", icon: BarChart3 },
          { title: t("nav.testimonials"), url: "/frontend-cms/testimonials", icon: Quote },
          { title: t("nav.distributorBanner"), url: "/frontend-cms/distributor-banner", icon: Tag },
          { title: t("nav.headerFooter"), url: "/frontend-cms/header-footer", icon: Megaphone },
          { title: t("nav.contactSocial"), url: "/frontend-cms/contact", icon: PhoneCall },
          { title: t("nav.healthCamps"), url: "/frontend-cms/health-camps", icon: HeartPulse },
          { title: t("nav.photoVideoGallery"), url: "/frontend-cms/gallery", icon: ImageIcon },
          { title: t("nav.legalContent"), url: "/frontend-cms/legal-content", icon: Scale },
        ],
      },
      { title: t("nav.userManagement"), url: "/user", icon: User2Icon },
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
