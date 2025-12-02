import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";

// Sample blog data - in real app, this would come from a database or API
const blogPosts: { [key: string]: any } = {
  "newjeans-returns-to-ador": {
    id: 1,
    category: "Music.",
    headline: "NewJeans Returns to ADOR After Legal Loss",
    subheadline: "The \"Super Shy\" K-pop girl group is coming back",
    author: "Joyce Li",
    date: "Nov 12, 2025",
    likes: 945,
    comments: 0,
    image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=1200&q=80",
    alt: "NewJeans K-pop Group",
    content: "full",
    slug: "newjeans-returns-to-ador"
  },
  "streetwear-trends-dominate-2025": {
    id: 2,
    category: "Fashion.",
    headline: "Streetwear Trends Dominate 2025 Fashion Week",
    subheadline: "Urban fashion takes center stage in major runways",
    author: "Sarah Kim",
    date: "Nov 10, 2025",
    likes: 1200,
    comments: 23,
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80",
    alt: "Fashion Week",
    content: "full",
    slug: "streetwear-trends-dominate-2025"
  },
  "ai-revolutionizes-creative-industries": {
    id: 3,
    category: "Tech.",
    headline: "AI Revolutionizes Creative Industries",
    subheadline: "New tools transform how artists and designers work",
    author: "Alex Chen",
    date: "Nov 8, 2025",
    likes: 856,
    comments: 12,
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&q=80",
    alt: "AI Technology",
    content: "full",
    slug: "ai-revolutionizes-creative-industries"
  },
  "global-music-festivals-return": {
    id: 4,
    category: "Culture.",
    headline: "Global Music Festivals Return Stronger Than Ever",
    subheadline: "Post-pandemic music scene shows unprecedented growth",
    author: "Maria Garcia",
    date: "Nov 5, 2025",
    likes: 2100,
    comments: 45,
    image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&q=80",
    alt: "Music Festival",
    content: "full",
    slug: "global-music-festivals-return"
  }
};

