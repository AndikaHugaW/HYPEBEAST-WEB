import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";

export default function AboutUs() {
  const featuredPosts = [
    {
      id: 1,
      title: "Revolutionizing industries through SaaS implementation",
      thumbnail: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&q=80",
    },
    {
      id: 2,
      title: "Synergizing saas and UX design for elevating digital experiences",
      thumbnail: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&q=80",
    },
    {
      id: 3,
      title: "Navigating saas waters with intuitive UI and UX",
      thumbnail: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80",
    },
    {
      id: 4,
      title: "Sculpting saas success - the art of UI and UX design",
      thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&q=80",
    },
    {
      id: 5,
      title: "Transforming saas platforms - a UI/UX design odyssey",
      thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80",
    },
  ];

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 py-8 md:py-12">
        <div className="grid lg:grid-cols-3 gap-8 items-stretch">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 flex">
            <div className="relative rounded-2xl overflow-hidden w-full h-full min-h-[350px] md:min-h-[400px]">
              {/* Background Image */}
              <div className="absolute inset-0">
                <Image
                  src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80"
                  alt="Blog Post"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>

              {/* Semi-transparent white/grey overlay at bottom (approximately 1/3 of height) */}
              <div className="absolute bottom-0 left-0 right-0 h-[35%] backdrop-blur-md">
                {/* Content inside overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 lg:p-10 z-10">
                  {/* Category Tag */}
                  <div className="mb-4">
                    <span className="inline-block bg-transparent text-white px-4 py-1.5 rounded-full text-xs font-semibold border border-white">
                      Business
                    </span>
                  </div>

                  {/* Headline - Split into 2 lines */}
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                    <span className="block">Unlocking Business</span>
                    <span className="block">Efficiency with SaaS Solutions</span>
                  </h1>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Right Side */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Other featured posts</h2>
            <div className="space-y-6">
              {featuredPosts.map((post) => (
                <Link
                  key={post.id}
                  href="#"
                  className="block group"
                >
                  <div className="flex gap-4">
                    {/* Thumbnail */}
                    <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                      <Image
                        src={post.thumbnail}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        unoptimized
                      />
                    </div>

                    {/* Text */}
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900 leading-snug group-hover:text-gray-600 transition-colors">
                        {post.title}
                      </h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Article Section */}
      <section className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 py-12">
        <div className="grid lg:grid-cols-3 gap-0">
          {/* Article 1 */}
          <div className="flex gap-4 lg:gap-6 items-center pr-6 lg:pr-8">
            {/* Image Content */}
            <div className="relative w-32 h-32 lg:w-40 lg:h-40 flex-shrink-0 rounded-lg overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=1200&q=80"
                alt="NewJeans K-pop Group"
                fill
                className="object-cover"
                unoptimized
              />
            </div>

            {/* Text Content */}
            <div className="flex-1 space-y-2 min-w-0">
              {/* Category */}
              <div className="space-y-0.5">
                <h2 className="text-xl md:text-2xl font-bold text-black">K-Pop</h2>
                <p className="text-blue-600 text-xs font-medium">Music.</p>
              </div>

              {/* Headline */}
              <h1 className="text-base md:text-lg font-bold text-black leading-tight line-clamp-2">
                NewJeans Returns to ADOR After Legal Loss
              </h1>

              {/* Sub-headline */}
              <p className="text-xs text-gray-600 line-clamp-2">
                The "Super Shy" K-pop girl group is coming back
              </p>

              {/* Author and Date */}
              <p className="text-xs text-gray-500">
                By Joyce Li / Nov 12, 2025
              </p>

              {/* Engagement Metrics */}
              <div className="flex items-center gap-3 pt-1">
                <div className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.834a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                  </svg>
                  <span className="text-xs text-gray-600">945</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="text-xs text-gray-600">0</span>
                </div>
              </div>
            </div>
          </div>

          {/* Article 2 */}
          <div className="flex gap-4 lg:gap-6 items-center px-6 lg:px-8">
            {/* Image Content */}
            <div className="relative w-32 h-32 lg:w-40 lg:h-40 flex-shrink-0 rounded-lg overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80"
                alt="Fashion Week"
                fill
                className="object-cover"
                unoptimized
              />
            </div>

            {/* Text Content */}
            <div className="flex-1 space-y-2 min-w-0">
              {/* Category */}
              <div className="space-y-0.5">
                <h2 className="text-xl md:text-2xl font-bold text-black">Fashion</h2>
                <p className="text-blue-600 text-xs font-medium">Style.</p>
              </div>

              {/* Headline */}
              <h1 className="text-base md:text-lg font-bold text-black leading-tight line-clamp-2">
                Streetwear Trends Dominate 2025 Fashion Week
              </h1>

              {/* Sub-headline */}
              <p className="text-xs text-gray-600 line-clamp-2">
                Urban fashion takes center stage in major runways
              </p>

              {/* Author and Date */}
              <p className="text-xs text-gray-500">
                By Sarah Kim / Nov 10, 2025
              </p>

              {/* Engagement Metrics */}
              <div className="flex items-center gap-3 pt-1">
                <div className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.834a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                  </svg>
                  <span className="text-xs text-gray-600">1.2k</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="text-xs text-gray-600">23</span>
                </div>
              </div>
            </div>
          </div>

          {/* Article 3 */}
          <div className="flex gap-4 lg:gap-6 items-center pl-6 lg:pl-8">
            {/* Image Content */}
            <div className="relative w-32 h-32 lg:w-40 lg:h-40 flex-shrink-0 rounded-lg overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&q=80"
                alt="AI Technology"
                fill
                className="object-cover"
                unoptimized
              />
            </div>

            {/* Text Content */}
            <div className="flex-1 space-y-2 min-w-0">
              {/* Category */}
              <div className="space-y-0.5">
                <h2 className="text-xl md:text-2xl font-bold text-black">Tech</h2>
                <p className="text-blue-600 text-xs font-medium">Innovation.</p>
              </div>

              {/* Headline */}
              <h1 className="text-base md:text-lg font-bold text-black leading-tight line-clamp-2">
                AI Revolutionizes Creative Industries
              </h1>

              {/* Sub-headline */}
              <p className="text-xs text-gray-600 line-clamp-2">
                New tools transform how artists and designers work
              </p>

              {/* Author and Date */}
              <p className="text-xs text-gray-500">
                By Alex Chen / Nov 8, 2025
              </p>

              {/* Engagement Metrics */}
              <div className="flex items-center gap-3 pt-1">
                <div className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.834a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                  </svg>
                  <span className="text-xs text-gray-600">856</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="text-xs text-gray-600">12</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Article Detail Section */}
      <section className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 py-12">
        <div className="space-y-12">
          {[
            {
              id: 1,
              slug: "newjeans-returns-to-ador",
              category: "Music.",
              headline: "NewJeans Returns to ADOR After Legal Loss",
              subheadline: "The \"Super Shy\" K-pop girl group is coming back",
              author: "By Joyce Li / Nov 12, 2025",
              likes: 945,
              comments: 0,
              image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=1200&q=80",
              alt: "NewJeans K-pop Group"
            },
            {
              id: 2,
              slug: "streetwear-trends-dominate-2025",
              category: "Fashion.",
              headline: "Streetwear Trends Dominate 2025 Fashion Week",
              subheadline: "Urban fashion takes center stage in major runways",
              author: "By Sarah Kim / Nov 10, 2025",
              likes: 1200,
              comments: 23,
              image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80",
              alt: "Fashion Week"
            },
            {
              id: 3,
              slug: "ai-revolutionizes-creative-industries",
              category: "Tech.",
              headline: "AI Revolutionizes Creative Industries",
              subheadline: "New tools transform how artists and designers work",
              author: "By Alex Chen / Nov 8, 2025",
              likes: 856,
              comments: 12,
              image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&q=80",
              alt: "AI Technology"
            },
            {
              id: 4,
              slug: "global-music-festivals-return",
              category: "Culture.",
              headline: "Global Music Festivals Return Stronger Than Ever",
              subheadline: "Post-pandemic music scene shows unprecedented growth",
              author: "By Maria Garcia / Nov 5, 2025",
              likes: 2100,
              comments: 45,
              image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&q=80",
              alt: "Music Festival"
            }
          ].map((article, index, array) => (
            <Link key={article.id} href={`/blog/${article.slug}`} className={`block grid lg:grid-cols-12 gap-8 lg:gap-12 items-stretch ${index !== array.length - 1 ? 'pb-12 border-b border-gray-300' : ''}`}>
              {/* Text Content - Left Side */}
              <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  {/* Sub-category aligned with top of image */}
                  <div>
                    <p className="text-blue-600 text-sm font-medium">{article.category}</p>
                  </div>

                  {/* Headline */}
                  <h1 className="text-lg md:text-xl lg:text-2xl font-normal text-black leading-tight">
                    {article.headline}
                  </h1>

                  {/* Sub-headline */}
                  <p className="text-base text-gray-600">
                    {article.subheadline}
                  </p>

                  {/* Author and Date */}
                  <p className="text-sm text-gray-500">
                    {article.author}
                  </p>
                </div>

                {/* Engagement Metrics - Aligned with image height */}
                <div className="flex items-center gap-6 pt-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.834a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                    </svg>
                    <span className="text-sm text-gray-600">{article.likes}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="text-sm text-gray-600">{article.comments}</span>
                  </div>
                </div>
              </div>

              {/* Image Content - Right Side */}
              <div className="lg:col-span-7 relative w-full h-full min-h-[500px] lg:min-h-[600px] overflow-hidden">
                <Image
                  src={article.image}
                  alt={article.alt}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer Section */}
      <Footer />
    </main>
  );
}

