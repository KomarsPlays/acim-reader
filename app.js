/**
 * Course in Miracles Reader
 * Main Application Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // State
    const state = {
        lessons: [],
        phrasesOfDay: JSON.parse(localStorage.getItem('acim_phrases') || '[]'),
        currentView: 'toc', // 'toc' or 'reading'
        scrollPos: parseInt(localStorage.getItem('acim_scroll') || '0', 10),
        pendingSelection: null // Holds data for the popup
    };

    // DOM Elements
    const els = {
        tocView: document.getElementById('toc-view'),
        readingView: document.getElementById('reading-view'),
        tocList: document.getElementById('toc-list'),
        lessonsContainer: document.getElementById('lessons-container'),
        loading: document.getElementById('loading'),
        backToTocBtn: document.getElementById('back-to-toc-btn'),

        phrasesBar: document.getElementById('phrases-bar'),
        phrasesList: document.getElementById('phrases-list'),
        togglePhrasesBtn: document.getElementById('toggle-phrases-btn'),
        clearPhrasesBtn: document.getElementById('clear-phrases-btn'),

        popup: document.getElementById('selection-popup'),
        popupPhraseIndex: document.getElementById('phrase-index'),
        popupYesBtn: document.getElementById('popup-yes'),
        popupNoBtn: document.getElementById('popup-no')
    };

    // Initialize App
    async function init() {
        try {
            const response = await fetch('lessons.json');
            if (!response.ok) throw new Error('Failed to load lessons');

            state.lessons = await response.json();

            els.loading.classList.add('hidden');
            renderTOC();
            renderLessons();
            renderPhrases();
            updatePhrasesVisibility();

            // Check if there's a hash in the URL to navigate directly
            if (window.location.hash && window.location.hash.startsWith('#lesson-')) {
                navigateToReading();
                // Browser natively handles scrolling to hash, 
                // but we might need to adjust for fixed header
                setTimeout(() => {
                    const el = document.querySelector(window.location.hash);
                    if (el) {
                        const y = el.getBoundingClientRect().top + window.scrollY - 80;
                        window.scrollTo({ top: y, behavior: 'auto' });
                    }
                }, 100);
            } else if (state.scrollPos > 0) {
                // Restore scroll position
                navigateToReading();
                setTimeout(() => window.scrollTo(0, state.scrollPos), 100);
            }

            setupEventListeners();

        } catch (error) {
            console.error('Error loading app:', error);
            els.loading.textContent = 'Ошибка загрузки уроков. Убедитесь, что lessons.json существует.';
            els.loading.style.color = 'red';
        }
    }

    // Render Table of Contents
    function renderTOC() {
        const fragment = document.createDocumentFragment();

        state.lessons.forEach(lesson => {
            const a = document.createElement('a');
            a.href = `#lesson-${lesson.number}`;
            a.className = 'toc-item';

            const numberSpan = document.createElement('span');
            numberSpan.className = 'toc-number';
            numberSpan.textContent = `Урок ${lesson.number}`;

            const titleSpan = document.createElement('span');
            titleSpan.className = 'toc-title';
            titleSpan.textContent = lesson.title;

            a.appendChild(numberSpan);
            a.appendChild(titleSpan);

            a.addEventListener('click', (e) => {
                // Let the browser handle the hash change, but we need to switch view
                navigateToReading();
            });

            fragment.appendChild(a);
        });

        els.tocList.appendChild(fragment);
    }

    // Render Full Lessons Text
    function renderLessons() {
        const fragment = document.createDocumentFragment();

        state.lessons.forEach(lesson => {
            const article = document.createElement('article');
            article.id = `lesson-${lesson.number}`;
            article.className = 'lesson-article';

            const header = document.createElement('header');
            header.className = 'lesson-header';

            const numberSpan = document.createElement('span');
            numberSpan.className = 'lesson-number';
            numberSpan.textContent = `Урок ${lesson.number}`;

            const titleH2 = document.createElement('h2');
            titleH2.className = 'lesson-title';
            titleH2.textContent = lesson.title;

            header.appendChild(numberSpan);
            header.appendChild(titleH2);
            article.appendChild(header);

            const textDiv = document.createElement('div');
            textDiv.className = 'lesson-text';

            // Format paragraphs
            const paragraphs = lesson.text.split('\n\n').filter(p => p.trim());
            paragraphs.forEach(pText => {
                const p = document.createElement('p');
                p.textContent = pText.trim();
                if (pText.includes('\n')) {
                    p.className = 'lesson-verse';
                }
                textDiv.appendChild(p);
            });

            article.appendChild(textDiv);
            fragment.appendChild(article);
        });

        els.lessonsContainer.appendChild(fragment);
    }

    // View Navigation
    function navigateToReading() {
        state.currentView = 'reading';
        els.tocView.classList.remove('active');
        els.readingView.classList.add('active');
        els.backToTocBtn.classList.remove('hidden');
    }

    function navigateToTOC() {
        state.currentView = 'toc';
        els.readingView.classList.remove('active');
        els.tocView.classList.add('active');
        els.backToTocBtn.classList.add('hidden');
        window.location.hash = ''; // Clear hash
        window.scrollTo(0, 0); // Scroll TOC to top
    }

    // Scroll tracking
    let scrollTimeout;
    function handleScroll() {
        if (state.currentView === 'reading') {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                localStorage.setItem('acim_scroll', window.scrollY);
            }, 500);
        }
    }

    // --- Phrase of the Day Logic ---

    function renderPhrases() {
        els.phrasesList.innerHTML = '';

        if (state.phrasesOfDay.length === 0) {
            updatePhrasesVisibility();
            return;
        }

        state.phrasesOfDay.forEach((phrase, index) => {
            const div = document.createElement('div');
            div.className = 'phrase-item';

            const numSpan = document.createElement('span');
            numSpan.className = 'phrase-index';
            numSpan.textContent = `Фраза ${index + 1}`;

            const textSpan = document.createElement('span');
            textSpan.textContent = phrase;

            div.appendChild(numSpan);
            div.appendChild(textSpan);
            els.phrasesList.appendChild(div);
        });

        updatePhrasesVisibility();
    }

    function updatePhrasesVisibility() {
        if (state.phrasesOfDay.length === 0) {
            els.phrasesBar.classList.add('empty');
            document.body.style.paddingTop = '20px'; // Less padding when empty
        } else {
            els.phrasesBar.classList.remove('empty');
            // Adjust body padding based on bar height
            setTimeout(() => {
                document.body.style.paddingTop = els.phrasesBar.offsetHeight + 20 + 'px';
            }, 50);
        }
    }

    function addPhrase(text) {
        state.phrasesOfDay.push(text);
        savePhrases();
        renderPhrases();

        // Auto-expand list to show new phrase
        els.phrasesList.classList.remove('collapsed');
        updatePhrasesVisibility();
    }

    function clearPhrases() {
        if (confirm('Очистить все фразы дня?')) {
            state.phrasesOfDay = [];
            savePhrases();
            renderPhrases();
        }
    }

    function savePhrases() {
        localStorage.setItem('acim_phrases', JSON.stringify(state.phrasesOfDay));
    }

    // Selection Handling
    function handleSelection(e) {
        // Only allow selection in reading view
        if (state.currentView !== 'reading') return;

        // Hide popup if clicking outside
        if (e.target.closest('#selection-popup')) return;

        setTimeout(() => {
            const selection = window.getSelection();
            const text = selection.toString().trim();

            if (text.length > 5) { // Minimum length for a phrase
                const range = selection.getRangeAt(0);
                const rect = range.getBoundingClientRect();

                showPopup(rect, text);
            } else {
                hidePopup();
            }
        }, 10);
    }

    function showPopup(rect, text) {
        const index = state.phrasesOfDay.length + 1;
        els.popupPhraseIndex.textContent = index;

        state.pendingSelection = text;

        // Calculate position (centered above selection)
        const top = rect.top + window.scrollY;
        const left = rect.left + window.scrollX + (rect.width / 2);

        // Ensure popup doesn't go off-screen
        const popupWidth = 200; // estimated
        let adjustedLeft = left;

        if (left - popupWidth / 2 < 10) adjustedLeft = popupWidth / 2 + 10;
        if (left + popupWidth / 2 > window.innerWidth - 10) adjustedLeft = window.innerWidth - popupWidth / 2 - 10;

        els.popup.style.top = `${top}px`;
        els.popup.style.left = `${adjustedLeft}px`;

        els.popup.classList.remove('hidden');
    }

    function hidePopup() {
        els.popup.classList.add('hidden');
        state.pendingSelection = null;
    }

    // Event Listeners Setup
    function setupEventListeners() {
        window.addEventListener('scroll', handleScroll);

        // Back to TOC
        els.backToTocBtn.addEventListener('click', navigateToTOC);

        // Phrases Bar
        els.togglePhrasesBtn.addEventListener('click', () => {
            els.phrasesList.classList.toggle('collapsed');
            // Re-adjust body padding after animation
            setTimeout(updatePhrasesVisibility, 350);
        });

        els.clearPhrasesBtn.addEventListener('click', clearPhrases);

        // Text Selection
        document.addEventListener('mouseup', handleSelection);
        document.addEventListener('touchend', handleSelection);

        // Popup Buttons
        els.popupYesBtn.addEventListener('click', () => {
            if (state.pendingSelection) {
                addPhrase(state.pendingSelection);
                window.getSelection().removeAllRanges(); // Clear selection
                hidePopup();
            }
        });

        els.popupNoBtn.addEventListener('click', () => {
            window.getSelection().removeAllRanges(); // Clear selection
            hidePopup();
        });

        // Hash change for browser back/forward buttons
        window.addEventListener('hashchange', () => {
            if (!window.location.hash) {
                navigateToTOC();
            } else if (window.location.hash.startsWith('#lesson-')) {
                navigateToReading();
            }
        });
    }

    // Start
    init();
});
