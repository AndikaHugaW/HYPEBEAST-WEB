export default function Service() {
  const services = [
    {
      id: 1,
      title: "Consultation Services",
      description:
        "Expert consultation to help you make the best decisions for your business",
      icon: "💡",
      features: [
        "One-on-one consultation",
        "Customized solutions",
        "Expert advice",
      ],
    },
    {
      id: 2,
      title: "Design & Development",
      description:
        "Professional design and development services tailored to your needs",
      icon: "🎨",
      features: [
        "Custom design",
        "Modern development",
        "Quality assurance",
      ],
    },
    {
      id: 3,
      title: "Support & Maintenance",
      description:
        "Ongoing support and maintenance to keep everything running smoothly",
      icon: "🔧",
      features: [
        "24/7 support",
        "Regular updates",
        "Technical assistance",
      ],
    },
    {
      id: 4,
      title: "Training & Workshops",
      description:
        "Comprehensive training programs to enhance your team's skills",
      icon: "📚",
      features: [
        "Interactive workshops",
        "Expert trainers",
        "Certification programs",
      ],
    },
    {
      id: 5,
      title: "Analytics & Reporting",
      description:
        "Detailed analytics and reporting to track your progress and success",
      icon: "📊",
      features: [
        "Real-time analytics",
        "Custom reports",
        "Data insights",
      ],
    },
    {
      id: 6,
      title: "Custom Solutions",
      description:
        "Bespoke solutions designed specifically for your unique requirements",
      icon: "⚙️",
      features: [
        "Tailored solutions",
        "Scalable architecture",
        "Future-proof design",
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Services</h1>
          <p className="text-gray-600 text-lg">
            Comprehensive services to meet all your needs
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="text-5xl mb-4">{service.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {service.title}
              </h3>
              <p className="text-gray-600 mb-4">{service.description}</p>
              <ul className="space-y-2 mb-6">
                {service.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-gray-700">
                    <span className="text-green-500 mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Learn More
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Contact us today to discuss your needs
          </p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Contact Us
          </button>
        </div>
      </section>
    </main>
  );
}

