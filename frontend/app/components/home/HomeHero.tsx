'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Recycle, Play, Coins, TreePine } from 'lucide-react';

interface CounterProps {
  end: number;
  duration?: number;
  suffix?: string;
  isVisible: boolean;
}

const Counter: React.FC<CounterProps> = ({ end, duration = 2000, suffix = '', isVisible }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(end * easeOutCubic));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [end, duration, isVisible]);

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  return (
    <span className="font-space-grotesk font-bold text-2xl sm:text-3xl lg:text-[28px] leading-9 text-white">
      {formatNumber(count)}{suffix}
    </span>
  );
};

const HomeHero: React.FC = () => {
  const [isStatsVisible, setIsStatsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsStatsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const stats = [
    { value: 125420, label: 'Kg Recycled' },
    { value: 15680, label: 'Active Users' },
    { value: 6, label: 'Countries' }
  ];

  return (
    <section className="min-h-screen bg-dark-bg text-white overflow-hidden">
      <div className="mx-auto md:mx-[7rem] px-4 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          
          {/* Left Section */}
          <div className="space-y-8 lg:space-y-10">
            
            {/* Badge */}
            <div 
              className="inline-flex items-center gap-3 py-2 px-2  rounded-lg animate-fade-in-up
              bg-[#1DE9B666] border border-[#1DE9B699]"
            >
              <Recycle className="w-4 h-4 text-primary-green" />
              <span className="font-inter  text-sm leading-5 tracking-wide text-white">
                Web3 Recycling Revolution
              </span>
            </div>

            {/* Main Heading */}
            <div className="animate-fade-in-up animation-delay-200">
              <h1 className="font-space-grotesk font-bold text-4xl sm:text-5xl lg:text-[56px] leading-tight lg:leading-[56px] tracking-wide">
                <span className="text-white block">Turn Your</span>
                <span className="text-primary-yellow block mt-2">Waste into Wealth</span>
              </h1>
            </div>

            {/* Description */}
            <p 
              className="font-inter text-base sm:text-lg leading-6 max-w-2xl animate-fade-in-up animation-delay-400"
              style={{ color: 'var(--color-description-text)' }}
            >
              Join Africa's first Web3 recycling platform. Earn ECO tokens for every 
              kilogram you recycle, shop sustainable products, and help build a circular 
              economy that benefits everyone.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 animate-fade-in-up animation-delay-600">
              <button className="
                gradient-button font-space-grotesk font-medium text-lg leading-6
                px-3 py-4 rounded-xl text-black hover:shadow-xl
                transform hover:scale-105 transition-all duration-300
                flex items-center justify-center gap-3 min-w-[200px]
              ">
                <Recycle className="w-5 h-5" />
                Start Recycle Now
              </button>
              
              <button className="
                bg-black font-space-grotesk font-medium text-lg leading-6
                px-3 py-4 rounded-xl text-white hover:border hover:border-gray-700
                hover:bg-gray-900 transform hover:scale-105 transition-all duration-300
                flex items-center justify-center gap-3 min-w-[180px]
              ">
                <Play className="w-5 h-5" />
                Watch Demo
              </button>
            </div>

            {/* Stats */}
            <div 
              ref={statsRef}
              className="grid grid-cols-3 gap-8 pt-12 lg:pt-16 animate-fade-in-up animation-delay-800"
            >
              {stats.map((stat, index) => (
                <div 
                  key={index} 
                  className="text-center sm:text-left transform hover:scale-105 transition-transform duration-300"
                >
                  <Counter 
                    end={stat.value} 
                    isVisible={isStatsVisible}
                  />
                  <p className="font-inter font-light leading-6 secondary-text mt-2">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Section - Dashboard */}
          <div className="animate-fade-in-left animation-delay-400">
            <div 
              className="rounded-2xl p-6 lg:p-8 border  bg-[#1DE9B61A]  border-[#A5D6A780]  backdrop-blur-sm relative overflow-hidden"
              
            >
              
              {/* Header */}
              <div className="flex items-center  justify-between mb-8">
                <h2 className="font-space-grotesk font-bold text-xl lg:text-2xl leading-7 tracking-wide text-white">
                  Your Impact Dashboard
                </h2>
                <span className="bg-primary-green text-black px-3 font-roboto rounded-md text-sm font-medium animate-pulse">
                  LIVE
                </span>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div 
                  className="rounded-lg p-3 card-bg z-50  transform hover:scale-105 transition-all duration-300"
                  
                >
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <Coins className="w-6 h-6 text-primary-yellow" />
                  </div>
                  <div className="font-space-grotesk text-center  font-bold text-2xl lg:text-[28px] leading-9 text-white mb-1">
                    2,450
                  </div>
                  <div 
                    className="font-inter text-center font-normal text-base leading-6 secondary-text"
                   
                  >
                    ECO Tokens
                  </div>
                </div>

                <div 
                  className="rounded-lg p-4  card-bg transform hover:scale-105 transition-all duration-300 relative"
                  
                >
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <TreePine className="w-6 h-6 text-primary-green" />
                  </div>
                  <div className="font-space-grotesk text-center font-bold text-2xl lg:text-[28px] leading-9 text-white mb-1">
                    13.4kg
                  </div>
                  <div 
                    className="font-inter text-center font-normal text-base leading-6 secondary-text"                >
                    CO₂ Saved
                  </div>
                  <div className="absolute top-4 right-4 text-primary-green text-sm font-medium">
                    +15 ECO
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h3 
                  className="font-inter text-base leading-6 mb-4"
                  style={{ color: 'var(--color-secondary-text)' }}
                >
                  Recent Activity
                </h3>
                <div 
                  className="card-bg p-2  rounded-lg lg:p-2 transform hover:scale-105 transition-all duration-300"
                 
                >
                  <div className="flex items-start gap-4  p-3 ">
                    <div className="w-10 h-5 flex items-center  justify-center my-auto  flex-shrink-0">
                      <Recycle className="w-5 h-5 text-[#text-primary]" />
                    </div>
                    <div className="flex-1 ">
                      <div className="font-inter text-base leading-6 text-white mb-1">
                        Plastic bottles collected
                      </div>
                      <div 
                        className="font-inter text-sm leading-5 tracking-wide  font-normal  secondary-text"
                      >
                        5.3kg • Victoria Island
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full blur-xl animate-float" style={{ backgroundColor: 'rgba(255, 213, 79, 0.2)' }}></div>
              <div className="absolute -bottom-6 -left-6 w-16 h-16 rounded-full blur-lg animate-float-delayed" style={{ backgroundColor: 'rgba(29, 215, 96, 0.2)' }}></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeHero;