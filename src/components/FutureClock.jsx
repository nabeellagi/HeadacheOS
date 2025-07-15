import React, { useEffect, useRef } from 'react';
import { Application, Text } from 'pixi.js';
import gsap from 'gsap';

const romanize = (num) => {
  const lookup = {
    M: 1000, CM: 900, D: 500, CD: 400, C: 100,
    XC: 90, L: 50, XL: 40, X: 10,
    IX: 9, V: 5, IV: 4, I: 1
  };
  let roman = '';
  for (const i in lookup) {
    while (num >= lookup[i]) {
      roman += i;
      num -= lookup[i];
    }
  }
  return roman;
};

export default function FutureClock() {
  const containerRef = useRef(null);

  useEffect(() => {
    let app;
    let interval;

    const setup = async () => {
      if (!containerRef.current) return;

      app = new Application();
      await app.init({
        resizeTo: containerRef.current,
        background: '#282a36',
        antialias: true,
      });

      containerRef.current.appendChild(app.canvas);

      const centerX = app.renderer.width / 2;
      const centerY = app.renderer.height / 2;

      const timeText = new Text('', {
        fontFamily: 'monospace',
        fontSize: 56,
        fill: 0xf1fa8c,
        align: 'center',
      });
      timeText.anchor.set(0.5);
      timeText.position.set(centerX, centerY - 20);
      app.stage.addChild(timeText);

      const infoText = new Text("Yes, it's Roman. Yes, it's two hours in the future. You're welcome, time traveler.", {
        fontFamily: 'monospace',
        fontSize: 12,
        fill: 0x8be9fd,
        align: 'center',
        wordWrap: true,
        wordWrapWidth: app.renderer.width - 40,
      });
      infoText.anchor.set(0.5);
      infoText.position.set(centerX, centerY + 50);
      app.stage.addChild(infoText);

      const updateClock = () => {
        const now = new Date();
        const hour = (now.getHours() + 2) % 24;
        const second = now.getSeconds();
        const minute = now.getMinutes();

        const romanHour = romanize(hour);
        const romanSecond = romanize(second);
        const romanMinute = romanize(minute);

        const newText = `${romanHour}:${romanSecond}:${romanMinute}`;
        if (timeText.text !== newText) {
          timeText.text = newText;
          gsap.fromTo(
            timeText,
            { y: centerY + 10, alpha: 0 },
            { y: centerY - 20, alpha: 1, duration: 0.4, ease: 'power2.out' }
          );
        }
      };

      updateClock();
      interval = setInterval(updateClock, 1000);
    };

    setup();

    return () => {
      if (interval) clearInterval(interval);
      if (app) app.destroy(true, { children: true });
    };
  }, []);

  return <div ref={containerRef} className="w-[600px] h-[400px] overflow-hidden" />;
}
