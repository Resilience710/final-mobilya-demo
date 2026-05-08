import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { blogPosts } from '@/lib/blog';
import { absoluteUrl, SITE_NAME } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Final Mobilya Blog ile dekorasyon, yerleşim ve mobilya seçimi hakkında pratik fikirleri keşfedin.',
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    title: `Blog | ${SITE_NAME}`,
    description: 'Final Mobilya Blog ile dekorasyon, yerleşim ve mobilya seçimi hakkında pratik fikirleri keşfedin.',
    url: absoluteUrl('/blog'),
  },
};

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-cream pt-24 pb-20">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold tracking-[0.28em] uppercase text-[#1f5aa8]/75 mb-4">
            Final Mobilya
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl text-charcoal leading-tight">
            Dekorasyon kararlarını kolaylaştıran kısa ve net içerikler.
          </h1>
          <p className="mt-5 text-lg text-brown/60 leading-relaxed">
            Salon yerleşiminden yatak odası atmosferine kadar, evinizi planlarken işinize yarayacak örnek yazılar burada.
          </p>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-3">
          {blogPosts.map((post) => (
            <article key={post.slug} className="group">
              <Link href={`/blog/${post.slug}`} className="block">
                <div className="relative aspect-[16/11] overflow-hidden rounded-[2rem] bg-stone/10">
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="pt-5">
                  <p className="text-sm font-medium text-[#1f5aa8]/75 mb-2">
                    {post.category} · {formatDate(post.publishedAt)} · {post.readTime}
                  </p>
                  <h2 className="text-2xl font-semibold text-charcoal leading-tight group-hover:text-[#1f5aa8] transition-colors">
                    {post.title}
                  </h2>
                  <p className="mt-3 text-brown/60 leading-relaxed">
                    {post.excerpt}
                  </p>
                  <span className="inline-flex items-center gap-2 mt-5 text-sm font-semibold tracking-[0.18em] uppercase text-charcoal">
                    Yazıyı Oku
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));
}
