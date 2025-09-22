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
        const response = await fetch("/api/DatabaseApi/checkUser", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ auth_user_id: session.user.id }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to check user existence");
        }

        const { exists , role  } = await response.json();

        // 3. Redirect based on existence and role
        if (exists) {
          // ✅ user exists → go to dashboard

          console.log("User exists:", session.user);
          if (role === "Coach"){
            router.push("/coach");
          }
          else{
            router.push("/analyst");
          }
          
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
  <div className="flex items-center justify-center min-h-screen bg-black">
    <div className="text-center">
      {/* Bouncing basketball */}
      <div className="mx-auto mb-6 w-12 h-12 rounded-full bg-orange-500 relative animate-bounce-ball"></div>

      <h1 className="text-2xl font-bold text-orange-500 mb-2">
        Just checking your shot...
      </h1>
      <p className="text-gray-300">
        Getting you in the game — hold tight, we’re setting up your court.
      </p>
    </div>

    {/* Animation styling */}
    <style jsx>{`
      @keyframes bounce-ball {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-40px); }
      }
      .animate-bounce-ball {
        animation: bounce-ball 0.6s ease-in-out infinite;
      }
    `}</style>
  </div>
);

}
