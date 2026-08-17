import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', onClick }) => {
  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  };

  return (
    <Link
      to="/"
      onClick={handleClick}
      className={`inline-flex items-center group shrink-0 select-none font-black tracking-tight ${textSizes[size]} text-white hover:opacity-90 transition-opacity cursor-pointer ${className}`}
      aria-label="MovieHub Home"
    >
      <span>Movie</span>
      <span className="text-red-500 group-hover:text-red-400 transition-colors">Hub</span>
    </Link>
  );
};
