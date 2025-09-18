
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../api/DatabaseApi/supabaseClient"; // adjust path

interface AuthContextType {
  user: any | null;
  userName: string | null;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userName: null,
  loading: true,
  error: null,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.error("Error fetching user:", error.message);
        setError("Failed to fetch user information");
        setLoading(false);
        return;
      }

      if (user) {
        setUser(user);
        const fullName = user.user_metadata?.full_name || user.email || "User";
        setUserName(fullName.split(" ")[0]);
      } else {
        router.push("/"); // redirect to login if no user
      }

      setLoading(false);
    };

    fetchUser();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        const fullName =
          session.user.user_metadata?.full_name || session.user.email || "User";
        setUserName(fullName.split(" ")[0]);
      } else {
        setUser(null);
        setUserName(null);
        router.push("/");
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, userName, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
