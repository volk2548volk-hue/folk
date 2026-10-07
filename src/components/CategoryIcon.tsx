import React from 'react';
import * as Icons from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
  color?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = 'w-5 h-5', color }) => {
  // Lucide has icon names matching our strings
  const IconComponent = (Icons as any)[name] || Icons.Wallet;

  return (
    <IconComponent 
      className={className} 
      style={color ? { color } : undefined} 
    />
  );
};
