import type React from 'react';

interface StepCardProps {
  stepNumber: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  iconBgColor: string;
}

const StepCard: React.FC<StepCardProps> = ({
  stepNumber,
  title,
  description,
  icon,
  iconBgColor,
}) => {
  return (
    <div className="border-shiny-green backdrop-blur-custom relative flex w-full flex-col items-center rounded-2xl border bg-black p-8 text-center duration-300 hover:scale-105 hover:transform">
      <div className="relative">
        {/* Step Number Badge */}
        <div className="font-space-grotesk absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#1E2A28] text-sm font-medium text-white">
          {stepNumber}
        </div>
        {/* Icon */}
        <div
          className={`${iconBgColor} mb-6 flex h-16 w-16 items-center justify-center rounded-2xl p-4`}
        >
          {icon}
        </div>
      </div>

      {/* Title */}
      <h3 className="font-space-grotesk mb-4 text-xl leading-tight font-semibold text-white">
        {title}
      </h3>

      {/* Description */}
      <p className="font-inter text-sm leading-relaxed" style={{ color: 'var(--secondary-text)' }}>
        {description}
      </p>
    </div>
  );
};

export const HowTO: React.FC = () => {
  const steps = [
    {
      stepNumber: '01',
      title: 'Submit Waste',
      description: 'Upload photos of your recyclable items and get instant price estimates',
      iconBgColor: 'bg-green-500',
      icon: (
        <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V19H17V6H7Z" />
          <path d="M9 8V17H11V8H9ZM13 8V17H15V8H13Z" />
          <circle cx="12" cy="12" r="1.5" fill="white" />
          <path d="M16.5 7.5L17.5 6.5L19 8L17.5 9.5L16.5 8.5" />
        </svg>
      ),
    },
    {
      stepNumber: '02',
      title: 'Get Picked Up',
      description: 'Our verified agents collect your items from your location',
      iconBgColor: 'bg-blue-500',
      icon: (
        <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18 8H20L22 12V16H20.5C20.5 17.66 19.16 19 17.5 19S14.5 17.66 14.5 16H9.5C9.5 17.66 8.16 19 6.5 19S3.5 17.66 3.5 16H2V12L4 8H6V6C6 4.89 6.89 4 8 4H16C17.11 4 18 4.89 18 6V8M16 6H8V8H16V6M17.5 17C18.05 17 18.5 16.55 18.5 16S18.05 15 17.5 15 16.5 15.45 16.5 16 16.95 17 17.5 17M6.5 17C7.05 17 7.5 16.55 7.5 16S7.05 15 6.5 15 5.5 15.45 5.5 16 5.95 17 6.5 17Z" />
        </svg>
      ),
    },
    {
      stepNumber: '03',
      title: 'Earn Tokens',
      description: 'Receive ECO tokens directly to your wallet based on weight and type',
      iconBgColor: 'bg-yellow-500',
      icon: (
        <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2Z" />
          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" fill="none" />
          <circle cx="12" cy="12" r="4" fill="currentColor" />
          <circle cx="8" cy="8" r="2" fill="currentColor" />
          <circle cx="16" cy="8" r="2" fill="currentColor" />
          <circle cx="8" cy="16" r="2" fill="currentColor" />
        </svg>
      ),
    },
    {
      stepNumber: '04',
      title: 'Shop & Spend',
      description: 'Use tokens to buy eco-products or pay bills through our platform',
      iconBgColor: 'bg-purple-500',
      icon: (
        <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 7H18V6C18 3.79 16.21 2 14 2H10C7.79 2 6 3.79 6 6V7H5C3.9 7 3 7.9 3 9V20C3 21.1 3.9 22 5 22H19C20.1 22 21 21.1 21 20V9C21 7.9 20.1 7 19 7ZM10 4H14C15.1 4 16 4.9 16 6V7H8V6C8 4.9 8.9 4 10 4ZM19 20H5V9H19V20ZM12 12C10.9 12 10 12.9 10 14S10.9 16 12 16 14 15.1 14 14 13.1 12 12 12Z" />
        </svg>
      ),
    },
  ];

  return (
    <section className="px-4 py-16">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="font-space-grotesk description-text mb-3 text-3xl font-semibold text-balance md:text-5xl">
            How Pick-n-Get Works
          </h1>
          <p className="font-inter secondary-text mx-auto leading-relaxed font-light text-balance">
            Simple steps to start earning your recyclable waste while making a positive
            environmental impact
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 justify-items-center gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <StepCard
              key={index}
              stepNumber={step.stepNumber}
              title={step.title}
              description={step.description}
              icon={step.icon}
              iconBgColor={step.iconBgColor}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
