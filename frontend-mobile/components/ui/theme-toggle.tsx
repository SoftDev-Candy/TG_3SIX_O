'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sun } from 'lucide-react';

export function ThemeToggle() {
  const [isLightMode, setIsLightMode] = useState(true);

  useEffect(() => {
    // Force light mode during development
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
    setIsLightMode(true);
  }, []);

  // Disabled toggle for development - always light mode
  const handleClick = () => {
    // Keep in light mode for now
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
    setIsLightMode(true);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      className="w-9 h-9 opacity-50 cursor-not-allowed"
      aria-label="Light mode (dark mode disabled during development)"
      disabled
    >
      <Sun className="h-4 w-4" />
    </Button>
  );
}
