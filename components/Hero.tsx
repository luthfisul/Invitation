"use client";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="min-h-screen flex items-center px-6">

      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 items-center">

        {/* LEFT */}
        <div>
          <p className="text-sm tracking-widest text-gray-400 mb-4">
            PREMIUM DIGITAL INVITATION
          </p>

          <h1 className="text-5xl md:text-6xl leading-tight font-serif">
            Undangan Web
            <br />
            yang <span className="text-[var(--gold)] italic">Estetik</span>
          </h1>

          <p className="mt-6 text-gray-500 max-w-md">
            Buat momen pernikahanmu lebih berkesan dengan undangan digital elegan.
          </p>

          <div className="mt-8 flex gap-4">
            <button className="bg-black text-white px-6 py-3 rounded-full">
              Lihat Desain
            </button>

            <button className="border px-6 py-3 rounded-full">
              Custom Design
            </button>
          </div>
        </div>

        {/* RIGHT PREVIEW */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center"
        >
          <div className="w-[280px] h-[520px] rounded-[40px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.2)] p-3">
            <div className="w-full h-full rounded-[30px] bg-gray-200 flex items-center justify-center">
              Preview
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}