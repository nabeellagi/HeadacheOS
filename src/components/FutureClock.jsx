import React, { useEffect, useRef } from 'react';
import { Application, Container, Graphics, Text } from 'pixi.js';
import gsap from 'gsap';

const romanize = (num) => {
  const lookup = {
    M: 1000,
    CM: 900,
    D: 500,
    CD: 400,
    C: 100,
    XC: 90,
    L: 50,
    XL: 40,
    X: 10,
    IX: 9,
    V: 5,
    IV: 4,
    I: 1,
  };
  let roman = '';
  for (let i in lookup) {
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

      const minuteCircle = new Container();
      app.stage.addChild(minuteCircle);

      const radius = 160; // Increased from 140
      for (let i = 1; i <= 60; i++) {
        const angle = (i / 60) * Math.PI * 2;
        const label = new Text(romanize(i), {
          fontFamily: 'monospace',
          fontSize: 14,
          fill: 0xf1fa8c,
        });
        label.anchor.set(0.5);
        label.position.set(
          centerX + radius * Math.cos(angle - Math.PI / 2),
          centerY + radius * Math.sin(angle - Math.PI / 2)
        );
        minuteCircle.addChild(label);
      }

      const needle = new Graphics();
      app.stage.addChild(needle);

      const timeText = new Text('', {
        fontFamily: 'monospace',
        fontSize: 56,
        fill: 0xf1fa8c,
        align: 'center',
      });
      timeText.anchor.set(0.5);
      timeText.position.set(centerX, centerY);
      app.stage.addChild(timeText);

      const updateClock = () => {
        const now = new Date();
        const hour = (now.getHours() + 2) % 24;
        const second = now.getSeconds();
        const minute = now.getMinutes();

        const displayHour = romanize(hour);
        const displaySecond = romanize(second);

        timeText.text = `${displayHour}:${displaySecond}`;
        gsap.fromTo(
          timeText.scale,
          { x: 0.8, y: 0.8 },
          { x: 1, y: 1, duration: 0.2, ease: 'back.out(1.7)' }
        );

        needle.clear();
        needle.lineStyle({ width: 3, color: 0xff79c6 });
        const angle = ((60 - minute) / 60) * Math.PI * 2 - Math.PI / 2;
        const needleLength = radius - 20;
        const x = centerX + needleLength * Math.cos(angle);
        const y = centerY + needleLength * Math.sin(angle);
        needle.moveTo(centerX, centerY);
        needle.lineTo(x, y);
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

  return <div ref={containerRef} className="w-full h-full" />;
}
