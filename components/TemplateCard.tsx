export default function TemplateCard({ data }: any) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition">

      <div className="h-56 bg-gray-200 relative">
        <div className="absolute top-3 left-3 bg-black text-white text-xs px-2 py-1 rounded">
          {data.category}
        </div>
      </div>

      <div className="p-4 text-left">
        <h3 className="font-semibold">{data.name}</h3>

        <p className="mt-3 text-[var(--gold)] font-semibold">
          Rp {data.price.toLocaleString()}
        </p>

        <div className="flex gap-2 mt-4">
          <button className="border px-3 py-1 rounded text-sm">
            Demo
          </button>
          <button className="bg-[var(--gold)] text-white px-3 py-1 rounded text-sm">
            Pesan
          </button>
        </div>
      </div>

    </div>
  );
}