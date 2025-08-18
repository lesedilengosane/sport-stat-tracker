// src/app/auth/signin-callback/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../api/DatabaseApi/supabaseClient";

export default function SignInCallback() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        // Get the authenticated user after redirect
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
          console.error("Sign-in user fetch error:", error?.message);
          alert("Authentication failed. Please try again.");
          router.push("/");
          return;
        }

        // Call the addUser API route to check existence
        // Note: For sign-in, we just read; the API returns 409 if user exists
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
          role: "Fan", // role irrelevent for the check
        }),
      });

        if (res.status === 409) {
          // Existing user → dashboard
          router.push("/dashboard");
          return;
        }

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          console.error("Sign-in check failed:", data?.error || res.statusText);
          await supabase.auth.signOut();
          alert("Sign-in failed. Please try again.");
          router.push("/");
          return;
        }

        // If user does not exist → signup
        await supabase.auth.signOut();
        alert("No account found. Please sign up first.");
        router.push("/signup");

      } catch (err) {
        console.error("Sign-in callback error:", err);
        await supabase.auth.signOut();
        router.push("/");
      }
    })();
  }, [router]);

  return <p>Finishing sign-in…</p>;
}
