export default function Products() {
  const products = [
    {
      id: 1,
      name: "Premium Product 1",
      description: "High-quality product designed for excellence",
      price: "$99.99",
      image: "🛍️",
    },
    {
      id: 2,
      name: "Premium Product 2",
      description: "Innovative solution for your needs",
      price: "$149.99",
      image: "📦",
    },
    {
      id: 3,
      name: "Premium Product 3",
      description: "Top-tier quality guaranteed",
      price: "$199.99",
      image: "🎁",
    },
    {
      id: 4,
      name: "Premium Product 4",
      description: "Professional grade product",
      price: "$249.99",
      image: "💼",
    },
    {
      id: 5,
      name: "Premium Product 5",
      description: "Elite performance and durability",
      price: "$299.99",
      image: "🏆",
    },
    {
      id: 6,
      name: "Premium Product 6",
      description: "Cutting-edge technology",
      price: "$349.99",
      image: "⚡",
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Products</h1>
          <p className="text-gray-600 text-lg">
            Discover our wide range of premium products
          </p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-12 text-center">
                <div className="text-6xl">{product.image}</div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {product.name}
                </h3>
                <p className="text-gray-600 mb-4">{product.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-blue-600">
                    {product.price}
                  </span>
                  <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

