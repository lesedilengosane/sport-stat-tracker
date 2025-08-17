'use client'

import Image from "next/image";
import styles from "../landing.module.css";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../api/DatabaseApi/supabaseClient";

export default function Dashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.error("Error fetching user:", error.message);
        return;
      }

      if (user) {
        // Try to get full_name from user_metadata, fallback to email if not available
        const fullName = user.user_metadata?.full_name || user.email || "User";
        setUserName(fullName.split(" ")[0]); // show first name only
      } else {
        router.push("/"); // redirect if no user
      }
    };

    fetchUser();
  }, [router]);

  return (
    <div className={styles.container}>
      <Image
        src="/bgr.jpg"
        alt="Background"
        fill
        priority
        className={styles.bgImage}
      />

      <div className={styles.overlay}>
        <h1 className={styles.title}>Sports Stat Tracker</h1>
        <button onClick={() => router.push("/")} className={styles.btn}>
          Welcome to your Dashboard, {userName}! Now you may log out
        </button>
      </div>
    </div>
  );
}
