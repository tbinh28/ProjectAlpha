import { extractTextFromFile, parseQuestions, parseAnswerKey } from './parser.js';
import { UI } from './ui.js';

const state = {
    questions: [],
    userAnswers: {},
    answerKey: null,
    timeRemaining: 0,
    timerInterval: null
};

const elements = {
    fileUpload: document.getElementById('file-upload'),
    timeInput: document.getElementById('time-input'),
    keyInput: document.getElementById('key-input'),
    btnStart: document.getElementById('btn-start'),
    btnSubmit: document.getElementById('btn-submit')
};

elements.btnStart.addEventListener('click', async () => {
    const file = elements.fileUpload.files[0];
    if (!file) return alert('Vui lòng chọn file đề thi (.docx hoặc .pdf) để tiếp tục.');

    elements.btnStart.disabled = true;
    elements.btnStart.textContent = 'Đang xử lý dữ liệu...';

    try {
        const rawText = await extractTextFromFile(file);
        state.questions = parseQuestions(rawText);
        
        if (state.questions.length === 0) {
            throw new Error('Không thể bóc tách câu hỏi. Vui lòng đảm bảo cấu trúc đề thi đúng chuẩn (VD: Câu 1: ... A. ... B. ... C. ... D. ...).');
        }

        state.answerKey = parseAnswerKey(elements.keyInput.value);
        state.timeRemaining = parseInt(elements.timeInput.value) * 60;

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

function submitQuiz() {
    clearInterval(state.timerInterval);
    UI.renderResults(state.questions, state.userAnswers, state.answerKey, 'result-container');
    UI.switchScreen('result');
    window.scrollTo(0, 0);
}

elements.btnSubmit.addEventListener('click', () => {
    if (confirm('Bạn có chắc chắn muốn nộp bài? Hãy kiểm tra lại các đáp án trước khi xác nhận.')) {
        submitQuiz();
    }
});