export default function BlogDetail({ params }: { params: { slug: string } }) {
  const post = blogPosts[params.slug] || blogPosts["newjeans-returns-to-ador"];

  // Get related articles (excluding current post)
  const relatedArticles = Object.values(blogPosts)
    .filter((article: any) => article.id !== post.id)
    .slice(0, 3)
    .map((article: any) => ({
      ...article,
      slug: article.slug || Object.keys(blogPosts).find(key => blogPosts[key].id === article.id) || `article-${article.id}`
    }));

  return (
    <main className="min-h-screen bg-white">
      {/* Header Section */}
      <section className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 py-12">
        <div className="space-y-8">
          {/* Category and Title - Centered */}
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center gap-4">
              <span className="inline-block bg-green-100 text-black px-4 py-1.5 rounded-lg text-sm font-medium">
                {post.category}
              </span>
              <span className="text-sm text-gray-600">
                {post.date}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black leading-tight text-center">
              {post.headline}
            </h1>
          </div>

          {/* Main Image - Centered */}
          <div className="flex justify-center">
            <div className="relative w-full max-w-4xl aspect-[4/3] rounded-lg overflow-hidden">
              <Image
                src={post.image}
                alt={post.alt}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          </div>

          {/* Description - Centered container with text-align start */}
          <div className="flex justify-center">
            <p className="text-lg text-gray-600 leading-relaxed max-w-3xl text-left">
              {post.subheadline}
            </p>
          </div>
        </div>
      </section>

      {/* Article Content Section */}
      <section className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 py-12">
        <div className="flex justify-center">
          <div className="text-gray-700 leading-relaxed text-base md:text-lg max-w-3xl text-left">
          {params.slug === "newjeans-returns-to-ador" ? (
            <>
              <p className="mb-6">
                In a surprising turn of events, NewJeans has announced their return to ADOR (Attention Deficit of Rest) following a recent legal settlement. The popular K-pop girl group, known for hits like "Super Shy" and "Hype Boy," had been embroiled in a legal dispute that threatened to derail their career.
              </p>
              
              <p className="mb-6">
                The group's management company, ADOR, released an official statement confirming the resolution of all legal matters and the group's commitment to continue creating music together. Fans worldwide have expressed overwhelming support for the group's return.
              </p>
              
              <p className="mb-6">
                NewJeans first debuted in 2022 and quickly rose to international fame with their unique sound and style. Their music blends elements of R&B, pop, and electronic music, creating a distinct sound that has resonated with audiences globally.
              </p>
              
              <p className="mb-6">
                The group's return to ADOR marks a new chapter in their career, with plans for new music releases and international tours in the coming months. Industry insiders predict that this comeback will be one of the most anticipated in K-pop history.
              </p>
              
              <h2 className="text-2xl font-bold mb-4 mt-8 text-black">What's Next for NewJeans?</h2>
              
              <p className="mb-6">
                With the legal issues behind them, NewJeans is set to focus on what they do best: creating music and connecting with their fans. The group has hinted at new collaborations and innovative projects that will push the boundaries of K-pop.
              </p>
              
              <p className="mb-6">
                Fans can expect new music releases, music videos, and potentially a world tour as the group makes their triumphant return to the global stage.
              </p>
            </>
          ) : params.slug === "streetwear-trends-dominate-2025" ? (
            <>
              <p className="mb-6">
                The 2025 Fashion Week season has been dominated by streetwear influences, marking a significant shift in high fashion. Major designers and luxury brands have embraced urban aesthetics, blending casual comfort with high-end craftsmanship.
              </p>
              
              <p className="mb-6">
                From oversized hoodies on the runway to sneaker collaborations with luxury houses, the boundaries between streetwear and high fashion have never been more blurred. This trend reflects a broader cultural shift towards comfort and authenticity in fashion.
              </p>
              
              <h2 className="text-2xl font-bold mb-4 mt-8 text-black">The Evolution of Streetwear</h2>
              
              <p className="mb-6">
                What started as a subculture movement has now become a driving force in the fashion industry. Designers are increasingly looking to street style for inspiration, incorporating elements like graphic prints, bold colors, and relaxed silhouettes into their collections.
              </p>
              
              <p className="mb-6">
                This shift represents more than just a trend—it's a fundamental change in how we think about fashion, comfort, and self-expression in the modern world.
              </p>
            </>
          ) : params.slug === "ai-revolutionizes-creative-industries" ? (
            <>
              <p className="mb-6">
                Artificial intelligence is transforming the creative industries in unprecedented ways. From music production to graphic design, AI tools are enabling artists and creators to push the boundaries of what's possible.
              </p>
              
              <p className="mb-6">
                New tools are emerging that can assist with everything from generating initial concepts to refining final products. These technologies are not replacing human creativity, but rather augmenting it, allowing artists to explore new territories and work more efficiently.
              </p>
              
              <h2 className="text-2xl font-bold mb-4 mt-8 text-black">The Future of Creative Work</h2>
              
              <p className="mb-6">
                As AI continues to evolve, we're seeing a new generation of creative professionals who are comfortable working alongside these tools. The result is a more dynamic, innovative creative landscape where human imagination and machine intelligence work in harmony.
              </p>
            </>
          ) : (
            <>
              <p className="mb-6">
                The global music festival scene has made a remarkable comeback following the challenges of recent years. Festivals around the world are reporting record attendance and unprecedented growth, signaling a strong return to live music experiences.
              </p>
              
              <p className="mb-6">
                This resurgence reflects a pent-up demand for live entertainment and community experiences. Music lovers are eager to reconnect with artists and fellow fans in person, creating an atmosphere of celebration and unity.
              </p>
              
              <h2 className="text-2xl font-bold mb-4 mt-8 text-black">A New Era for Live Music</h2>
              
              <p className="mb-6">
                The post-pandemic music scene has evolved, with festivals incorporating new technologies, sustainability initiatives, and enhanced safety measures. These improvements are creating better experiences for attendees while setting new standards for the industry.
              </p>
              
              <p className="mb-6">
                As we look ahead, the future of music festivals appears brighter than ever, with new events emerging and established festivals expanding to meet the growing demand for live music experiences.
              </p>
            </>
          )}
          </div>
        </div>
      </section>

      {/* Related Articles Section */}
      <section className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-black mb-8">Related Articles</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {relatedArticles.map((article: any) => (
            <Link
              key={article.id}
              href={`/blog/${article.slug}`}
              className="group"
            >
              <div className="space-y-4">
                {/* Image */}
                <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden">
                  <Image
                    src={article.image}
                    alt={article.alt}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    unoptimized
                  />
                </div>
                {/* Content */}
                <div className="space-y-2">
                  <p className="text-blue-600 text-sm font-medium">{article.category}</p>
                  <h3 className="text-lg font-bold text-black group-hover:text-gray-600 transition-colors line-clamp-2">
                    {article.headline}
                  </h3>
                  <p className="text-sm text-gray-500">{article.date}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Back to Blog Link */}
      <section className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 py-8">
        <Link 
          href="/aboutus"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Blog
        </Link>
      </section>

      {/* Footer Section */}
      <Footer />
    </main>
  );
}

