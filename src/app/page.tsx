import { Metadata } from "next";
import PillOrganizer from "@/components/dashboard/PillOrganizer";

// SEO Requirement: Static Metadata for both languages on the same route
export const metadata: Metadata = {
  title: "صِحتنا | Family Health Companion - Dashboard",
  description:
    "Manage your daily medication schedules and family health routines with the Family Health Companion dashboard. لوحة تحكم تطبيق صِحتنا لمتابعة الأدوية.",
};

import HomeContent from "@/components/dashboard/HomeContent";

export default function Home() {
  return <HomeContent />;
}
