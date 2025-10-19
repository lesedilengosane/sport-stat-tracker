"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface Trail {
  id: string;
  name: string;
  location: { _latitude: number; _longitude: number };
  distance: number;
  elevationGain: number;
  difficulty: string;
  tags: string[];
  description: string;
  photos: string[];
  status: string;
}

export default function Hiking() {
  const [trails, setTrails] = useState<Trail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrails = async () => {
      try {
        const res = await fetch("/api/trails?page=1&limit=5");
        const data = await res.json();
        if (data.success) {
          setTrails(data.trails);
        } else {
          throw new Error(data.message || "Failed to fetch trails");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTrails();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-80 text-gray-300">
        <Loader2 className="animate-spin w-8 h-8 mr-3" />
        Loading hiking trails...
      </div>
    );

  if (error)
    return (
      <div className="text-center text-red-400 mt-10 text-lg">
        ❌ Error: {error}
      </div>
    );

  return (
    <section className="px-6 py-12 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 min-h-screen text-gray-100">
      <h1 className="text-4xl font-bold mb-10 text-center text-white">
        🏞️ Hiking & Trails
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {trails.map((trail) => (
          <motion.div
            key={trail.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 overflow-hidden hover:shadow-xl transition-shadow duration-300"
          >
            <div className="relative h-56 w-full overflow-hidden">
              <img
                src={trail.photos[0]}
                alt={trail.name}
                className="object-cover w-full h-full transform hover:scale-105 transition-transform duration-500"
              />
              <span
                className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold shadow-md ${
                  trail.difficulty === "Easy"
                    ? "bg-green-700 text-green-100"
                    : trail.difficulty === "Medium"
                    ? "bg-yellow-600 text-yellow-100"
                    : "bg-red-700 text-red-100"
                }`}
              >
                {trail.difficulty}
              </span>
            </div>

            <div className="p-5">
              <h2 className="text-xl font-semibold mb-2 text-white">
                {trail.name}
              </h2>
              <p className="text-gray-400 text-sm mb-3 line-clamp-3">
                {trail.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-3">
                {trail.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="bg-gray-700 text-gray-300 text-xs px-3 py-1 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between text-sm text-gray-400 border-t border-gray-700 pt-3">
                <span>📍 {trail.location._latitude.toFixed(2)}, {trail.location._longitude.toFixed(2)}</span>
                <span>📏 {trail.distance} km</span>
              </div>
              <div className="mt-2 text-sm text-gray-400">
                ⛰️ Elevation gain: {trail.elevationGain} m
              </div>
              <div className="mt-3">
                <span
                  className={`inline-block px-4 py-1 rounded-full text-xs font-semibold ${
                    trail.status === "open"
                      ? "bg-green-600 text-white"
                      : "bg-red-600 text-white"
                  }`}
                >
                  {trail.status === "open" ? "🟢 Open" : "🔴 Closed"}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
