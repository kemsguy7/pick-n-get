'use client';

import { useState } from 'react';

export default function PersonalInfoPage() {
  const [formData, setFormData] = useState({
    firstName: 'Leine',
    lastName: 'Medal',
    email: 'leinemedal@example.com',
    phone: '+234 800 000 0000',
    location: 'Lagos Nigeria',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="body-gradient flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500">
            <div className="h-8 w-8 rounded-lg bg-white"></div>
          </div>
          <h1 className="font-space-grotesk text-2xl font-bold text-white">Join EcoCleans</h1>
          <p className="font-inter text-gray-300">Start your sustainable journey today</p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl bg-white p-6">
          {/* Progress Header */}
          <div className="mb-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-space-grotesk text-xl font-bold text-black">Create Account</h2>
              <span className="font-inter text-sm text-gray-500">Step 2 of 3</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200">
              <div className="h-2 w-2/3 rounded-full bg-green-500"></div>
            </div>
          </div>

          {/* Personal Information Form */}
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="font-space-grotesk mb-2 text-lg font-semibold text-black">
                Personal Information
              </h3>
              <p className="font-inter text-sm text-gray-600">Tell us about yourself</p>
            </div>

            <div className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-inter mb-2 block text-sm font-medium text-black">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="font-inter w-full rounded-lg border border-gray-300 px-3 py-2 transition-colors focus:border-green-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-inter mb-2 block text-sm font-medium text-black">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="font-inter w-full rounded-lg border border-gray-300 px-3 py-2 transition-colors focus:border-green-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="font-inter mb-2 block text-sm font-medium text-black">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="font-inter w-full rounded-lg border border-gray-300 py-2 pr-3 pl-10 transition-colors focus:border-green-500 focus:outline-none"
                  />
                  <div className="absolute top-1/2 left-3 -translate-y-1/2 transform text-gray-400">
                    📧
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="font-inter mb-2 block text-sm font-medium text-black">
                  Phone Number
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="font-inter w-full rounded-lg border border-gray-300 py-2 pr-3 pl-10 transition-colors focus:border-green-500 focus:outline-none"
                  />
                  <div className="absolute top-1/2 left-3 -translate-y-1/2 transform text-gray-400">
                    📞
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="font-inter mb-2 block text-sm font-medium text-black">
                  Location
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="font-inter w-full rounded-lg border border-gray-300 py-2 pr-3 pl-10 transition-colors focus:border-green-500 focus:outline-none"
                  />
                  <div className="absolute top-1/2 left-3 -translate-y-1/2 transform text-gray-400">
                    📍
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-4">
              <button className="font-space-grotesk flex-1 rounded-xl bg-gray-200 px-4 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-300">
                Back
              </button>
              <button className="font-space-grotesk flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-500 px-4 py-3 font-semibold text-white transition-colors hover:bg-green-600">
                Continue →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
