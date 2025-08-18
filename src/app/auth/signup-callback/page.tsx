"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../api/DatabaseApi/supabaseClient";

export default function CallbackPage() {
  const router = useRouter();
  const params = useSearchParams();
  const roleParam = (params.get("role") ?? "Fan") as "Coach" | "Analyst" | "Fan";

  useEffect(() => {
    (async () => {
      // Get the authenticated user after redirect
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        console.error("Callback user fetch error:", error?.message);
        alert("Authentication failed. Please try again.");
        router.push("/");
        return;
      }

      const fullName = user.user_metadata?.full_name || "";
      const [firstName = "", lastName = ""] = fullName.split(" ");

      // Call your API route
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

      // Read result and branch
      if (res.status === 409) {
        // Existing user → sign out and go back to landing (or /login)
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

      // Success → go to dashboard
      router.push("/dashboard");
    })();
  }, [router, roleParam]);

  return <p>Finishing sign-up…</p>;
}
