'use client';

interface Product {
  id: number;
  name: string;
  price: string;
  tokens: number;
  recycledPercentage: number;
  image: string;
}

const products: Product[] = [
  {
    id: 1,
    name: 'Recycled Ocean Plastic Backpack',
    price: '$45.99',
    tokens: 920,
    recycledPercentage: 95,
    image: '/RecycleImg1.png',
  },
  {
    id: 2,
    name: 'Tire Ottoman Seat',
    price: '$89.99',
    tokens: 4800,
    recycledPercentage: 80,
    image: '/RecycleImg2.png',
  },
  {
    id: 3,
    name: 'Recycled Paper Desk Organizer',
    price: '$24.99',
    tokens: 2499,
    recycledPercentage: 100,
    image: '/RecycleImg3.png',
  },
  {
    id: 4,
    name: 'Eco Yoga Mat- Recycled Rubber',
    price: '$67.99',
    tokens: 1360,
    recycledPercentage: 100,
    image: '/YogaMat.jpeg',
  },
];

export function EcoProducts() {
  return (
    <section className="relative min-h-screen px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-16 text-center">
          <h2 className="font-space-grotesk mb-6 text-4xl font-semibold text-balance text-white md:text-5xl lg:text-6xl">
            Eco-Friendly Products
          </h2>
          <p className="font-inter secondary-text mx-auto max-w-3xl text-lg font-normal text-pretty text-gray-300 md:text-xl">
            Shop sustainable products made from recycled materials and support the cultural economy
          </p>
        </div>

        {/* Products Grid */}
        <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="shadow-border-green overflow-hidden rounded-[20px] border-[0.2px] border-[#1DE9B6] bg-black backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:transform hover:border-gray-600/50"
            >
              {/* Product Image */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={product.image || '/placeholder.svg'}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Product Info */}
              <div className="p-6">
                {/* Recycled Badge */}
                <div className="font-roboto mb-4 inline-block rounded-lg bg-white px-3 py-0 font-medium">
                  <span className="text-primary font-inter text-sm font-semibold">
                    {product.recycledPercentage}% Recycled
                  </span>
                </div>
                <h3 className="font-space-grotesk mb-4 text-lg leading-tight font-bold text-white">
                  {product.name}
                </h3>

                {/* Price and Tokens */}
                <div className="flex items-center justify-between">
                  <span className="font-space-grotesk font-inter text-xl font-medium text-white">
                    {product.price}
                  </span>
                  <div className="flex items-center gap-1">
                    {/* ECO Token Icon */}
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="text-green-500"
                    >
                      <circle cx="12" cy="12" r="10" fill="currentColor" />
                      <path
                        d="M8 12h8M12 8v8"
                        stroke="black"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="font-space-grotesk font-inter text-lg font-normal text-green-500">
                      {product.tokens.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Products Button */}
        <div className="text-center">
          <button className="font-space-grotesk font-inter inline-flex items-center gap-2 rounded-xl bg-black px-8 py-4 text-lg font-medium text-white transition-all duration-300 hover:scale-105 hover:transform hover:bg-emerald-400">
            View All Products
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}

export default EcoProducts;
