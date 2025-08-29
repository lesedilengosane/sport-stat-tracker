'use client'

import React from "react";
import Profile from "./profile/page";
import Image from "next/image";
import styles from "../landing.module.css";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../api/DatabaseApi/supabaseClient";
import Link from "next/link";

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
        const fullName = user.user_metadata?.full_name || user.email || "User";
        setUserName(fullName.split(" ")[0]);
      } else {
        router.push("/");
      }
    };

    fetchUser();
  }, [router]);

  return (
    <>
      {/* Background image */}
      <div className={styles.container}>
        <Image
          src="/bgr.jpg"
          alt="Background"
          fill
          priority
          className={styles.bgImage}
        />
      </div>

      {/* Overlay content */}
      <div className={styles.overlay}>
        {/* Profile Logo Top Right */}
        <div className="absolute top-4 right-6">
          <Link href="../dashboard/profile">
            <Image
              src="/profile.jpg" // place your profile image in /public/profile.jpg
              alt="Profile"
              width={50}
              height={50}
            className="rounded-full border-2 border-white shadow-md cursor-pointer"
          />
          </Link>
        </div>

        <h1 className={styles.title}>Sports Stat Tracker</h1>
        <button onClick={() => router.push("/")} className={styles.btn}>
          Welcome to your Dashboard, {userName}! Now you may log out
        </button>
      </div>
    </>
  );
}