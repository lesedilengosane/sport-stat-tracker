"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../api/DatabaseApi/supabaseClient";
import { Mirage } from "ldrs/react";
import "ldrs/react/Mirage.css";

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
        router.push("/coach/coach-call");
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

      if(roleParam === "Coach") {
        router.push("/coach/coach-call");
        return;
      }
      if(roleParam === "Analyst") {
        router.push("/analyst");
        return;
      }
      if(roleParam === "Fan")
      {
        router.push("/fan");
        return;
      }
    })();
  }, [router, roleParam]);

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-[#f6f6f6] overflow-hidden">
      {/* Loader as background */}
      <div className="absolute inset-0 flex items-center justify-center z-0">
        <Mirage size="600" speed="6" color="orange" /> {/* change size/color here */}
      </div>
  
      {/* Text on top */}
      <div className="relative z-10 text-center px-6">
        <h1 className="text-3xl font-extrabold text-black mb-3">
          Setting things up...
        </h1>
        <p className="text-gray-600 mb-2">
          Getting you on the court – almost there!
        </p>
      </div>
    </div>
  );
  
}