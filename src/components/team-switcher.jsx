import * as React from "react";
import { Shield } from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import logo from "../assets/logo.png";
import { useLanguage } from "@/context/LanguageContext";

export function TeamSwitcher() {
  const { t } = useLanguage();
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" className="bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 h-auto overflow-hidden rounded-xl p-2.5 transition-all">
          <div className="flex aspect-square size-9 items-center justify-center rounded-lg bg-white dark:bg-indigo-900/60 shadow-xs border border-indigo-100 dark:border-indigo-800">
            <img src={logo} className="img-fluid max-h-7" alt="Uttkarsh Logo" />
          </div>
          <div className="flex flex-col flex-1 text-left leading-tight ml-1">
            <div className="flex items-center gap-1.5">
              <span className="truncate font-bold text-sm tracking-tight text-indigo-950 dark:text-indigo-100">{t("appName")}</span>
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 text-[9px] font-extrabold uppercase tracking-wider bg-indigo-600 text-white rounded dark:bg-indigo-500 shadow-2xs">
                <Shield className="size-2.5" />
                {t("adminBadge")}
              </span>
            </div>
            <span className="truncate text-[11px] font-medium text-indigo-600/80 dark:text-indigo-300/80">{t("corporationAdmin")}</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
