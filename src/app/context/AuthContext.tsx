// src/app/context/AuthContext.tsx
"use client";
import { createContext, useContext, useState } from "react";

type User = {
  user_id: string;
  first_name: string;
  last_name: string;
  user_role: "Coach" | "Fan" | "Analyst";
};

type AuthContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
