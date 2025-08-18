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
    <div className="relative min-h-screen">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/bg.jpg" // put your background image in public/
          alt="Background"
          className="w-full h-full object-cover"
          fill={true} // Fill the parent container
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          quality={80}
          priority
        />
        <div
          className="absolute inset-0 backdrop-blur-sm"
          style={{ backgroundColor: "rgba(11, 19, 43, 0.6)" }}
          ></div>
      </div>

      {/* Overlay Section */}
      <div className="relative m-16 min-h-[calc(100vh-128px)] flex rounded-2xl overflow-hidden shadow-lg">
        {/* Left Side */}
        <div className="w-1/2 relative">
        <Image
            fill
            src="/bg.jpg" // replace with your ball+hoop image
            alt="Basketball"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right Side */}
         <div className="w-1/2 bg-white flex items-center justify-center">
          <div className="max-w-md w-full text-center p-8">
            {/* Heading */}
            <h2 className="text-3xl font-bold mb-4 text-black">WELCOME BACK</h2>
            <p className="text-gray-500 mb-8">
              Use your existing Google Account to log in
            </p>

            {/* Google Button */}
            <button
              onClick={handleGoogleSignIn}
              type="button"
              className="w-full border border-gray-300 py-3 rounded-lg flex items-center justify-center gap-3 hover:bg-gray-50 transition"
            >
              <Image
                width={5}
                height={5}
                src="/google-icon.svg" // add google icon to public/
                alt="Google"
                className="h-5 w-5"
              />
              <span className="font-medium text-gray-700">
                Sign in with Google
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
    
  );
}
