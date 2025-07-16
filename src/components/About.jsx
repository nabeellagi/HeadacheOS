import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { Icon } from "@iconify/react";
import "../assets/app.css";
import tippy from "tippy.js";
import "tippy.js/dist/tippy.css";
import specs from "../data/fakeSpecs";

export default function AboutHeadacheOS() {
  const containerRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({
      repeat: -1,
      defaults: { ease: "power2.inOut" },
    });

    tl.fromTo(
      ".glitch-title",
      { x: -20 },
      { x: 20, duration: 0.1, yoyo: true, repeat: 5 }
    )
      .to(".glitch-title", { color: "#ff0000", duration: 0.2 })
      .to(".glitch-title", { color: "#00ffff", duration: 0.2 })
      .to(".glitch-title", { color: "#fff", duration: 0.2 });

    gsap.fromTo(
      containerRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1, ease: "bounce.out" }
    );

    gsap.to(".animated-text", {
      duration: 2,
      repeat: -1,
      yoyo: true,
      color: ["#ff7eb9", "#7afcff", "#feff9c", "#ffffff", "#b28dff"],
      ease: "power1.inOut",
      stagger: 0.2,
    });

    tippy(buttonRef.current, {
      content: "Even this tooltip is confused. Good luck.",
      trigger: "click",
      placement: "top",
      theme: "light-border",
    });
  }, []);

  return (
    <div
      ref={containerRef}
      className="p-6 sm:p-10 min-h-screen bg-gradient-to-tr from-neutral via-zinc-800 to-gray-900 text-neutral-content font-mono"
    >
      <div className="max-w-5xl mx-auto space-y-10">
        <h1 className="text-5xl font-bold glitch-title text-center animated-text">
          About HeadacheOS
        </h1>
        <p className="text-lg text-center animated-text px-4 sm:px-16">
          <Icon
            icon="mdi:emoticon-dead-outline"
            className="inline text-2xl mr-2"
          />
          Welcome to HeadacheOS — a web based mock operating system so
          inconvenient, or maybe not because I am being too dramatic?. Designed
          with <em>maximum headache</em> in mind. Feel free to explore anything
          I guess?
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {specs.map((item, index) => (
            <div
              key={index}
              className="card bg-neutral-focus p-5 shadow-xl hover:scale-105 transform transition duration-300 space-y-2"
            >
              <h3 className="text-md font-semibold text-accent flex items-center gap-2 animated-text">
                <Icon icon={item.icon} className="text-xl" /> {item.label}
              </h3>
              <p className="text-sm text-white opacity-90 animated-text">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <button ref={buttonRef} className="btn btn-error animate-pulse">
            Try to Fix Me
          </button>
        </div>

        <div className="mt-16 text-sm opacity-50 text-center space-y-2 px-4">
          <p className="animated-text">
            <Icon
              icon="mdi:alert-octagon-outline"
              className="inline mr-1 text-lg"
            />
            Warning: Using HeadacheOS may cause migraines, and unexpected
            admiration for Windows 98.
          </p>
          <p className="animated-text">
            Proudly non-functional since version 0.0.1-alpha
          </p>
        </div>
      </div>
    </div>
  );
}
