"use client";
import { createContext, useContext, useState, useEffect } from "react";
// Update the import path below if your supabaseClient is not in src/lib
import { supabase } from "../api/DatabaseApi/supabaseClient";

type User = {
  user_id: string;
  first_name: string;
  last_name: string;
  user_role: "Coach" | "Fan" | "Analyst";
  auth_user_id:string
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

  // 🔑 On mount, re-fetch the session and hydrate user
  useEffect(() => {
    const restoreUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const checkResponse = await fetch("/api/DatabaseApi/checkUser", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ auth_user_id: session.user.id }),
        });

        if (checkResponse.ok) {
          const { user_id, first_name, last_name, role ,auth_user_id} =
            await checkResponse.json();

          setUser({
            user_id,
            first_name,
            last_name,
            user_role: role,
            auth_user_id
          });
        }
      }
    };

    restoreUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
