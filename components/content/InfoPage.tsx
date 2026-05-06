import Link from 'next/link';

interface InfoSection {
  title: string;
  paragraphs: string[];
}

interface InfoLink {
  href: string;
  label: string;
  description: string;
}

interface InfoPageProps {
  eyebrow: string;
  title: string;
  intro: string;
  sections: InfoSection[];
  links?: InfoLink[];
}

export default function InfoPage({
  eyebrow,
  title,
  intro,
  sections,
  links = [],
}: InfoPageProps) {
  return (
    <div className="min-h-screen bg-cream">
      <section className="border-b border-stone/20 bg-charcoal">
        <div className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.3em] text-gold">
            {eyebrow}
          </p>
          <h1 className="font-serif text-4xl leading-tight text-cream sm:text-5xl">
            {title}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-stone/65 sm:text-base">
            {intro}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2">
          {sections.map((section) => (
            <article
              key={section.title}
              className="rounded-3xl border border-stone/20 bg-white p-6 shadow-card"
            >
              <h2 className="font-serif text-2xl text-charcoal">{section.title}</h2>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-brown/75">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </article>
          ))}
        </div>

        {links.length > 0 ? (
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-2xl border border-stone/20 bg-beige px-5 py-4 transition-colors hover:border-gold hover:bg-white"
              >
                <p className="text-sm font-semibold text-charcoal">{link.label}</p>
                <p className="mt-2 text-sm leading-relaxed text-brown/70">
                  {link.description}
                </p>
              </Link>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
