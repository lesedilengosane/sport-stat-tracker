"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../api/DatabaseApi/supabaseClient";

export default function SignInCallback() {
  const router = useRouter();

  useEffect(() => {
    const checkUserAndRedirect = async () => {
      try {
        // 1. Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session?.user) {
          throw new Error(sessionError?.message || "No session found");
        }

        // 2. Check if user exists
        const checkResponse = await fetch("/api/DatabaseApi/checkUser", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ auth_user_id: session.user.id }),
        });

        if (!checkResponse.ok) {
          const errorData = await checkResponse.json();
          throw new Error(errorData.error || "Failed to check user existence");
        }

        const { exists } = await checkResponse.json();

        // 3. Redirect based on existence
        if (exists) {
          // ✅ user exists → go to dashboard
          router.push("/dashboard");
        } else {
          // ❌ user does not exist → sign them out and send to signup
          await supabase.auth.signOut();
          alert("No account found. Please sign up first.");
          router.push("/signup");
        }

      } catch (error) {
        console.error("Authentication error:", error);
        await supabase.auth.signOut();
        router.push("/");
      }
    };

    checkUserAndRedirect();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Processing authentication...</p>
    </div>
  );
}
