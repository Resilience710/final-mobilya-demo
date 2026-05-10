import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { blogPosts, getBlogPostBySlug, getRelatedBlogPosts } from '@/lib/blog';
import { absoluteUrl, buildBreadcrumbSchema, buildMetadata, SITE_NAME } from '@/lib/site';

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getBlogPostBySlug(params.slug);

  if (!post) {
    return {};
  }

  return buildMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    image: post.coverImage,
    imageAlt: post.title,
    type: 'article',
    keywords: [post.category, post.title, SITE_NAME],
  });
}

export default function BlogDetailPage({ params }: Props) {
  const post = getBlogPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = getRelatedBlogPosts(post.slug, 2);
  const articleSchemas = [
    buildBreadcrumbSchema([
      { name: 'Ana Sayfa', path: '/' },
      { name: 'Blog', path: '/blog' },
      { name: post.title, path: `/blog/${post.slug}` },
    ]),
    {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt,
      datePublished: post.publishedAt,
      dateModified: post.publishedAt,
      image: [post.coverImage],
      articleSection: post.category,
      author: {
        '@type': 'Organization',
        name: SITE_NAME,
      },
      publisher: {
        '@type': 'Organization',
        name: SITE_NAME,
        logo: {
          '@type': 'ImageObject',
          url: absoluteUrl('/opengraph-image'),
        },
      },
      mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
    },
  ];

  return (
    <main className="min-h-screen bg-white pt-24 pb-20">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleSchemas),
        }}
      />
      <article className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#1f5aa8] hover:text-charcoal transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Bloga Geri Dön
        </Link>

        <div className="mt-6 max-w-3xl">
          <p className="text-sm font-semibold tracking-[0.24em] uppercase text-[#1f5aa8]/75 mb-4">
            {post.category} · {formatDate(post.publishedAt)} · {post.readTime}
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl text-charcoal leading-tight">
            {post.title}
          </h1>
          <p className="mt-5 text-lg text-brown/60 leading-relaxed">
            {post.excerpt}
          </p>
        </div>

        <div className="relative mt-10 aspect-[16/8] overflow-hidden rounded-[2.25rem] bg-stone/10">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="space-y-6 text-lg leading-8 text-brown/80">
            {post.content.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <aside className="h-fit rounded-[2rem] border border-stone/30 bg-cream p-6">
            <h2 className="text-lg font-semibold text-charcoal mb-4">Öne Çıkan Notlar</h2>
            <ul className="space-y-3 text-sm leading-6 text-brown/70">
              {post.highlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          </aside>
        </div>
      </article>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="flex items-center justify-between gap-4 mb-8">
          <h2 className="text-2xl font-semibold text-charcoal">Diğer Yazılar</h2>
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-medium text-[#1f5aa8] hover:text-charcoal transition-colors">
            Tüm Yazılar
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {relatedPosts.map((relatedPost) => (
            <Link
              key={relatedPost.slug}
              href={`/blog/${relatedPost.slug}`}
              className="group block overflow-hidden rounded-[2rem] border border-stone/25 bg-cream"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={relatedPost.coverImage}
                  alt={relatedPost.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <p className="text-sm font-medium text-[#1f5aa8]/75 mb-2">
                  {relatedPost.category}
                </p>
                <h3 className="text-xl font-semibold text-charcoal group-hover:text-[#1f5aa8] transition-colors">
                  {relatedPost.title}
                </h3>
                <p className="mt-3 text-brown/60 leading-relaxed">
                  {relatedPost.excerpt}
                </p>
              </div>
            </Link>
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
