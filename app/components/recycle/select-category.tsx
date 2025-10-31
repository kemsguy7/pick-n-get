"use client"

import type { RecycleFormData } from "../../recycle/page"
import Image from 'next/image'
import  RecycleIcon  from "../../../public/icons/RecycleIcon.svg"


interface SelectCategoryProps {
  formData: RecycleFormData
  updateFormData: (data: Partial<RecycleFormData>) => void
  onNext: () => void
}

const categories = [
  {
    id: "plastic",
    name: "Plastic Bottles & Containers",
    icon: "♻️",
    rate: 120,
    description: "PET bottles, plastic containers, and packaging materials",
    examples: ["Mobile phones", "Soda bottles", "Food containers", "+more"],
  },
  {
    id: "metal",
    name: "Metal & Iron Scrap",
    icon: "🎁",
    rate: 180,
    description: "Aluminium cans, iron scraps, and metal containers",
    examples: ["Aluminium cans", "Iron sheets", "Metal pipes", "+more"],
  },
  {
    id: "glass",
    name: "Glass Bottles & Jars",
    icon: "🍶",
    rate: 110,
    description: "Glass bottles, jars, and containers",
    examples: ["Beer bottles", "Wine bottles", "Jam bottles", "+more"],
  },
  {
    id: "electronic",
    name: "Electronic Waste",
    icon: "📱",
    rate: 280,
    description: "Old phones, computers, and electronic devices",
    examples: ["Mobile phones", "Laptops", "Batteries", "+more"],
  },
  {
    id: "paper",
    name: "Paper & Cardboard",
    icon: "📄",
    rate: 50,
    description: "Newspapers, magazines, and cardboard boxes",
    examples: ["Newspapers", "Magazines", "Cardboard boxes", "+more"],
  },
  {
    id: "textile",
    name: "Textiles & Clothing",
    icon: "👕",
    rate: 70,
    description: "Old clothes, fabrics, and textile materials",
    examples: ["Old clothes", "Bed sheets", "Curtains", "+more"],
  },
]

export default function SelectCategory({  updateFormData, onNext }: SelectCategoryProps) {
  const handleCategorySelect = (category: (typeof categories)[0]) => {
    updateFormData({ category })
    setTimeout(onNext, 300) // Small delay for visual feedback
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white/10  blur-page rounded-2xl p-8 hover:border hover:border-slate-700/50">
        <div className="flex items-center mb-1">
          <div className="w-8 h-8  rounded-full flex items-center justify-center mr-3">
            <Image src={RecycleIcon} alt="Recycle" className="w-4 h-4" />
          </div>
          <h2 className="text-lg font-medium text-primary font-inter">Choose recycling category</h2>
        </div>

        <p className="text-gray-300 mb-8 font-normal text-md font-inter secondary-text ">
          Select the type of materials you want to recycle. Each category has different rates and requirements.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategorySelect(category)}
              className="bg-black/80 rounded-2xl p-6 border border-slate-600/50 hover:border-green-500/50 transition-all duration-200 hover:bg-black/90 text-left group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center text-xl">
                  {category.icon}
                </div>
                <div className="bg-[#D9D9D93D] px-2  rounded-md  text-sm text-gray-300">₦{category.rate}/kg</div>
              </div>

              <h3 className=" description-text font-bold mb-4 group-hover:text-green-400 text-lg  transition-colors font-space-grotesk">
                {category.name}
              </h3>

              <p className="text-gray-400 text-base mb-4 secondary-text font-inter">{category.description}</p>

              <div className="space-y-2">
                <p className="secondary-text text-sm font-inter">Examples:</p>
                <div className="flex flex-wrap font-medium  font-roboto gap-2">
                  {category.examples.map((example, index) => (
                    <span key={index} className="bg-transparent border border-[#D9D9D933] px-2  rounded text-gray-300">
                      {example}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
