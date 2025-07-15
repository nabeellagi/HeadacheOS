import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Icon } from '@iconify/react';

const StartMenu = () => {
  const [visible, setVisible] = useState(false);
  const [overlay, setOverlay] = useState(null); // 'sleep' | 'restart' | 'shutdown'
  const [sleepCooldown, setSleepCooldown] = useState(false);
  const menuRef = useRef();
  const sleepTimerRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.metaKey || e.ctrlKey || e.key === 'Meta' || e.key === 'Control' || e.key === 'OS') {
        setVisible((prev) => !prev);
      }
    };

    const handleUserInteraction = () => {
      if (overlay === 'sleep' && !sleepCooldown) {
        setOverlay(null);
        clearTimeout(sleepTimerRef.current);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousemove', handleUserInteraction);
    window.addEventListener('click', handleUserInteraction);
    window.addEventListener('scroll', handleUserInteraction);
    window.addEventListener('touchstart', handleUserInteraction);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousemove', handleUserInteraction);
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('scroll', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
    };
  }, [overlay, sleepCooldown]);

  useEffect(() => {
    if (visible) {
      gsap.fromTo(menuRef.current, { y: 100, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' });
    }
  }, [visible]);

  const handleSleep = () => {
    setOverlay('sleep');
    setSleepCooldown(true);
    sleepTimerRef.current = setTimeout(() => {
      setSleepCooldown(false);
    }, 12000); 
  };

  const handleRestart = () => {
    setOverlay('restart');
    setTimeout(() => location.reload(), 2000);
  };

  const handleShutdown = () => setOverlay('shutdown');

  return (
    <>
      {visible && (
        <div ref={menuRef} className="fixed bottom-0 left-0 w-full z-50 p-4 bg-base-100 shadow-xl border-t border-base-content flex flex-col items-center">
          <h1 className="text-lg font-bold mb-2">🕒 00:00 - Clock is broken</h1>
          <div className="btn-group flex flex-row gap-2">
            <button className="btn btn-outline" onClick={handleSleep}>
              <Icon icon="mdi:power-sleep" className="mr-1" /> Sleep
            </button>
            <button className="btn btn-outline" onClick={handleRestart}>
              <Icon icon="mdi:restart" className="mr-1" /> Restart
            </button>
            <button className="btn btn-outline btn-error" onClick={handleShutdown}>
              <Icon icon="mdi:power" className="mr-1" /> Shutdown
            </button>
          </div>
        </div>
      )}

      {overlay === 'sleep' && (
        <div className="fixed inset-0 z-[100] backdrop-blur-md bg-black/10"></div>
      )}

      {overlay === 'restart' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 text-white text-xl">
          Restarting...
        </div>
      )}

      {overlay === 'shutdown' && (
        <div className="fixed inset-0 z-[100] bg-black"></div>
      )}
    </>
  );
};

export default StartMenu;
