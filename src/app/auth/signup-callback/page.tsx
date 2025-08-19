"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../api/DatabaseApi/supabaseClient";

export default function CallbackPage() {
  const router = useRouter();
  const [roleParam, setRoleParam] = useState<"Coach" | "Analyst" | "Fan" | null>(null)

  useEffect(() => {
    // Grab query params safely on client
    const params = new URLSearchParams(window.location.search);
    setRoleParam((params.get("role") ?? "Fan") as "Coach" | "Analyst" | "Fan");
  }, []);
  
  useEffect(() => {
    if (!roleParam) return; // Wait until roleParam is set

    (async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        alert("Authentication failed. Please try again.");
        router.push("/");
        return;
      }

      const fullName = user.user_metadata?.full_name || "";
      const [firstName = "", lastName = ""] = fullName.split(" ");

      const res = await fetch("/api/DatabaseApi/addUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auth_user_id: user.id,
          first_name: firstName,
          last_name: lastName,
          role: roleParam,
        }),
      });

      if (res.status === 409) {
        await supabase.auth.signOut();
        alert("An account with this email already exists.\nPlease sign in instead.");
        router.push("/");
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        console.error("Create user failed:", data?.error || res.statusText);
        await supabase.auth.signOut();
        alert("Signup failed. Please try again.");
        router.push("/");
        return;
      }

      router.push("/dashboard");
    })();
  }, [router, roleParam]);

return (
  <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
    <div className="bg-gray-900 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center border-4 border-orange-500">
      
      {/* Basketball spinner */}
      <div className="flex justify-center mb-8 relative">
        <div className="relative h-24 w-24">
          <div className="absolute inset-0 rounded-full bg-orange-600 flex items-center justify-center shadow-lg">
            {/* Lines */}
            <div className="absolute w-full h-full rounded-full border-2 border-black"></div>
            <div className="absolute w-full h-full rounded-full border-2 border-black rotate-45"></div>
            {/* Center dot */}
            <div className="absolute w-4 h-4 rounded-full bg-black top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
          </div>
          {/* Spinning effect */}
          <div className="absolute inset-0 animate-spin-slow">
            <div className="w-full h-0.5 bg-black opacity-30"></div>
          </div>
        </div>
      </div>
      
      <h1 className="text-3xl font-extrabold text-orange-500 mb-3">
        Finalizing Your Sign-In...
      </h1>
      <p className="text-gray-300 mb-8">
        Getting you on the court – almost there!
      </p>
      
      {/* Basketball bounce animation */}
      <div className="flex justify-center mb-6">
        <div className="h-10 w-10 bg-orange-500 rounded-full animate-bounce shadow-lg border-2 border-black"></div>
      </div>
      
      <p className="mt-4 text-sm text-gray-400 italic">
        Just checking your shot – almost in the game!
      </p>
    </div>
  </div>
);

}