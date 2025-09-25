"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../api/DatabaseApi/supabaseClient";
import { useAuth } from "@/app/context/AuthContext";



export default function SignInCallback() {
  const router = useRouter();
  const { setUser } = useAuth();

  useEffect(() => {
    const checkUserAndRedirect = async () => {
  try {
    
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      throw new Error(sessionError?.message || "No session found");
    }

    
    const checkResponse = await fetch("/api/DatabaseApi/checkUser", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ auth_user_id: session.user.id }),
    });

    if (!checkResponse.ok) {
      const errorData = await checkResponse.json();
      throw new Error(errorData.error || "Failed to check user existence");
    }

    const { exists, role, first_name, last_name, user_id, hasTeam } =
      await checkResponse.json();

    // 3. Construct user object
    const userObj = {
      user_id,
      first_name,
      last_name,
      user_role: role,
    };

    // 4. Store in AuthContext
    setUser(userObj);

    console.log(
      `The user given is: ${userObj.user_id}, role: ${userObj.user_role}`
    );

    // 5. Handle "no account"
    if (!exists) {
      await supabase.auth.signOut();
      alert("No account found. Please sign up first.");
      router.push("/signup");
      return;
    }

    // 6. Redirect based on role
    switch (userObj.user_role) {
      case "Fan":
        router.push("/fan");
        break;
      case "Analyst":
        router.push("/analyst");
        break;
      case "Coach":
        if (hasTeam){
          router.push("/coach");
        }
        else{
          router.push("/coach/coach-call");
        }
        
        break;
      default:
        router.push("/");
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

