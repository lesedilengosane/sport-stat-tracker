"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import styles from "../landing.module.css";
import { supabase } from "../api/DatabaseApi/supabaseClient";
import { createUser } from "../api/DatabaseApi/addUser/addUser";

export default function SignUp() {
  const router = useRouter();
  const [role, setRole] = useState<"Coach" | "Analyst" | "Fan">("Fan");

  const handleGoogleSignUp = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`, // come back here
        },
      });

      if (error) {
        console.error("Google sign-up error:", error.message);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Check if user already exists
        const { data: existingUser } = await supabase
          .from("users")
          .select("*")
          .eq("auth_user_id", user.id)
          .single();

        if (existingUser) {
          router.push("/dashboard");
          return;
        }

        // Create new user with selected role
        await createUser({
          auth_user_id: user.id,
          first_name: user.user_metadata?.full_name?.split(" ")[0] || "",
          last_name: user.user_metadata?.full_name?.split(" ")[1] || "",
          role: role,
        });

        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      console.log("Error details:", err);
    }
  };

  return (
    <div className={styles.container}>
      <Image
        src="/bgrs.jpeg"
        alt="Background"
        fill
        priority
        className={styles.bgImage}
      />

      <div className={styles.overlay}>
        <h1 className={styles.title}>Sports Stat Tracker</h1>

        {/* Role Selection */}
        <label className="text-white mb-2">Select your role:</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as "Coach" | "Analyst" | "Fan")}
          className="mb-4 p-2 rounded text-black"
        >
          <option value="Coach">Coach</option>
          <option value="Analyst">Analyst</option>
          <option value="Fan">Fan</option>
        </select>

        <button onClick={handleGoogleSignUp} className={styles.btn}>
          Sign Up with Google
        </button>
      </div>
    </div>
  );
}
