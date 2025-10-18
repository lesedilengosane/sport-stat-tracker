
"use client";
import { MatchesProvider } from "../context/MatchesContext";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <MatchesProvider>
      {children}
    </MatchesProvider>
  );
}
