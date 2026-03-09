import { extractTextFromFile, parseQuestions, parseAnswerKey } from './parser.js';
import { UI } from './ui.js';

// Application State
const state = {
    questions: [],
    userAnswers: {}, // { "1": "A", "2": "C" }
    answerKey: null, // { "1": "A", "2": "C" }
    timeRemaining: 0,
    timerInterval: null
};

// DOM Elements
const elements = {
    fileUpload: document.getElementById('file-upload'),
    timeInput: document.getElementById('time-input'),
    keyInput: document.getElementById('key-input'),
    btnStart: document.getElementById('btn-start'),
    btnSubmit: document.getElementById('btn-submit')
};

// Start Quiz Logic
elements.btnStart.addEventListener('click', async () => {
    const file = elements.fileUpload.files[0];
    if (!file) return alert('Vui lòng upload file đề thi!');

    elements.btnStart.disabled = true;
    elements.btnStart.textContent = 'Đang xử lý dữ liệu...';

    try {
        const rawText = await extractTextFromFile(file);
        state.questions = parseQuestions(rawText);
        
        if (state.questions.length === 0) {
            throw new Error('Không nhận diện được câu hỏi. Vui lòng kiểm tra lại format đề (Câu X:, A., B., C., D.).');
        }

        state.answerKey = parseAnswerKey(elements.keyInput.value);
        state.timeRemaining = parseInt(elements.timeInput.value) * 60;

        // Render & Chuyển màn hình
        UI.renderQuestions(state.questions, 'questions-container', (id, val) => {
            state.userAnswers[id] = val;
        });
        
        UI.switchScreen('quiz');
        startTimer();

    } catch (error) {
        alert(error.message);
        elements.btnStart.disabled = false;
        elements.btnStart.textContent = 'Bắt đầu thi';
    }
});

// Timer Logic
function startTimer() {
    updateTimerUI();
    state.timerInterval = setInterval(() => {
        state.timeRemaining--;
        updateTimerUI();
        
        if (state.timeRemaining <= 0) {
            clearInterval(state.timerInterval);
            submitQuiz();
        }
    }, 1000);
}

function updateTimerUI() {
    const minutes = Math.floor(state.timeRemaining / 60);
    const seconds = state.timeRemaining % 60;
    UI.updateTimer(minutes, seconds);
}

// Submit Logic
function submitQuiz() {
    clearInterval(state.timerInterval);
    UI.renderResults(state.questions, state.userAnswers, state.answerKey, 'result-container');
    UI.switchScreen('result');
    window.scrollTo(0, 0);
}

elements.btnSubmit.addEventListener('click', () => {
    if (confirm('Bạn có chắc chắn muốn nộp bài sớm?')) {
        submitQuiz();
    }
});
