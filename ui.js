export const UI = {
    screens: {
        setup: document.getElementById('setup-screen'),
        quiz: document.getElementById('quiz-screen'),
        result: document.getElementById('result-screen')
    },
    
    switchScreen(screenName) {
        Object.values(this.screens).forEach(screen => screen.classList.add('hidden-screen'));
        this.screens[screenName].classList.remove('hidden-screen');
    },

    renderQuestions(questions, containerId, onAnswerSelect) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';

        questions.forEach((q, index) => {
            const qDiv = document.createElement('div');
            qDiv.className = 'bg-white p-6 rounded-2xl shadow-sm border border-gray-100';
            
            let html = `<h3 class="text-lg font-bold mb-4">Câu ${q.id}: <span class="font-normal">${q.text}</span></h3>`;
            html += `<div class="grid grid-cols-1 md:grid-cols-2 gap-4">`;
            
            ['A', 'B', 'C', 'D'].forEach(opt => {
                const uniqueId = `q${q.id}_${opt}`;
                html += `
                    <label for="${uniqueId}" class="cursor-pointer relative">
                        <input type="radio" name="question_${q.id}" id="${uniqueId}" value="${opt}" class="peer hidden">
                        <div class="p-4 rounded-xl border-2 border-gray-200 transition-all duration-200 
                                    peer-checked:border-blue-500 peer-checked:bg-blue-50 peer-checked:text-blue-700
                                    hover:bg-gray-50 active:scale-95 flex items-start">
                            <span class="font-bold mr-2">${opt}.</span> 
                            <span>${q.options[opt]}</span>
                        </div>
                    </label>
                `;
            });
            
            html += `</div>`;
            qDiv.innerHTML = html;
            container.appendChild(qDiv);

            // Gắn event listener cho từng radio
            qDiv.querySelectorAll('input[type="radio"]').forEach(radio => {
                radio.addEventListener('change', (e) => {
                    onAnswerSelect(q.id, e.target.value);
                });
            });
        });
    },

    renderResults(questions, userAnswers, answerKey, containerId) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        let correctCount = 0;

        questions.forEach(q => {
            const userAns = userAnswers[q.id];
            const correctAns = answerKey ? answerKey[q.id] : null;
            
            let isCorrect = userAns === correctAns;
            if (isCorrect && correctAns) correctCount++;

            const qDiv = document.createElement('div');
            // Đổi màu viền tùy theo đúng sai
            let borderClass = 'border-gray-200';
            if (answerKey) {
                borderClass = isCorrect ? 'border-green-400 bg-green-50' : 'border-red-400 bg-red-50';
            }

            qDiv.className = `p-6 rounded-2xl border-2 ${borderClass} shadow-sm`;
            
            let html = `<h3 class="text-lg font-bold mb-3">Câu ${q.id}: <span class="font-normal">${q.text}</span></h3>`;
            html += `<div class="grid grid-cols-1 md:grid-cols-2 gap-3">`;
            
            ['A', 'B', 'C', 'D'].forEach(opt => {
                let bgClass = 'bg-white border-gray-200';
                
                if (answerKey) {
                    if (opt === correctAns) {
                        bgClass = 'bg-green-500 text-white border-green-500 font-bold'; // Đáp án đúng chuẩn
                    } else if (opt === userAns && opt !== correctAns) {
                        bgClass = 'bg-red-500 text-white border-red-500'; // User chọn sai
                    }
                } else {
                    if (opt === userAns) bgClass = 'bg-blue-500 text-white border-blue-500'; // Chế độ không chấm điểm
                }

                html += `
                    <div class="p-3 rounded-xl border ${bgClass} flex items-start">
                        <span class="font-bold mr-2">${opt}.</span> 
                        <span>${q.options[opt]}</span>
                    </div>
                `;
            });
            html += `</div>`;
            qDiv.innerHTML = html;
            container.appendChild(qDiv);
        });

        if (answerKey) {
            document.getElementById('score-display').textContent = `${correctCount} / ${questions.length}`;
        } else {
            document.getElementById('score-display').textContent = 'Đã hoàn thành';
            document.getElementById('score-display').classList.replace('text-blue-600', 'text-gray-600');
        }
    },

    updateTimer(minutes, seconds) {
        const minStr = String(minutes).padStart(2, '0');
        const secStr = String(seconds).padStart(2, '0');
        document.getElementById('timer-display').textContent = `${minStr}:${secStr}`;
    }
};
