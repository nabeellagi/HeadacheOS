import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import tippy from "tippy.js";
import "tippy.js/dist/tippy.css";
import "../assets/app.css";
import useCalculatorStore from "../stores/useCalculatorStore";
import { clickSound } from "../utils/clickSound";

export default function CoolCalculator() {
  const {
    step,
    setStep,
    quizzes,
    answers,
    initQuizzes,
    setAnswers,
    checkAnswers,
    timeSpent,
    tickTimeSpent,
    timer,
    tickTimer,
    expression,
    setExpression,
    evalExpression,
    result,
    buttons,
    shuffleButtons,
  } = useCalculatorStore();

  const timerRef = useRef(null);
  const inputRef = useRef(null);
  const quizRef = useRef(null);
  const explodeRef = useRef(null);

  // After 10s delay, initialize quiz
  useEffect(() => {
    const timeout = setTimeout(() => {
      initQuizzes();
      setStep(1);
    }, 10000);
    return () => clearTimeout(timeout);
  }, []);

  // Increase time spent every second
  useEffect(() => {
    if (step === 1) {
      const interval = setInterval(() => {
        tickTimeSpent();
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step]);

  // Countdown timer
  useEffect(() => {
    if (step === 2 && timer > 0) {
      timerRef.current = setInterval(() => {
        tickTimer();
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [step, timer]);

  // Exopolode
  useEffect(() => {
    if (step === 2 && timer <= 0 && explodeRef.current) {
      const tl = gsap.timeline();
      tl.to(explodeRef.current, {
        duration: 0.2,
        rotate: 10,
        x: 10,
        y: -5,
        repeat: 5,
        yoyo: true,
        ease: "power2.inOut",
      }).to(explodeRef.current, {
        duration: 0.5,
        scale: 1.3,
        opacity: 0,
        rotate: 720,
        filter: "blur(10px)",
        ease: "back.in(2)",
      });
    }
  }, [step, timer]);

  const handleQuizChange = (i, val) => {
    setAnswers(i, val);
  };

  const handleCheck = () => {
    checkAnswers();
    if (useCalculatorStore.getState().step !== 2 && quizRef.current) {
      tippy(quizRef.current, {
        content: "Incorrect answers. Try again.",
        theme: "light",
        trigger: "manual",
      }).show();
      setTimeout(() => {
        document
          .querySelectorAll("[data-tippy-root]")
          .forEach((el) => el.remove());
      }, 2000);
    }
  };

  const handleInput = (val) => {
    if (val === "=") {
      evalExpression();
    } else {
      const newExp = expression + val;
      setExpression(newExp);
      gsap.fromTo(
        inputRef.current,
        { scale: 0.8, y: -5, opacity: 0.6 },
        { scale: 1, y: 0, opacity: 1, duration: 0.3, ease: "power2.out" }
      );
    }
    shuffleButtons();
  };

  const handleBackspace = () => {
    if (expression.length > 0) {
      setExpression(expression.slice(0, -1));
      gsap.fromTo(
        inputRef.current,
        { scale: 1.2, rotate: 5, opacity: 0.8 },
        {
          scale: 1,
          rotate: 0,
          opacity: 1,
          duration: 0.3,
          ease: "elastic.out(1, 0.4)",
        }
      );
    }
  };

  if (step === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-4">
        <p className="text-xl animate-pulse text-error">
          Initializing HeadacheOS Calculator...
        </p>
        <progress className="progress progress-error w-64 mt-4" />
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="p-4 text-center" ref={quizRef}>
        <h2 className="text-lg font-bold mb-2">
          🧠 Solve these to use the calculator
        </h2>
        {quizzes.map((q, i) => (
          <div key={i} className="mb-2">
            <p className="text-md">{q.question}</p>
            <input
              type="number"
              value={answers[i]}
              onChange={(e) => handleQuizChange(i, e.target.value)}
              className="input input-bordered w-24 text-center"
            />
          </div>
        ))}
        <button onClick={()=>{
          handleCheck();
          clickSound('Retro6')
        }} className="btn btn-error mt-4">
          Unlock Calculator
        </button>
      </div>
    );
  }

  if (step === 2 && timer <= 0) {
    return (
      <div
        ref={explodeRef}
        className="flex items-center justify-center h-full text-center text-error p-4"
      >
        <p className="text-lg font-bold animate-pulse">
          💣 BOOM! Time's up. Restart the app to try again.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={explodeRef}
      className="p-4 h-full flex flex-col items-center max-w-xs mx-auto w-full relative"
    >
      <p className="text-sm text-accent mb-2">⏱ You have {timer}s left</p>
      <input
        ref={inputRef}
        value={expression}
        readOnly
        className="input input-bordered w-full text-center mb-2 text-lg tracking-widest"
      />
      <div className="grid grid-cols-4 gap-2 w-full mb-2">
        {buttons.map((btn, i) => (
          <button
            key={i}
            onClick={() => {
              handleInput(btn)
              clickSound('Retro3')
            }}
            className="btn btn-outline btn-sm"
          >
            {btn}
          </button>
        ))}
      </div>
      <div className="text-center mt-2">
        <p className="text-xs opacity-70">Result (in Binary):</p>
        <p className="text-lg font-bold">{result}</p>
      </div>

      <button
        onClick={()=>{
          clickSound('Retro2');
          handleBackspace();
        }}
        className="btn btn-xs btn-error absolute bottom-4 left-4"
        title="Backspace"
      >
        ⌫
      </button>
    </div>
  );
}
