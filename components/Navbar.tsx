export default function Navbar() {
  return (
    <nav className="w-full fixed top-0 z-50 bg-white/70 backdrop-blur-md border-b">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">

        <h1 className="font-serif text-lg tracking-wide">
          EverAfter
        </h1>

        <div className="flex gap-8 text-sm text-gray-600">
          <a href="#" className="hover:text-[var(--gold)]">Gallery</a>
          <a href="#" className="hover:text-[var(--gold)]">Pricing</a>
          <a href="#" className="hover:text-[var(--gold)]">Contact</a>
        </div>

      </div>
    </nav>
  );
}