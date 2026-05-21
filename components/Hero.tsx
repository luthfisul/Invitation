"use client";

import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="h-screen flex items-center">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 px-6">

        {/* LEFT */}
        <div className="flex flex-col justify-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-heading mb-6"
          >
            Beautiful Digital Wedding Invitations
          </motion.h1>

          <p className="text-gray-600 mb-6">
            Elegant templates crafted for unforgettable moments.
          </p>

          <div className="flex gap-4">
            <button className="bg-primary text-white px-6 py-3 rounded-full">
              Explore Templates
            </button>
            <button className="border px-6 py-3 rounded-full">
              Custom Design
            </button>
          </div>
        </div>

        {/* RIGHT */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex justify-center items-center"
        >
          <div className="w-[280px] h-[500px] bg-white shadow-2xl rounded-3xl p-4">
            <div className="w-full h-full bg-gray-200 rounded-2xl flex items-center justify-center">
              Preview
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}