import TemplateCard from "./TemplateCard";

export default function Gallery() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-6">

        <h2 className="text-3xl font-heading mb-10 text-center">
          Explore Our Templates
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          <TemplateCard />
          <TemplateCard />
          <TemplateCard />
          <TemplateCard />
          <TemplateCard />
          <TemplateCard />
        </div>

      </div>
    </section>
  );
}