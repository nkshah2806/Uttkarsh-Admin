import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  ImageIcon,
  Grid,
  ShoppingBag,
  Shield,
  BarChart3,
  Quote,
  Tag,
  Megaphone,
  PhoneCall,
  HeartPulse,
  Scale,
  Images,
  ArrowRight,
  LayoutTemplate,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const CMS_SECTIONS = [
  {
    titleKey: "cms.secHeroBanner",
    descKey: "cms.secHeroBannerDesc",
    icon: ImageIcon,
    href: "/frontend-cms/hero",
    color: "from-violet-500/10 to-violet-600/5",
    iconColor: "text-violet-500",
  },
  {
    titleKey: "cms.secShopCategories",
    descKey: "cms.secShopCategoriesDesc",
    icon: Grid,
    href: "/frontend-cms/categories",
    color: "from-blue-500/10 to-blue-600/5",
    iconColor: "text-blue-500",
  },
  {
    titleKey: "cms.secShopProducts",
    descKey: "cms.secShopProductsDesc",
    icon: ShoppingBag,
    href: "/frontend-cms/products",
    color: "from-emerald-500/10 to-emerald-600/5",
    iconColor: "text-emerald-500",
  },
  {
    titleKey: "cms.secTrustBadges",
    descKey: "cms.secTrustBadgesDesc",
    icon: Shield,
    href: "/frontend-cms/trust-badges",
    color: "from-amber-500/10 to-amber-600/5",
    iconColor: "text-amber-500",
  },
  {
    titleKey: "cms.secMissionStats",
    descKey: "cms.secMissionStatsDesc",
    icon: BarChart3,
    href: "/frontend-cms/mission",
    color: "from-teal-500/10 to-teal-600/5",
    iconColor: "text-teal-500",
  },
  {
    titleKey: "cms.secTestimonials",
    descKey: "cms.secTestimonialsDesc",
    icon: Quote,
    href: "/frontend-cms/testimonials",
    color: "from-pink-500/10 to-pink-600/5",
    iconColor: "text-pink-500",
  },
  {
    titleKey: "cms.secDistributorBanner",
    descKey: "cms.secDistributorBannerDesc",
    icon: Tag,
    href: "/frontend-cms/distributor-banner",
    color: "from-orange-500/10 to-orange-600/5",
    iconColor: "text-orange-500",
  },
  {
    titleKey: "cms.secHeaderFooter",
    descKey: "cms.secHeaderFooterDesc",
    icon: Megaphone,
    href: "/frontend-cms/header-footer",
    color: "from-indigo-500/10 to-indigo-600/5",
    iconColor: "text-indigo-500",
  },
  {
    titleKey: "cms.secContactSocial",
    descKey: "cms.secContactSocialDesc",
    icon: PhoneCall,
    href: "/frontend-cms/contact",
    color: "from-rose-500/10 to-rose-600/5",
    iconColor: "text-rose-500",
  },
  {
    titleKey: "cms.secHealthCamps",
    descKey: "cms.secHealthCampsDesc",
    icon: HeartPulse,
    href: "/frontend-cms/health-camps",
    color: "from-red-500/10 to-red-600/5",
    iconColor: "text-red-500",
  },
  {
    titleKey: "cms.secPhotoVideoGallery",
    descKey: "cms.secPhotoVideoGalleryDesc",
    icon: Images,
    href: "/frontend-cms/gallery",
    color: "from-violet-500/10 to-fuchsia-600/5",
    iconColor: "text-violet-500",
  },
  {
    titleKey: "cms.secLegalContent",
    descKey: "cms.secLegalContentDesc",
    icon: Scale,
    href: "/frontend-cms/legal-content",
    color: "from-indigo-500/10 to-indigo-600/5",
    iconColor: "text-indigo-500",
  },
];

export default function FrontendCMS() {
  const { t } = useTranslation();
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-2xl bg-violet-100 dark:bg-violet-950/30">
          <LayoutTemplate className="h-7 w-7 text-violet-600" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">{t("cms.frontendCmsTitle")}</h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-xl">
            {t("cms.frontendCmsSubtitle")}
          </p>
        </div>
      </div>

      {/* Section Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CMS_SECTIONS.map((section) => {
          const Icon = section.icon;
          return (
            <Link key={section.href} to={section.href} className="group block">
              <Card className="h-full transition-all duration-200 hover:shadow-lg hover:border-violet-500/30 hover:-translate-y-0.5 cursor-pointer">
                <CardContent className="flex flex-col gap-4">
                  <div className="flex items-start justify-start gap-4">
                    <div className={`w-fit p-3 rounded-xl bg-gradient-to-br ${section.color}`}>
                      <Icon className={`h-6 w-6 ${section.iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-base group-hover:text-violet-600 transition-colors">
                        {t(section.titleKey)}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                        {t(section.descKey)}
                      </p>
                    </div>
                  </div>
                  <div className="absolute bottom-5 right-5 flex items-center justify-end gap-1 text-xs font-medium text-violet-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    {t("cms.openEditor")} <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
