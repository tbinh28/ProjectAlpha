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
        let currentGroupPassage = null;

        questions.forEach((q) => {
            // Nhóm bài đọc (Passage Grouping)
            if (q.passage !== currentGroupPassage) {
                currentGroupPassage = q.passage;
                
                if (currentGroupPassage && currentGroupPassage.trim() !== "") {
                    const groupContainer = document.createElement('div');
                    groupContainer.className = 'mb-10 w-full relative';
                    
                    const passageDiv = document.createElement('div');
                    passageDiv.className = 'sticky top-[85px] z-40 bg-amber-50/95 backdrop-blur-sm border border-amber-200 text-slate-800 p-6 rounded-2xl shadow-md mb-8 max-h-[35vh] overflow-y-auto custom-scrollbar transition-all';
                    passageDiv.innerHTML = `
                        <h4 class="font-bold mb-3 text-amber-800 uppercase text-xs tracking-widest flex items-center gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                            Đoạn văn Đọc hiểu
                        </h4>
                        <p class="text-base md:text-lg leading-relaxed text-justify">${currentGroupPassage}</p>
                    `;
                    groupContainer.appendChild(passageDiv);
                    container.appendChild(groupContainer);
                }
            }

            // Render câu hỏi
            const qDiv = document.createElement('div');
            qDiv.className = 'bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200 mb-6 transition-all hover:shadow-md';
            
            let html = `<h3 class="text-xl font-bold text-slate-800 mb-6 leading-relaxed">
                            <span class="text-blue-600">Câu ${q.id}:</span> 
                            <span class="font-medium text-slate-700">${q.text}</span>
                        </h3>`;
            html += `<div class="grid grid-cols-1 md:grid-cols-2 gap-4">`;
            
            ['A', 'B', 'C', 'D'].forEach(opt => {
                const uniqueId = `q${q.id}_${opt}`;
                html += `
                    <label for="${uniqueId}" class="cursor-pointer relative block">
                        <input type="radio" name="question_${q.id}" id="${uniqueId}" value="${opt}" class="peer hidden">
                        <div class="p-4 rounded-2xl border-2 border-slate-200 transition-all duration-200 
                                    peer-checked:border-blue-500 peer-checked:bg-blue-50 peer-checked:shadow-sm
                                    hover:border-slate-300 hover:bg-slate-50 flex items-center min-h-[4.5rem]">
                            <div class="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl border-2 border-slate-200 text-slate-500 font-bold mr-4 transition-colors">
                                ${opt}
                            </div>
                            <span class="text-slate-700 font-medium">${q.options[opt]}</span>
                        </div>
                    </label>
                `;
            });
            
            html += `</div>`;
            qDiv.innerHTML = html;
            container.appendChild(qDiv);

            // Xử lý đổi màu icon khi chọn đáp án
            qDiv.querySelectorAll('input[type="radio"]').forEach(radio => {
                radio.addEventListener('change', (e) => {
                    const allIcons = qDiv.querySelectorAll('.w-10.h-10');
                    allIcons.forEach(icon => {
                        icon.classList.remove('border-blue-500', 'bg-blue-500', 'text-white');
                        icon.classList.add('border-slate-200', 'text-slate-500');
                    });
                    
                    const checkedIcon = e.target.nextElementSibling.querySelector('.w-10.h-10');
                    checkedIcon.classList.remove('border-slate-200', 'text-slate-500');
                    checkedIcon.classList.add('border-blue-500', 'bg-blue-500', 'text-white');
                    
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
            let borderClass = 'border-slate-200';
            if (answerKey) {
                borderClass = isCorrect ? 'border-emerald-400 bg-emerald-50/30' : 'border-red-400 bg-red-50/30';
            }

            qDiv.className = `p-6 md:p-8 rounded-3xl border-2 ${borderClass} mb-6 shadow-sm`;
            
            let html = `<h3 class="text-xl font-bold mb-5 leading-relaxed text-slate-800">
                            <span>Câu ${q.id}:</span> <span class="font-medium">${q.text}</span>
                        </h3>`;
            html += `<div class="grid grid-cols-1 md:grid-cols-2 gap-4">`;
            
            ['A', 'B', 'C', 'D'].forEach(opt => {
                let bgClass = 'bg-white border-slate-200';
                let iconClass = 'border-slate-200 text-slate-500';
                
                if (answerKey) {
                    if (opt === correctAns) {
                        bgClass = 'bg-emerald-50 border-emerald-500';
                        iconClass = 'bg-emerald-500 border-emerald-500 text-white';
                    } else if (opt === userAns && opt !== correctAns) {
                        bgClass = 'bg-red-50 border-red-400 opacity-70';
                        iconClass = 'bg-red-500 border-red-500 text-white';
                    }
                } else {
                    if (opt === userAns) {
                        bgClass = 'bg-blue-50 border-blue-500';
                        iconClass = 'bg-blue-500 border-blue-500 text-white';
                    }
                }

                html += `
                    <div class="p-4 rounded-2xl border-2 ${bgClass} flex items-center min-h-[4.5rem]">
                        <div class="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl border-2 ${iconClass} font-bold mr-4">
                            ${opt}
                        </div>
                        <span class="text-slate-700 font-medium">${q.options[opt]}</span>
                    </div>
                `;
            });
            html += `</div>`;
            qDiv.innerHTML = html;
            container.appendChild(qDiv);
        });

        const scoreDisplay = document.getElementById('score-display');
        if (answerKey) {
            scoreDisplay.innerHTML = `<span class="${correctCount >= questions.length/2 ? 'text-emerald-500' : 'text-red-500'}">${correctCount}</span> / ${questions.length}`;
        } else {
            scoreDisplay.textContent = 'Hoàn thành';
            scoreDisplay.classList.replace('text-blue-600', 'text-slate-600');
        }
    },

    updateTimer(minutes, seconds) {
        document.getElementById('timer-display').textContent = 
            `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
};
