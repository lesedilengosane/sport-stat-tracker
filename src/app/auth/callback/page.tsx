"use client";

import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const processSignIn = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        // Optional: store user in DB
        const { user } = session;
        await fetch("/api/save-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: user.id,
            email: user.email,
            provider: user.app_metadata?.provider
          })
        });

        router.push("/dashboard");
      } else {
        router.push("/");
      }
    };

    processSignIn();
  }, [router]);

  return <p style={{ textAlign: "center", marginTop: "2rem" }}>Signing you in...</p>;
}
