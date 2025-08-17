"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "../landing.module.css";
import { supabase } from "../api/DatabaseApi/supabaseClient";

export default function SignIn() {
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`, // come back here
        },
      });

      if (error) {
        console.error("Google sign-in error:", error.message);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Check if user exists in custom users table
        const { data: existingUser, error: checkError } = await supabase
          .from("users")
          .select("*")
          .eq("auth_user_id", user.id)
          .single();

        if (checkError && checkError.code !== "PGRST116") {
          console.error("Error checking user:", checkError.message);
          return;
        }

        if (existingUser) {
          console.error("User already exists")
          console.log("User already exists, redirecting to dashboard");
          // User exists, redirect to dashboard
          router.push("/dashboard");
        } else {
          router.push("/signup");
        }
      }
    } catch (err) {
      console.error("Unexpected error:", err);
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
        <button onClick={handleGoogleSignIn} className={styles.btn}>
          Sign In with Google
        </button>
      </div>
    </div>
  );
}
