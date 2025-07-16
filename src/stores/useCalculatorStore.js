import { create } from 'zustand';

const binary = (num) => (isNaN(num) ? 'NaN' : (parseInt(num) >>> 0).toString(2));
const generateQuiz = () => {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    const ops = ['+', '-', '*'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    const answer = eval(`${a}${op}${b}`);
    return { question: `${a} ${op} ${b}`, answer };
};
const shuffledButtons = () => {
    const buttons = ['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '=', '+'];
    return [...buttons].sort(() => Math.random() - 0.5);
};

const useCalculatorStore = create((set) => ({
    step: 0,
    quizzes: [],
    answers: ['', '', ''],
    timeSpent: 0,
    timer: 0,
    expression: '',
    result: '',
    buttons: shuffledButtons(),

    setStep: (step) => set({ step }),
    initQuizzes: () => set({ quizzes: [generateQuiz(), generateQuiz(), generateQuiz()] }),
    setAnswers: (index, value) =>
        set((state) => {
            const newAnswers = [...state.answers];
            newAnswers[index] = value;
            return { answers: newAnswers };
        }),
    checkAnswers: () =>
        set((state) => {
            const allCorrect = state.answers.every((val, i) => Number(val) === state.quizzes[i].answer);
            return allCorrect ? { step: 2, timer: state.timeSpent } : {};
        }),
    tickTimeSpent: () => set((state) => ({ timeSpent: state.timeSpent + 1 })),
    tickTimer: () => set((state) => ({ timer: state.timer - 1 })),
    setExpression: (exp) => set({ expression: exp }),
    evalExpression: () =>
        set((state) => {
            try {
                const result = binary(eval(state.expression));
                return { result };
            } catch {
                return { result: 'Error' };
            }
        }),
    shuffleButtons: () => set({ buttons: shuffledButtons() }),
}));

export default useCalculatorStore;
