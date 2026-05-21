"use client";

export default function Navbar() {
  return (
    <nav className="w-full fixed top-0 z-50 bg-white/70 backdrop-blur-md border-b">
      <div className="max-w-7xl mx-auto flex justify-between items-center p-4">
        <h1 className="font-heading text-xl">EverAfter</h1>

        <div className="space-x-6 hidden md:flex">
          <a href="#" className="hover:text-primary">Gallery</a>
          <a href="#" className="hover:text-primary">Pricing</a>
          <a href="#" className="hover:text-primary">Contact</a>
        </div>

        <button className="bg-primary text-white px-4 py-2 rounded-full">
          Order Now
        </button>
      </div>
    </nav>
  );
}