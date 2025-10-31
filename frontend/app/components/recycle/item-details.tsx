"use client"

import { useState } from "react"
import type { RecycleFormData } from "../../recycle/page"

interface ItemDetailsProps {
  formData: RecycleFormData
  updateFormData: (data: Partial<RecycleFormData>) => void
  onNext: () => void
  onBack: () => void
}

export default function ItemDetails({ formData, updateFormData, onNext, onBack }: ItemDetailsProps) {
  const [weight, setWeight] = useState(formData.weight)
  const [description, setDescription] = useState(formData.description)

  const calculateEarnings = () => {
    if (!formData.category || !weight) return { total: 0, tokens: 0 }
    const weightNum = Number.parseFloat(weight)
    const total = weightNum * formData.category.rate
    const tokens = Math.floor(total / 10) // Rough conversion
    return { total, tokens }
  }

  const calculateImpact = () => {
    if (!weight) return { co2: 0, water: 0 }
    const weightNum = Number.parseFloat(weight)
    return {
      co2: (weightNum * 2.3).toFixed(1),
      water: (weightNum * 0.5).toFixed(1),
    }
  }

  const handleContinue = () => {
    updateFormData({ weight, description })
    onNext()
  }

  const earnings = calculateEarnings()
  const impact = calculateImpact()

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white/10 blur-page rounded-2xl p-8 border border-slate-700/50">
        <div className="flex items-center mb-6">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
            <span className="text-white text-sm font-semibold">2</span>
          </div>
          <h2 className="text-lg font-medium text-info font-inter ">
            Item Details - {formData.category?.name}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Selected Category */}
            <div className="bg-white/20 blur-darker rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-white   rounded-lg flex items-center justify-center text-xl mr-4">
                  {formData.category?.icon}
                </div>
                <div>
                  <h3 className="text-white font-bold font-space-grotesk description-text text-xl">{formData.category?.name}</h3>
                  <p className="text-gray-400 text-base font-normal font-inter secondary-text mb-1">{formData.category?.description}</p>
                  <p className="text-primary text-lg font-medium">₦{formData.category?.rate}/kg</p>
                </div>
              </div>
              <button
                onClick={onBack}
                className="bg-black px-4 py-2 rounded-lg font-space-grotesk font-medium  text-white text-lg hover:bg-gray-800 transition-colors"
              >
                Change
              </button>
            </div>

            {/* Weight Input */}
            <div>
              <label className="block text-white font-space-grotesk font-medium font-lg mb-2 font-inter">Estimated Weight (kg) *</label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g., 2.5"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full  border border-white rounded-lg px-4 py-3 secondary-text font-inter font-normal  text-base focus:outline-none focus:border-green-500 transition-colors"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-white font-medium mb-2 font-inter">Description (Optional)</label>
              <textarea
                rows={4}
                placeholder="Describe your items (e.g. plastic bottles, aluminium cans, etc."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full  border border-white  rounded-lg px-4 py-3 secondary-text font-inter font-normal  text-base   focus:outline-none focus:border-green-500 transition-colors resize-none"
              />
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-white font-medium mb-2 font-inter">Add Photos (Optional)</label>
              <div className="border-2 border-dashed  rounded-xl p-8 text-center hover:border-green-500/50 transition-colors">
                <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <p className="text-gray-400 font-inter">Helps our agents verify and process faster</p>
              </div>
            </div>
          </div>

          {/* Right Column - Calculations */}
          <div className="space-y-6">
            {/* Estimated Earnings */}
            <div className="bg-white/20 blur-darker border-solid  border border-[#1DE9B633] rounded-xl p-6">
              <div className="flex items-center mb-4">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-2">
                  <span className="text-white text-xs">₦</span>
                </div>
                <h3 className="text-green-400 font-semibold font-space-grotesk">Estimated Earnings</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-300 font-inter">Total:</span>
                  <span className="text-white font-semibold">₦{earnings.total.toFixed(2)}</span>
                </div>
                <div className="text-sm text-gray-400 font-inter">≈ {earnings.tokens} ECO tokens</div>
              </div>
            </div>

            {/* Environmental Impact */}
            <div className="bg-white/20 border-solid  border border-[#1DE9B633] blur-darker rounded-xl p-6">
              <div className="flex items-center mb-4">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-2">
                  <span className="text-white text-xs">🌱</span>
                </div>
                <h3 className="text-green-400 font-semibold font-space-grotesk">Environmental Impact</h3>
              </div>
              <div className="lighter-green-text text-base font-inter font-normal">
                <div>
                  <span>CO₂ Saved:</span>
                  <span>~{impact.co2}kg</span>
                </div>
                <div>
                  <span>Water Saved:</span>
                  <span>~{impact.water}L</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={onBack}
            className="bg-black px-6 py-3 rounded-lg text-white hover:bg-gray-800 transition-colors font-inter"
          >
            Back
          </button>
          <button
            onClick={handleContinue}
            disabled={!weight}
            className="gradient-button px-6 py-3 rounded-xl text-black font-semibold hover:from-yellow-500 hover:to-green-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-inter"
          >
            Continue to Pickup →
          </button>
        </div>
      </div>
    </div>
  )
}
