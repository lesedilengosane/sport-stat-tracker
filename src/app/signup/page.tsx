"use client";

import { supabase } from "../api/DatabaseApi/supabaseClient";
import { useState } from "react";
import Image from "next/image";

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
    <div className="relative min-h-screen">
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src="/bgrs.jpeg"
              alt="Background"
              fill
              className="object-cover"
              sizes="100vw"
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
                src="/bgrs.jpeg" // replace with your ball+hoop image
                alt="Basketball"
                className="w-full h-full object-cover"
              />
            </div>
    
            {/* Right Side */}
             <div className="w-1/2 bg-white flex items-center justify-center">
              <div className="max-w-md w-full text-center p-8">
                {/* Heading */}
                <h2 className="text-3xl font-bold mb-4 text-black">CREATE YOUR ACCOUNT</h2>
                <p className="text-gray-500 mb-8">
                  Select your role and Sign Up with your existing Google Account
                </p>

                <div className="mb-6 text-left">
                  <label className="block text-sm font-medium text-black mb-2">
                    Role:
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as "Coach" | "Analyst" | "Fan")}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-orange-400 text-black bg-white"
                  >
                    <option value="Coach">Coach</option>
                    <option value="Analyst">Analyst</option>
                    <option value="Fan">Fan</option>
                    </select>
                </div>
    
                {/* Google Button */}
                <button
                  onClick={handleGoogleSignUp}
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
                    Sign Up with Google
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
    // <div className={styles.container}>
    //   {/* ... your UI ... */}
    //   <label className="text-white mb-2">Select your role:</label>
    //   <select
    //     value={role}
    //     onChange={(e) => setRole(e.target.value as "Coach" | "Analyst" | "Fan")}
    //     className="mb-4 p-2 rounded text-black"
    //   >
    //     <option value="Coach">Coach</option>
    //     <option value="Analyst">Analyst</option>
    //     <option value="Fan">Fan</option>
    //   </select>

    //   <button onClick={handleGoogleSignUp} className={styles.btn}>
    //     Sign Up with Google
    //   </button>
    // </div>
  );
}
