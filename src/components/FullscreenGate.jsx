import React, { useEffect, useState } from 'react';

export default function FullscreenGate({ children }) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // More reliable fullscreen check
  const checkFullscreen = () => {
    const el =
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement;

    const isMaximized =
      window.innerHeight === screen.height &&
      window.innerWidth === screen.width;

    setIsFullscreen(!!el || isMaximized);
  };

  useEffect(() => {
    checkFullscreen(); // initial check

    // Watch for fullscreen mode changes
    const events = ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'msfullscreenchange'];
    events.forEach(e => document.addEventListener(e, checkFullscreen));
    window.addEventListener('resize', checkFullscreen);

    return () => {
      events.forEach(e => document.removeEventListener(e, checkFullscreen));
      window.removeEventListener('resize', checkFullscreen);
    };
  }, []);

  if (!isFullscreen) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black text-red-500 flex flex-col items-center justify-center text-center px-8">
        <h1 className="text-3xl font-bold font-mono mb-4">
          ACCESS DENIED
        </h1>
        <p className="text-lg font-mono mb-6">
          Headache OS requires fullscreen mode.<br />
          Please press <kbd className="px-2 py-1 bg-white text-black rounded">F11</kbd> or <kbd>Ctrl + Cmd + F</kbd> on Mac.
        </p>
      </div>
    );
  }

  return children;
}
