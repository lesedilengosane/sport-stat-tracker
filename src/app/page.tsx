"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import styles from "./landing.module.css";

export default function Home() {
  const router = useRouter();
  const [blurActive, setBlurActive] = useState(false);

  return (
    <div className={styles.container}>
      <Image
        src="/bg.jpg"
        alt="Background"
        fill
        priority
        className={`${styles.bgImage} ${blurActive ? styles.blur : ""}`}
      />

      <div className={styles.overlay}>
        <h1 className={styles.title}>Sports Stat Tracker</h1>
        <p className={styles.subtitle}>
          Track your sports performance and stats effortlessly
        </p>
        <div className={styles.buttonContainer}>
          <button
            onMouseEnter={() => setBlurActive(true)}
            onMouseLeave={() => setBlurActive(false)}
            onClick={() => router.push("/signup")}
            className={styles.btn}
          >
            Sign Up
          </button>
          <button
            onMouseEnter={() => setBlurActive(true)}
            onMouseLeave={() => setBlurActive(false)}
            onClick={() => router.push("/signin")}
            className={/*styles.btn*/ `${styles.btn} ${styles.btnPrimary}`
              }
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
