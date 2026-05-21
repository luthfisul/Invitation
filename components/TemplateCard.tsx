export default function TemplateCard() {
  return (
    <div className="group rounded-2xl overflow-hidden shadow hover:shadow-xl transition">
      
      <div className="h-64 bg-gray-200 relative">
        <div className="absolute top-3 left-3 bg-primary text-white text-xs px-3 py-1 rounded-full">
          Premium
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold">Luxury Gold</h3>
        <p className="text-sm text-gray-500">Elegant • Modern</p>
        <p className="mt-2 font-medium">Rp 199K</p>
      </div>

    </div>
  );
}