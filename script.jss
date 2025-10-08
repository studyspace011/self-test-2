class MCQTestApp {
    constructor() {
        this.questions = [];
        this.currentTest = null;
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.startTime = null;
        this.endTime = null;
        this.totalTimeLimit = 0; 
        this.timeLeft = 0;
        this.timerInterval = null;
        this.subjectName = '';
        this.chapterNumber = '';
        this.userName = '';
        this.subjectsData = []; // To store data from subjects.json
        
        this.initializeElements();
        this.bindEvents();
        this.loadInitialData();
        this.registerServiceWorker();
    }

    initializeElements() {
        // Screen elements
        this.screens = {
            home: document.getElementById('home-screen'),
            test: document.getElementById('test-screen'),
            results: document.getElementById('results-screen'),
            history: document.getElementById('history-screen')
            // Analytics screen is in analytics.html
        };
        
        // Home screen elements
        this.welcomeMessage = document.getElementById('welcome-message');
        this.nameInputSection = document.getElementById('name-input-section');
        this.userNameInput = document.getElementById('user-name-input');
        this.setNameBtn = document.getElementById('set-name-btn');
        this.testMainSection = document.getElementById('test-main-section');
        
        // Subject Selection
        this.subjectSelect = document.getElementById('subject-select');
        this.chapterSelect = document.getElementById('chapter-select');
        this.subjectSelectionSection = document.getElementById('subject-selection');

        this.questionCount = document.getElementById('question-count');
        this.testSetup = document.getElementById('test-setup');
        this.numQuestions = document.getElementById('num-questions');
        this.totalTimeLimit = document.getElementById('total-time-limit');
        this.shuffleQuestions = document.getElementById('shuffle-questions');
        this.shuffleOptions = document.getElementById('shuffle-options');
        this.startTestBtn = document.getElementById('start-test');
        this.viewHistoryBtn = document.getElementById('view-history');
        this.viewAnalyticsBtn = document.getElementById('view-analytics');

        // Test screen elements
        this.timeLeftElement = document.getElementById('time-left');
        this.currentQuestion = document.getElementById('current-question');
        this.totalQuestions = document.getElementById('total-questions');
        this.questionText = document.getElementById('question-text');
        this.optionsContainer = document.getElementById('options-container');
        this.prevBtn = document.getElementById('prev-btn');
        this.nextBtn = document.getElementById('next-btn');
        this.submitTestBtn = document.getElementById('submit-test');

        // Results screen elements
        this.scoreElement = document.getElementById('score');
        this.totalScoreElement = document.getElementById('total-score');
        this.percentageElement = document.getElementById('percentage');
        this.timeTakenElement = document.getElementById('time-taken');
        this.resultSubject = document.getElementById('result-subject');
        this.resultChapter = document.getElementById('result-chapter');
        this.questionsReview = document.getElementById('questions-review');
        this.newTestBtn = document.getElementById('new-test');
        this.exportResultsBtn = document.getElementById('export-results');

        // History screen elements
        this.historyList = document.getElementById('history-list');
        this.backToHomeBtn = document.getElementById('back-to-home');
        this.clearHistoryBtn = document.getElementById('clear-history');
    }

    bindEvents() {
        // Name Input
        this.setNameBtn.addEventListener('click', () => this.setUserName());
        this.userNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.setUserName();
        });

        // Subject Selection
        this.subjectSelect.addEventListener('change', () => this.populateChapters());
        this.chapterSelect.addEventListener('change', () => this.handleChapterChange());

        // Test Controls
        this.startTestBtn.addEventListener('click', () => this.loadCSVAndStartTest());
        this.prevBtn.addEventListener('click', () => this.previousQuestion());
        this.nextBtn.addEventListener('click', () => this.nextQuestion());
        this.submitTestBtn.addEventListener('click', () => this.submitTest());
        this.newTestBtn.addEventListener('click', () => this.showHomeScreen());
        
        // Navigation
        this.viewHistoryBtn.addEventListener('click', () => this.showHistoryScreen());
        this.viewAnalyticsBtn.addEventListener('click', () => this.navigateToAnalytics());
        this.backToHomeBtn.addEventListener('click', () => this.showHomeScreen());
        this.clearHistoryBtn.addEventListener('click', () => this.clearHistory());
        this.exportResultsBtn.addEventListener('click', () => this.exportResults());
    }
    
    // --- User Name Logic ---

    setUserName() {
        const name = this.userNameInput.value.trim();
        if (name) {
            this.userName = name;
            localStorage.setItem('user_name', name);
            this.updateWelcomeMessage();
            
            // Animate transition
            this.nameInputSection.classList.add('hidden');
            this.testMainSection.classList.remove('hidden');
            this.testMainSection.style.opacity = '0';
            this.testMainSection.style.transform = 'translateY(20px)';
            setTimeout(() => {
                this.testMainSection.style.opacity = '1';
                this.testMainSection.style.transform = 'translateY(0)';
            }, 50);
        } else {
            alert('कृपया अपना नाम दर्ज करें।');
        }
    }

    updateWelcomeMessage() {
        if (this.userName) {
            this.welcomeMessage.innerHTML = `👋 नमस्ते, <span style="color: #f1c40f;">${this.userName}</span>`;
        } else {
            this.welcomeMessage.textContent = '📝 Self Objective Test';
        }
    }

    // --- Data Loading and Subject Selection ---

    async loadInitialData() {
        this.userName = localStorage.getItem('user_name') || '';
        this.updateWelcomeMessage();

        if (this.userName) {
            this.nameInputSection.classList.add('hidden');
            this.testMainSection.classList.remove('hidden');
        } else {
            this.nameInputSection.classList.remove('hidden');
            this.testMainSection.classList.add('hidden');
        }
        
        try {
            const response = await fetch('subjects.json');
            if (!response.ok) {
                throw new Error('subjects.json लोड नहीं हो सका। कृपया सुनिश्चित करें कि यह फ़ाइल मौजूद है।');
            }
            const data = await response.json();
            this.subjectsData = data.विषय || [];
            this.populateSubjects();
        } catch (error) {
            console.error(error);
            alert('विषय सूची लोड करने में त्रुटि: ' + error.message);
        }
    }
    
    populateSubjects() {
        this.subjectSelect.innerHTML = '<option value="">-- विषय चुनें --</option>';
        this.subjectsData.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject.नाम;
            option.textContent = subject.नाम;
            this.subjectSelect.appendChild(option);
        });
    }

    populateChapters() {
        const selectedSubjectName = this.subjectSelect.value;
        this.chapterSelect.innerHTML = '<option value="">-- अध्याय चुनें --</option>';
        this.chapterSelect.disabled = true;
        this.testSetup.classList.add('hidden');
        this.questionCount.textContent = '0';
        
        if (selectedSubjectName) {
            const subject = this.subjectsData.find(s => s.नाम === selectedSubjectName);
            if (subject) {
                subject.अध्याय.forEach(chapter => {
                    const option = document.createElement('option');
                    option.value = chapter.csv_path; // Storing path as value
                    option.textContent = chapter.नाम;
                    this.chapterSelect.appendChild(option);
                });
                this.chapterSelect.disabled = false;
            }
        }
    }

    async handleChapterChange() {
        const csvPath = this.chapterSelect.value;
        if (!csvPath) {
            this.testSetup.classList.add('hidden');
            this.questionCount.textContent = '0';
            return;
        }

        try {
            const response = await fetch(csvPath);
            if (!response.ok) {
                throw new Error(`CSV फ़ाइल (${csvPath}) लोड नहीं हो सकी।`);
            }
            const csvText = await response.text();
            this.parseCSV(csvText);
            
            // Set test metadata
            this.subjectName = this.subjectSelect.value;
            this.chapterNumber = this.chapterSelect.options[this.chapterSelect.selectedIndex].text;
            
            this.updateQuestionCount();
            this.showTestSetup();
        } catch (error) {
            console.error('CSV Loading Error:', error);
            alert('CSV फ़ाइल लोड करने में त्रुटि: ' + error.message);
            this.testSetup.classList.add('hidden');
            this.questionCount.textContent = '0';
        }
    }

    parseCSV(csvText) {
        const lines = csvText.trim().split('\n').filter(line => line.trim() !== '');
        if (lines.length < 2) {
            throw new Error('Invalid CSV format or empty file');
        }

        this.questions = [];
        // Assuming the first line is header, skipping it (lines[0])
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split('|').map(v => v.trim());
            if (values.length >= 8) {
                const question = {
                    id: values[0] || i,
                    question: values[1] || `Question ${i}`,
                    options: [
                        values[2],
                        values[3],
                        values[4],
                        values[5]
                    ].filter(opt => opt.length > 0),
                    answer: values[6],
                    tags: values[7],
                    timeLimit: values[8] ? parseInt(values[8]) : 30
                };
                // Ensure options and answer are valid
                if (question.options.length >= 2 && question.answer.length > 0) {
                     this.questions.push(question);
                }
            }
        }

        if (this.questions.length === 0) {
            throw new Error('कोई प्रश्न नहीं मिले या CSV प्रारूप गलत है।');
        }
    }

    updateQuestionCount() {
        this.questionCount.textContent = this.questions.length;
        this.numQuestions.max = this.questions.length;
        this.numQuestions.value = Math.min(this.questions.length, 10); // Default to 10 or max available
    }

    showTestSetup() {
        this.testSetup.classList.remove('hidden');
        this.testSetup.style.opacity = '0';
        this.testSetup.style.transform = 'translateY(20px)';
        setTimeout(() => {
            this.testSetup.style.opacity = '1';
            this.testSetup.style.transform = 'translateY(0)';
        }, 50);
        this.numQuestions.max = this.questions.length;
        this.numQuestions.value = Math.min(this.questions.length, parseInt(this.numQuestions.value || 10));
    }

    // --- Test Logic (Remaining largely the same) ---

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    loadCSVAndStartTest() {
        if (this.questions.length === 0) {
            alert('कृपया पहले एक अध्याय चुनें और सुनिश्चित करें कि उसमें प्रश्न हैं।');
            return;
        }
        this.startTest();
    }

    startTest() {
        const numQs = parseInt(this.numQuestions.value);
        if (numQs < 1 || numQs > this.questions.length) {
            alert('कृपया वैध प्रश्न संख्या चुनें');
            return;
        }

        this.totalTimeLimit = parseInt(this.totalTimeLimit.value) * 60; 
        this.timeLeft = this.totalTimeLimit;

        let selectedQuestions = [...this.questions];
        if (this.shuffleQuestions.checked) {
            selectedQuestions = this.shuffleArray(selectedQuestions);
        }
        selectedQuestions = selectedQuestions.slice(0, numQs);

        if (this.shuffleOptions.checked) {
            selectedQuestions = selectedQuestions.map(q => {
                const options = [...q.options];
                // Shuffle options while keeping track of the original answer index
                const answerText = q.answer;
                const shuffledOptions = this.shuffleArray(options);
                
                // Note: The answer index logic is simpler if we track the answer text
                return { ...q, options: shuffledOptions, originalAnswer: answerText };
            });
        }

        this.currentTest = selectedQuestions;
        this.userAnswers = new Array(selectedQuestions.length).fill(null);
        this.currentQuestionIndex = 0;
        this.startTime = new Date();

        this.showTestScreen();
        this.displayQuestion();
        this.updateProgress();
        this.startTimer();
    }

    showTestScreen() {
        this.hideAllScreens();
        this.screens.test.classList.add('active');
        this.totalQuestions.textContent = this.currentTest.length;
    }

    startTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();
            
            if (this.timeLeft <= 0) {
                this.submitTest();
            }
        }, 1000);
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        this.timeLeftElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    displayQuestion() {
        const question = this.currentTest[this.currentQuestionIndex];
        this.questionText.textContent = question.question;
        
        this.optionsContainer.innerHTML = '';
        question.options.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'option';
            optionElement.textContent = option;
            optionElement.dataset.index = index;
            
            if (this.userAnswers[this.currentQuestionIndex] === index) {
                optionElement.classList.add('selected');
            }
            
            optionElement.addEventListener('click', () => {
                this.selectOption(index);
            });
            
            this.optionsContainer.appendChild(optionElement);
        });

        this.updateNavigationButtons();
    }

    selectOption(optionIndex) {
        this.userAnswers[this.currentQuestionIndex] = optionIndex;
        
        const options = this.optionsContainer.querySelectorAll('.option');
        options.forEach((opt, idx) => {
            opt.classList.toggle('selected', idx === optionIndex);
        });
    }

    updateProgress() {
        this.currentQuestion.textContent = this.currentQuestionIndex + 1;
    }

    updateNavigationButtons() {
        this.prevBtn.disabled = this.currentQuestionIndex === 0;
        this.nextBtn.disabled = this.currentQuestionIndex === this.currentTest.length - 1;
        
        if (this.currentQuestionIndex === this.currentTest.length - 1) {
            this.submitTestBtn.classList.remove('hidden');
        } else {
            this.submitTestBtn.classList.add('hidden');
        }
    }

    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.displayQuestion();
            this.updateProgress();
        }
    }

    nextQuestion() {
        if (this.currentQuestionIndex < this.currentTest.length - 1) {
            this.currentQuestionIndex++;
            this.displayQuestion();
            this.updateProgress();
        }
    }

    submitTest() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        this.endTime = new Date();
        this.calculateResults();
        this.saveTestResult();
        this.showResultsScreen();
    }

    calculateResults() {
        let correct = 0;
        this.currentTest.forEach((question, index) => {
            const userAnswerIndex = this.userAnswers[index];
            if (userAnswerIndex !== null) {
                const userAnswer = question.options[userAnswerIndex];
                const correctAnswer = question.originalAnswer || question.answer; // Use originalAnswer if shuffled
                if (userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
                    correct++;
                }
            }
        });

        const total = this.currentTest.length;
        const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
        const timeTaken = Math.floor((this.endTime - this.startTime) / 1000);

        this.currentResult = {
            score: correct,
            total: total,
            percentage: percentage,
            timeTaken: timeTaken,
            questions: this.currentTest.map(q => ({
                question: q.question,
                options: q.options,
                answer: q.originalAnswer || q.answer, // Save the actual answer text
            })),
            answers: this.userAnswers,
            date: new Date().toISOString(),
            subject: this.subjectName,
            chapter: this.chapterNumber,
            totalTimeLimit: this.totalTimeLimit
        };
    }

    saveTestResult() {
        let history = JSON.parse(localStorage.getItem('test_history') || '[]');
        history.push(this.currentResult);
        // Keep only last 50 results
        if (history.length > 50) {
            history = history.slice(-50);
        }
        localStorage.setItem('test_history', JSON.stringify(history));
    }

    showResultsScreen() {
        this.hideAllScreens();
        this.screens.results.classList.add('active');

        this.scoreElement.textContent = this.currentResult.score;
        this.totalScoreElement.textContent = this.currentResult.total;
        this.percentageElement.textContent = this.currentResult.percentage;
        this.timeTakenElement.textContent = this.formatTime(this.currentResult.timeTaken);
        this.resultSubject.textContent = this.currentResult.subject;
        this.resultChapter.textContent = this.currentResult.chapter;

        this.displayQuestionsReview();
    }

    displayQuestionsReview() {
        this.questionsReview.innerHTML = '';
        
        this.currentResult.questions.forEach((question, index) => {
            const userAnswerIndex = this.currentResult.answers[index];
            const userAnswer = userAnswerIndex !== null ? question.options[userAnswerIndex] : 'उत्तर नहीं दिया';
            const isCorrect = userAnswerIndex !== null && 
                userAnswer.toLowerCase() === question.answer.toLowerCase();

            const reviewElement = document.createElement('div');
            reviewElement.className = `question-review ${isCorrect ? 'correct' : 'incorrect'}`;
            
            reviewElement.innerHTML = `
                <h4>प्रश्न ${index + 1}: ${question.question}</h4>
                <div class="user-answer">आपका उत्तर: ${userAnswer}</div>
                <div class="correct-answer">सही उत्तर: ${question.answer}</div>
            `;

            this.questionsReview.appendChild(reviewElement);
        });
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    // --- History Screen (Largely the same) ---

    showHistoryScreen() {
        this.hideAllScreens();
        this.screens.history.classList.add('active');
        this.displayHistory();
    }

    displayHistory() {
        const history = JSON.parse(localStorage.getItem('test_history') || '[]');
        this.historyList.innerHTML = '';

        if (history.length === 0) {
            this.historyList.innerHTML = '<p>अभी तक कोई प्रयास नहीं हुआ है</p>';
            return;
        }

        const reversedHistory = [...history].reverse();

        reversedHistory.forEach((result, index) => {
            const date = new Date(result.date);
            const formattedDate = date.toLocaleDateString('hi-IN') + ' ' + date.toLocaleTimeString('hi-IN');
            const originalIndex = history.length - 1 - index; // Index in the non-reversed array

            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <h4>टेस्ट ${originalIndex + 1}: ${result.subject} - ${result.chapter}</h4>
                <div class="history-stats">
                    <span>स्कोर: <strong style="color: ${result.percentage >= 60 ? '#27ae60' : '#e74c3c'};">${result.score}/${result.total}</strong></span>
                    <span>प्रतिशत: <strong>${result.percentage}%</strong></span>
                </div>
                <div class="history-stats">
                    <span>समय लगा: ${this.formatTime(result.timeTaken)}</span>
                    <span>प्रश्न: ${result.total}</span>
                </div>
                <div class="history-date">${formattedDate}</div>
                <div class="history-item-actions">
                    <button class="secondary-btn view-details-btn" data-index="${originalIndex}">👁️ विवरण देखें</button>
                    <button class="danger-btn delete-test-btn" data-index="${originalIndex}">🗑️ हटाएं</button>
                </div>
            `;

            this.historyList.appendChild(historyItem);
        });

        // Bind events for action buttons
        document.querySelectorAll('.view-details-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.viewTestDetails(index);
            });
        });
        
        document.querySelectorAll('.delete-test-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.deleteTest(index);
            });
        });
    }
    
    viewTestDetails(index) {
        const history = JSON.parse(localStorage.getItem('test_history') || '[]');
        const result = history[index];
        if (result) {
            // Temporarily set currentResult to show details on results screen
            this.currentResult = result;
            this.currentTest = result.questions; // Required for displayQuestionsReview structure
            this.userAnswers = result.answers;
            this.showResultsScreen();
        }
    }

    deleteTest(index) {
        if (confirm('क्या आप वाकई इस टेस्ट को हटाना चाहते हैं?')) {
            let history = JSON.parse(localStorage.getItem('test_history') || '[]');
            history.splice(index, 1);
            localStorage.setItem('test_history', JSON.stringify(history));
            this.displayHistory();
        }
    }

    clearHistory() {
        if (confirm('क्या आप वाकई सभी टेस्ट इतिहास हटाना चाहते हैं?')) {
            localStorage.setItem('test_history', '[]');
            this.displayHistory();
        }
    }

    showHomeScreen() {
        this.hideAllScreens();
        if (this.userName) {
            this.testMainSection.classList.remove('hidden');
            this.nameInputSection.classList.add('hidden');
        } else {
            this.testMainSection.classList.add('hidden');
            this.nameInputSection.classList.remove('hidden');
        }
        this.screens.home.classList.add('active');
    }

    hideAllScreens() {
        Object.values(this.screens).forEach(screen => {
            if (screen) screen.classList.remove('active');
        });
    }

    navigateToAnalytics() {
        window.location.href = 'analytics.html';
    }

    // --- Analytics Logic (Runs on analytics.html) ---
    initializeAnalytics() {
        if (document.getElementById('analytics-screen-body')) {
            const history = JSON.parse(localStorage.getItem('test_history') || '[]');
            
            if (history.length === 0) {
                document.getElementById('analytics-data-content').classList.add('hidden');
                document.getElementById('no-history-message').classList.remove('hidden');
                return;
            }

            // General Stats
            const totalTests = history.length;
            const totalPercentage = history.reduce((sum, result) => sum + result.percentage, 0);
            const averageScore = Math.round(totalPercentage / totalTests);
            const bestScore = Math.max(...history.map(result => result.percentage));
            
            document.getElementById('total-tests').textContent = totalTests;
            document.getElementById('average-score').textContent = `${averageScore}%`;
            document.getElementById('best-score').textContent = `${bestScore}%`;

            // Subject Performance Data
            const subjectStats = history.reduce((acc, result) => {
                const subject = result.subject || 'अज्ञात विषय';
                acc[subject] = acc[subject] || { total: 0, count: 0 };
                acc[subject].total += result.percentage;
                acc[subject].count++;
                return acc;
            }, {});

            const subjectLabels = Object.keys(subjectStats);
            const subjectAverages = subjectLabels.map(label => Math.round(subjectStats[label].total / subjectStats[label].count));

            new Chart(document.getElementById('subjectPerformanceChart'), {
                type: 'bar',
                data: {
                    labels: subjectLabels,
                    datasets: [{
                        label: 'औसत प्रतिशत स्कोर',
                        data: subjectAverages,
                        backgroundColor: '#3498db',
                    }]
                },
                options: {
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true, max: 100 } }
                }
            });
            
            // Score Distribution Data (Last 10 Tests)
            const recentHistory = history.slice(-10);
            const distributionLabels = recentHistory.map((_, i) => `टेस्ट ${totalTests - recentHistory.length + i + 1}`);
            const distributionData = recentHistory.map(r => r.percentage);

            new Chart(document.getElementById('scoreDistributionChart'), {
                type: 'line',
                data: {
                    labels: distributionLabels,
                    datasets: [{
                        label: 'प्रतिशत स्कोर',
                        data: distributionData,
                        borderColor: '#27ae60',
                        tension: 0.1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true, max: 100 } }
                }
            });
            
            // Recent Tests List (Can reuse history display logic here)
            this.displayRecentTestsSummary(recentHistory.reverse());
        }
    }
    
    displayRecentTestsSummary(recentHistory) {
        const list = document.getElementById('recent-tests-list');
        list.innerHTML = '';
        recentHistory.forEach(result => {
            const date = new Date(result.date).toLocaleString('hi-IN');
            const item = document.createElement('div');
            item.className = 'history-item';
            item.innerHTML = `
                <h4>${result.subject} - ${result.chapter}</h4>
                <div class="history-stats">
                    <span>स्कोर: ${result.score}/${result.total}</span>
                    <span>प्रतिशत: <strong style="color: ${result.percentage >= 60 ? '#27ae60' : '#e74c3c'};">${result.percentage}%</strong></span>
                </div>
                <div class="history-date">${date}</div>
            `;
            list.appendChild(item);
        });
    }


    exportResults() {
        // ... (Export logic remains the same) ...
        const result = this.currentResult;
        const csvContent = `data:text/csv;charset=utf-8,
टेस्ट परिणाम
यूजर नाम,${this.userName || 'अज्ञात'}
विषय,${result.subject}
अध्याय,${result.chapter}
स्कोर,${result.score}/${result.total}
प्रतिशत,${result.percentage}%
समय लगा,${this.formatTime(result.timeTaken)}
कुल समय सीमा,${this.formatTime(result.totalTimeLimit)}
तारीख,${new Date(result.date).toLocaleString('hi-IN')}

विस्तृत परिणाम
प्रश्न,आपका उत्तर,सही उत्तर,स्थिति
${result.questions.map((q, i) => {
    const userAnswer = result.answers[i] !== null ? q.options[result.answers[i]] : 'उत्तर नहीं दिया';
    const isCorrect = result.answers[i] !== null && 
        q.options[result.answers[i]].toLowerCase() === q.answer.toLowerCase();
    return `"${q.question}","${userAnswer}","${q.answer}","${isCorrect ? 'सही' : 'गलत'}"`;
}).join('\n')}`;

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `mcq_test_result_${new Date().getTime()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js')
                .then(registration => {
                    console.log('Service Worker registered:', registration);
                })
                .catch(error => {
                    console.log('Service Worker registration failed:', error);
                });
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if we are on the analytics page
    if (document.getElementById('analytics-screen-body')) {
        // The analytics.html script block handles initialization for that page
        // No need to initialize the main app here.
    } else {
        // Main app initialization on index.html, history.html, etc.
        window.mcqApp = new MCQTestApp();
    }
});

let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
});