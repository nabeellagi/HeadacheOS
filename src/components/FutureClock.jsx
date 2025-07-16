import React, { useEffect, useRef } from "react";
import kaplay from "kaplay";
import gsap from "gsap";
import "../assets/app.css";

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
  let roman = "";
  for (const i in lookup) {
    while (num >= lookup[i]) {
      roman += i;
      num -= lookup[i];
    }
  }
  return roman;
};

export default function FutureClockKaboom() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    let destroyFn = null;

    const setup = () => {
      if (!containerRef.current) return;

      const canvas = document.createElement("canvas");
      canvas.width = 600;
      canvas.height = 400;
      containerRef.current.appendChild(canvas);
      canvasRef.current = canvas;

      const k = kaplay({
        width: 600,
        height: 300,
        canvas: canvas,
        background: [40, 42, 54],
        font: "monospace",
        plugins: [],
      });

      const centerX = 300;
      const centerY = 200;

      const timeLabel = k.add([
        k.text("", { size: 32 }),
        k.color(241, 250, 140),
        k.pos(centerX, centerY - 20),
        k.anchor("center"),
      ]);

      const infoLabel = k.add([
        k.text(
          "Yes, it's Roman. Yes, it's two hours in the future. You're welcome, time traveler.",
          {
            size: 12,
            width: 500,
          }
        ),
        k.color(139, 233, 253),
        k.pos(centerX, centerY + 50),
        k.anchor("center"),
      ]);

      const updateClock = () => {
        const now = new Date();
        const hour = (now.getHours() + 2) % 24;
        const second = now.getSeconds();
        const minute = now.getMinutes();

        const romanHour = romanize(hour);
        const romanSecond = romanize(second);
        const romanMinute = romanize(minute);

        const newText = `${romanHour}:${romanSecond}:${romanMinute}`;
        if (timeLabel.text !== newText) {
          timeLabel.text = newText;

          gsap.fromTo(
            timeLabel,
            { y: centerY + 10, opacity: 0 },
            { y: centerY - 20, opacity: 1, duration: 0.4, ease: "power2.out" }
          );
        }
      };

      updateClock();
      const interval = setInterval(updateClock, 1000);

      destroyFn = () => {
        clearInterval(interval);
        k.destroy();
        if (canvasRef.current && containerRef.current) {
          containerRef.current.removeChild(canvasRef.current);
        }
      };
    };

    setup();

    return () => {
      if (destroyFn) destroyFn();
    };
  }, []);

  return (
    <div ref={containerRef} className="w-[600px] h-[400px] overflow-hidden" />
  );
}
