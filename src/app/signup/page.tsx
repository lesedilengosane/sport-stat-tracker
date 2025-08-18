"use client";

import { supabase } from "../api/DatabaseApi/supabaseClient";
import { useState } from "react";
import styles from "../landing.module.css";

export default function SignUp() {
  const [role, setRole] = useState<"Coach" | "Analyst" | "Fan">("Fan");

  const handleGoogleSignUp = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/signup-callback?role=${role}`,
        queryParams: { access_type: "offline", prompt: "consent" },
      },
    });

    if (error) {
      console.error("Google sign-up error:", error.message);
      alert("Google sign-in failed. Please try again.");
    }
  };

  return (
    <div className={styles.container}>
      {/* ... your UI ... */}
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
  );
}
