import React, { useEffect, useState } from 'react';
import '../../assets/app.css';

export default function WallpaperWrapper({ children }) {
  const [bgUrl, setBgUrl] = useState('');

  const generateBg = () => {
    const seed = Math.random().toString(36).substring(2, 10);
    const timestamp = Date.now();
    return `https://picsum.photos/seed/${seed}/1920/1080?cache-bust=${timestamp}`;
  };

  useEffect(() => {
    setBgUrl(generateBg());

    const handler = () => {
      // Listen for a custom event to change wallpaper manually
      setBgUrl(generateBg());
    };

    window.addEventListener('wallpaper:change', handler);
    return () => window.removeEventListener('wallpaper:change', handler);
  }, []);

  return (
    <div className="relative w-full h-full">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center opacity-80 blur-[1px]"
        style={{ backgroundImage: `url(${bgUrl})` }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
