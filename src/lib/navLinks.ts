// lib/navLinks.ts
import { Home, BarChart, Users, Settings } from "lucide-react";

export interface NavLink {
  name: string;
  href: string;
  icon?: React.ComponentType<any>;
}

// Links for coach
export const coachLinks: NavLink[] = [
  { name: "Dashboard", href: "/coach", icon: Home },
  { name: "Teams", href: "/coach/teams", icon: Users },
  { name: "Settings", href: "/coach/settings", icon: Settings },
];

// Links for analyst
export const analystLinks: NavLink[] = [
  { name: "Dashboard", href: "/analyst", icon: Home },
  { name: "Reports", href: "/analyst/reports", icon: BarChart },
  { name: "Settings", href: "/analyst/settings", icon: Settings },
];

// Helper map for SideNav component
export const navLinksByRole: Record<"coach" | "analyst", NavLink[]> = {
  coach: coachLinks,
  analyst: analystLinks,
};
