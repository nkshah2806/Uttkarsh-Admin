import React from "react";
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
  ArrowRight,
  LayoutTemplate,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const CMS_SECTIONS = [
  {
    title: "Hero Banner",
    description: "Edit the main headline, background image and CTA buttons.",
    icon: ImageIcon,
    href: "/frontend-cms/hero",
    color: "from-violet-500/10 to-violet-600/5",
    iconColor: "text-violet-500",
  },
  {
    title: "Shop Categories",
    description: "Add, edit or delete product categories and their images.",
    icon: Grid,
    href: "/frontend-cms/categories",
    color: "from-blue-500/10 to-blue-600/5",
    iconColor: "text-blue-500",
  },
  {
    title: "Shop Products",
    description: "Manage products: pricing, stock, images and bestseller flags.",
    icon: ShoppingBag,
    href: "/frontend-cms/products",
    color: "from-emerald-500/10 to-emerald-600/5",
    iconColor: "text-emerald-500",
  },
  {
    title: "Trust Badges",
    description: "Edit the 4 trust badge labels shown below the hero section.",
    icon: Shield,
    href: "/frontend-cms/trust-badges",
    color: "from-amber-500/10 to-amber-600/5",
    iconColor: "text-amber-500",
  },
  {
    title: "Mission & Stats",
    description: "Update the mission story, image and impact counter metrics.",
    icon: BarChart3,
    href: "/frontend-cms/mission",
    color: "from-teal-500/10 to-teal-600/5",
    iconColor: "text-teal-500",
  },
  {
    title: "Testimonials",
    description: "Add or remove customer reviews shown on the Home page.",
    icon: Quote,
    href: "/frontend-cms/testimonials",
    color: "from-pink-500/10 to-pink-600/5",
    iconColor: "text-pink-500",
  },
  {
    title: "Distributor Banner",
    description: "Edit the distributor CTA banner headline and action button.",
    icon: Tag,
    href: "/frontend-cms/distributor-banner",
    color: "from-orange-500/10 to-orange-600/5",
    iconColor: "text-orange-500",
  },
  {
    title: "Header & Footer",
    description: "Update the announcement bar text and footer brand description.",
    icon: Megaphone,
    href: "/frontend-cms/header-footer",
    color: "from-indigo-500/10 to-indigo-600/5",
    iconColor: "text-indigo-500",
  },
  {
    title: "Contact & Social",
    description: "Edit phone, email, address and social media profile URLs.",
    icon: PhoneCall,
    href: "/frontend-cms/contact",
    color: "from-rose-500/10 to-rose-600/5",
    iconColor: "text-rose-500",
  },
];

export default function FrontendCMS() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-2xl bg-violet-100 dark:bg-violet-950/30">
          <LayoutTemplate className="h-7 w-7 text-violet-600" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">Frontend CMS</h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-xl">
            Manage every section of the live website. Click a card below to open the dedicated editor for that section.
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
                <CardContent className="p-5 flex flex-col gap-4">
                  <div className={`w-fit p-3 rounded-xl bg-gradient-to-br ${section.color}`}>
                    <Icon className={`h-6 w-6 ${section.iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-base group-hover:text-violet-600 transition-colors">
                      {section.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                      {section.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-medium text-violet-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    Open editor <ArrowRight className="h-3.5 w-3.5" />
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

