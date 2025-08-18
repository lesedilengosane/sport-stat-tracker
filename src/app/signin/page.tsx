// src/app/signin/page.tsx
"use client";

import { supabase } from "../api/DatabaseApi/supabaseClient";
import Image from "next/image";
import styles from "../landing.module.css";

export default function SignIn() {
  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // send them to our callback page where we'll do the DB check
        redirectTo: `${window.location.origin}/auth/signin-callback`,
      },
    });

    if (error) {
      console.error("Google sign-in error:", error.message);
      alert("Google sign-in failed. Please try again.");
    }
  };

  return (
    <div className={styles.container}>
      <Image src="/bgrs.jpeg" alt="Background" fill priority className={styles.bgImage} />
      <div className={styles.overlay}>
        <h1 className={styles.title}>Sports Stat Tracker</h1>
        <button onClick={handleGoogleSignIn} className={styles.btn}>
          Sign In with Google
        </button>
      </div>
    </div>
  );
}
