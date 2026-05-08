import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import AnimatedSection from '@/components/ui/AnimatedSection';
import { blogPosts } from '@/lib/blog';

export default function BlogHighlights() {
  return (
    <section className="bg-white py-16 lg:py-24 border-t border-stone/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection direction="none" className="text-center max-w-3xl mx-auto">
          <p className="text-sm font-semibold tracking-[0.28em] uppercase text-[#1f5aa8]/70 mb-3">
            İlham Köşesi
          </p>
          <h2 className="text-3xl sm:text-4xl font-semibold text-[#1f5aa8] mb-4">
            Final Mobilya Blog
          </h2>
          <p className="text-lg text-brown/55 leading-relaxed">
            Dekorasyon trendleri, oda planlama ipuçları ve mobilya seçimini kolaylaştıran kısa rehberler.
          </p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 mt-5 text-lg font-semibold text-[#1f5aa8] hover:text-charcoal transition-colors"
          >
            Tümünü Görüntüle
            <ArrowRight className="w-5 h-5" />
          </Link>
        </AnimatedSection>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {blogPosts.slice(0, 3).map((post, index) => (
            <AnimatedSection
              key={post.slug}
              delay={index * 0.08}
              className="group"
            >
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
                  <p className="text-sm font-medium text-[#1f5aa8]/80 mb-2">
                    {post.category} · {post.readTime}
                  </p>
                  <h3 className="text-[1.9rem] leading-tight font-semibold text-charcoal group-hover:text-[#1f5aa8] transition-colors">
                    {post.title}
                  </h3>
                  <p className="mt-3 text-brown/55 text-lg leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>
              </Link>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
