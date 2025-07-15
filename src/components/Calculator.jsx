import React, { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';

const binary = (num) => (isNaN(num) ? 'NaN' : (parseInt(num) >>> 0).toString(2));

const generateQuiz = () => {
  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;
  const ops = ['+', '-', '*'];
  const op = ops[Math.floor(Math.random() * ops.length)];
  const answer = eval(`${a}${op}${b}`);
  return { question: `${a} ${op} ${b}`, answer };
};

export default function CoolCalculator() {
  const [loading, setLoading] = useState(true);
  const [quizzes, setQuizzes] = useState([]);
  const [answers, setAnswers] = useState(['', '', '']);
  const [step, setStep] = useState(0);
  const [timer, setTimer] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('');
  const timerRef = useRef(null);
  const inputRef = useRef(null);
  const quizRef = useRef(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setQuizzes([generateQuiz(), generateQuiz(), generateQuiz()]);
      setStep(1);
    }, 10000);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (step === 1) {
      const interval = setInterval(() => {
        setTimeSpent((t) => t + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step]);

  useEffect(() => {
    if (step === 2 && timer > 0) {
      timerRef.current = setInterval(() => {
        setTimer((t) => {
          if (t <= 1) clearInterval(timerRef.current);
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [step]);

  const handleQuizChange = (index, value) => {
    const updated = [...answers];
    updated[index] = value;
    setAnswers(updated);
  };

  const checkQuiz = () => {
    if (answers.every((val, i) => Number(val) === quizzes[i].answer)) {
      setTimer(timeSpent);
      setStep(2);
    } else {
      if (quizRef.current) {
        tippy(quizRef.current, {
          content: 'Incorrect answers. Try again.',
          theme: 'light',
          trigger: 'manual',
        }).show();
        setTimeout(() => {
          document.querySelectorAll('[data-tippy-root]').forEach(el => el.remove());
        }, 2000);
      }
    }
  };

  const shuffledButtons = () => {
    const buttons = ['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '=', '+'];
    return [...buttons].sort(() => Math.random() - 0.5);
  };

  const [buttons, setButtons] = useState(shuffledButtons());

  const handleInput = (val) => {
    if (val === '=') {
      try {
        setResult(binary(eval(expression)));
      } catch {
        setResult('Error');
      }
    } else {
      const newExpression = expression + val;
      setExpression(newExpression);
      gsap.fromTo(
        inputRef.current,
        { scale: 0.8, y: -5, opacity: 0.6 },
        { scale: 1, y: 0, opacity: 1, duration: 0.3, ease: 'power2.out' }
      );
    }
    setButtons(shuffledButtons());
  };

  if (step === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-4">
        <p className="text-xl animate-pulse text-error">Initializing HeadacheOS Calculator...</p>
        <progress className="progress progress-error w-64 mt-4" />
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="p-4 text-center" ref={quizRef}>
        <h2 className="text-lg font-bold mb-2">🧠 Solve these to use the calculator</h2>
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
        <button onClick={checkQuiz} className="btn btn-error mt-4">Unlock Calculator</button>
      </div>
    );
  }

  if (step === 2 && timer <= 0) {
    return (
      <div className="flex items-center justify-center h-full text-center text-error p-4">
        <p className="text-lg font-bold">⏳ Time's up. Restart the app to try again.</p>
      </div>
    );
  }

  return (
    <div className="p-4 h-full flex flex-col items-center max-w-xs mx-auto w-full">
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
            onClick={() => handleInput(btn)}
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
    </div>
  );
}
