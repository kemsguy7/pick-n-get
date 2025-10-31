import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface StatCardProps {
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  title: string;
  titleColor: string;
  value: string | number;
  valueColor: string;
  subtitle?: string;
  subtitleColor?: string;
  backgroundColor: string;
  borderColor?: string;
  trend?: {
    value: string;
    color: string;
    icon?: LucideIcon;
  };
}

export default function StatCard({
  icon: Icon,
  iconColor,
  iconBgColor,
  title,
  titleColor,
  value,
  valueColor,
  subtitle,
  subtitleColor = 'text-gray-500',
  backgroundColor,
  borderColor,
  trend,
}: StatCardProps) {
  return (
    <div
      className={`${backgroundColor} ${borderColor ? `border ${borderColor}` : ''} rounded-2xl p-4 transition-all duration-200 hover:shadow-lg lg:p-6`}
    >
      <div className="space-around mb-3 flex items-center justify-between">
        <div className={`${titleColor} font-inter text-sm font-normal`}>{title}</div>
        <div className={`h-5 w-5 ${iconBgColor} flex items-center justify-center rounded-full p-1`}>
          <Icon className={`h-3 w-3 ${iconColor}`} />
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className={`font-space-grotesk text-2xl font-bold ${valueColor}`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {subtitle && (
            <p className={`${subtitleColor} font-inter mt-1 text-sm font-normal`}>{subtitle}</p>
          )}
        </div>

        {trend && (
          <div className={`flex items-center gap-1 ${trend.color} font-inter text-xs`}>
            {trend.icon && <trend.icon className="h-3 w-3" />}
            {trend.value}
          </div>
        )}
      </div>
    </div>
  );
}
