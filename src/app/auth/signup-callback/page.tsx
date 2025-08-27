"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../api/DatabaseApi/supabaseClient";

export default function CallbackPage() {
  const router = useRouter();
  const [roleParam, setRoleParam] = useState<"Coach" | "Analyst" | "Fan">("Fan");

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

  return <p>Finishing sign-up…</p>;
}
