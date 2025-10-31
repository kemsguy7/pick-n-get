interface StepIndicatorProps {
  currentStep: number
}

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  const steps = [
    { number: 1, label: "Select Category" },
    { number: 2, label: "Item Details" },
    { number: 3, label: "Pickup Schedule" },
    { number: 4, label: "Confirmation" },
  ]

  return (
    <div className="flex items-center justify-center space-x-4 md:space-x-8">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          {/* Step Circle */}
          <div className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-normal font-inter transition-colors ${
                step.number <= currentStep ? "bg-[#DCFCE7] text-primary" : "bg-white secondary-text"
              }`}
            >
              {step.number <= currentStep ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                step.number
              )}
            </div>
            <span
              className={`ml-2  font-normal text-base font-inter hidden md:block ${
                step.number <= currentStep ? "text-primary" : "secondary-text"
              }`}
            >
              {step.label}
            </span>
          </div>

          {/* Arrow */}
          {index < steps.length - 1 && (
            <svg className="w-5 h-5 text-gray-400 mx-2 md:mx-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
      ))}
    </div>
  )
}
