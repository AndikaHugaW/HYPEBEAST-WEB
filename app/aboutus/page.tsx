export default function AboutUs() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-4">About Us</h1>
          <p className="text-xl text-blue-100">
            Learn more about HYPEBEAST and our mission
          </p>
        </div>
      </section>

      {/* About Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-lg shadow-md p-8 md:p-12 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
          <p className="text-gray-700 text-lg leading-relaxed mb-4">
            HYPEBEAST was founded with a vision to provide premium products and
            exceptional services to our customers. We believe in quality,
            innovation, and customer satisfaction above all else.
          </p>
          <p className="text-gray-700 text-lg leading-relaxed mb-4">
            Since our inception, we have been committed to excellence in
            everything we do. Our team of experts works tirelessly to ensure
            that every product and service meets the highest standards of
            quality.
          </p>
          <p className="text-gray-700 text-lg leading-relaxed">
            We are proud to serve customers worldwide and continue to grow and
            evolve with the changing needs of our community.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
            <p className="text-gray-700 leading-relaxed">
              To deliver exceptional products and services that exceed customer
              expectations while maintaining the highest standards of quality and
              integrity.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-4xl mb-4">👁️</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
            <p className="text-gray-700 leading-relaxed">
              To become the leading provider of premium products and services,
              recognized globally for innovation, quality, and customer
              satisfaction.
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="bg-white rounded-lg shadow-md p-8 md:p-12 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Our Core Values
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">✨</div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                Quality
              </h4>
              <p className="text-gray-600">
                We never compromise on quality and always strive for excellence
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">🤝</div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                Integrity
              </h4>
              <p className="text-gray-600">
                We conduct business with honesty, transparency, and ethical
                practices
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">💡</div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                Innovation
              </h4>
              <p className="text-gray-600">
                We embrace new ideas and technologies to stay ahead of the curve
              </p>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="bg-white rounded-lg shadow-md p-8 md:p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Our Team
          </h2>
          <p className="text-gray-700 text-lg text-center mb-8">
            We are a diverse team of passionate professionals dedicated to
            delivering exceptional results. Our expertise spans across various
            industries, bringing together unique perspectives and skills.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-gradient-to-br from-blue-500 to-purple-500 rounded-full w-32 h-32 mx-auto mb-4 flex items-center justify-center text-5xl">
                👤
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                Leadership Team
              </h4>
              <p className="text-gray-600">
                Experienced leaders guiding our vision
              </p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-br from-blue-500 to-purple-500 rounded-full w-32 h-32 mx-auto mb-4 flex items-center justify-center text-5xl">
                👥
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                Development Team
              </h4>
              <p className="text-gray-600">
                Skilled developers building the future
              </p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-br from-blue-500 to-purple-500 rounded-full w-32 h-32 mx-auto mb-4 flex items-center justify-center text-5xl">
                🎨
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                Design Team
              </h4>
              <p className="text-gray-600">
                Creative minds crafting beautiful experiences
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Get in Touch
          </h2>
          <p className="text-gray-600 mb-8 text-lg">
            We'd love to hear from you. Contact us to learn more about our
            products and services.
          </p>
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            Contact Us
          </button>
        </div>
      </section>
    </main>
  );
}

