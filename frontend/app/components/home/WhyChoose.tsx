export default function WhyChoose() {
  const features = [
    {
      id: 1,
      icon: (
        <svg
          className="h-8 w-8 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      title: 'Verified & Secure',
      description: 'All agents are verified and transactions are secured by blockchain technology',
    },
    {
      id: 2,
      icon: (
        <svg
          className="h-8 w-8 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          />
        </svg>
      ),
      title: 'Real-Time Pricing',
      description: 'Dynamic pricing based on market rates and location-specific multipliers',
    },
    {
      id: 3,
      icon: (
        <svg
          className="h-8 w-8 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      title: 'Multi-Country Support',
      description: 'Operating across 6 African countries with local currency support',
    },
    {
      id: 4,
      icon: (
        <svg
          className="h-8 w-8 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
      ),
      title: 'Instant Rewards',
      description: 'Get paid immediately in ECO tokens that you can use or convert to fiat.',
    },
  ];

  return (
    <section className="min-h-screen px-4 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-16">
          <h2 className="font-space-grotesk mb-6 text-4xl font-semibold text-balance text-white md:text-5xl lg:text-6xl">
            Why Choose Pick-n-Get?
          </h2>
          <p className="secondary-text max-w-2xl text-lg font-normal text-pretty text-gray-300 md:text-xl">
            We're revolutionizing waste management across Africa with cutting-edge Web3 technology"
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left Column - Features */}
          <div className="space-y-8">
            {/* Dynamic Features */}
            {features.map((feature) => (
              <div key={feature.id} className="flex items-start gap-4">
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-green-100">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-space-grotesk mb-2 text-xl font-bold text-white">
                    {feature.title}
                  </h3>
                  <p className="secondary-text font-inter leading-relaxed font-normal text-gray-400">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}

            {/* CTA Button */}
            <div className="pt-8">
              <button className="gradient-button font-space-grotesk flex transform items-center gap-2 rounded-lg px-8 py-3 text-lg font-medium text-black transition-all duration-300 hover:scale-105 hover:shadow-lg">
                Get Started Today
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Right Column - Dashboard */}
          <div className="footer-gradient footer-theme-shadow space-y-6 rounded-3xl p-6">
            {/* Real-time Badge */}
            <div className="flex justify-end">
              <span className="text-primary font-roboto rounded-lg border border-black bg-[#1ED76033] px-3 text-sm font-medium">
                Real - time
              </span>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* CO2 Prevented Card */}
              <div className="flex flex-col items-center justify-center rounded-2xl bg-white/10 p-6 backdrop-blur-sm hover:border hover:border-gray-700">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20">
                  <svg
                    className="h-6 w-6 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                    />
                  </svg>
                </div>
                <div className="font-space-grotesk mb-3 text-2xl font-bold text-white">89,340</div>
                <div className="md:text-md font-inter secondary-text text-sm text-gray-400">
                  kg CO₂ Prevented
                </div>
              </div>

              {/* Trees Equivalent Card */}
              <div className="flex flex-col items-center rounded-2xl border border-gray-700 bg-white/10 p-6 backdrop-blur-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/20">
                  <svg
                    className="h-6 w-6 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    />
                  </svg>
                </div>
                <div className="font-space-grotesk mb-4 text-2xl font-bold text-white">1247</div>
                <div className="font-inter secondary-text md:text-md text-sm font-normal text-gray-400">
                  Trees Equivalent
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="rounded-2xl border border-gray-700 p-6">
              <h4 className="font-inter mb-4 font-normal text-white">Recent Activity</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-xl bg-white/10 px-3 py-6 backdrop-blur-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-500/20">
                    <svg
                      className="h-4 w-4 text-yellow-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                      />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-300">Milestone reached this month</span>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-white/10 px-3 py-6 backdrop-blur-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20">
                    <svg
                      className="h-4 w-4 text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-300">Growing community</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
