const DEFAULT_SETTINGS = {
    timeMs: 90000,
    question: 'Add your question here.'
};

let time = DEFAULT_SETTINGS.timeMs;
let timer = null;
let configuredTimeMs = DEFAULT_SETTINGS.timeMs;

const startBtn = document.querySelector('.start-btn');
const stopBtn = document.querySelector('.stop-btn');
const timeDisplay = document.querySelector('.time');
const questionDisplay = document.querySelector('.question');
const container = document.querySelector('.container');

let isDraggingWindow = false;
let lastDragScreenX = 0;
let lastDragScreenY = 0;
let dragFrameScheduled = false;

function flushWindowDrag() {
    dragFrameScheduled = false;

    if (!isDraggingWindow || !window.electronAPI) return;

    window.electronAPI.updateWindowDrag({
        x: lastDragScreenX,
        y: lastDragScreenY,
    });
}

function loadSettings() {
    try {
        const raw = localStorage.getItem('cronometer-settings');
        if (!raw) return DEFAULT_SETTINGS;

        const parsed = JSON.parse(raw);
        const timeMs = Number(parsed?.timeMs);
        const question = String(parsed?.question || '').trim();

        if (!Number.isFinite(timeMs) || timeMs < 1000 || !question) {
            return DEFAULT_SETTINGS;
        }

        return {
            timeMs: Math.floor(timeMs),
            question,
        };
    } catch (_error) {
        return DEFAULT_SETTINGS;
    }
}

function saveSettings(settings) {
    localStorage.setItem('cronometer-settings', JSON.stringify(settings));
}

function applySettings(settings) {
    configuredTimeMs = settings.timeMs;
    time = settings.timeMs;
    questionDisplay.textContent = settings.question;

    clearInterval(timer);
    timer = null;
    updateDisplay();
    saveSettings(settings);
}

function formatTime(milliseconds) {
    const totalSeconds = Math.ceil(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function updateDisplay() {
    timeDisplay.textContent = formatTime(time);
}

function startTimer() {
    if (timer) return;

    timer = setInterval(() => {
        time = Math.max(0, time - 1000);
        updateDisplay();

        if (time === 0) {
            clearInterval(timer);
            timer = null;
        }
    }, 1000);
}

applySettings(loadSettings());

container.addEventListener('mousedown', (event) => {
    if (event.button !== 0) return;
    if (event.target.closest('button')) return;
    if (!window.electronAPI) return;

    isDraggingWindow = true;
    lastDragScreenX = event.screenX;
    lastDragScreenY = event.screenY;

    window.electronAPI.beginWindowDrag({
        x: lastDragScreenX,
        y: lastDragScreenY,
    });

    document.body.style.userSelect = 'none';
});

window.addEventListener('mousemove', (event) => {
    if (!isDraggingWindow) return;

    lastDragScreenX = event.screenX;
    lastDragScreenY = event.screenY;

    if (dragFrameScheduled) return;

    dragFrameScheduled = true;
    requestAnimationFrame(flushWindowDrag);
});

window.addEventListener('mouseup', () => {
    if (!isDraggingWindow) return;

    isDraggingWindow = false;
    dragFrameScheduled = false;
    if (window.electronAPI) {
        window.electronAPI.endWindowDrag();
    }
    document.body.style.userSelect = '';
});

window.addEventListener('blur', () => {
    if (!isDraggingWindow) return;

    isDraggingWindow = false;
    dragFrameScheduled = false;
    if (window.electronAPI) {
        window.electronAPI.endWindowDrag();
    }
    document.body.style.userSelect = '';
});

window.addEventListener('contextmenu', (event) => {
    event.preventDefault();

    if (window.electronAPI) {
        window.electronAPI.showAppContextMenu();
    }
});

if (window.electronAPI) {
    window.electronAPI.onSettingsUpdated((settings) => {
        applySettings(settings);
    });
}

startBtn.addEventListener('click', () => {
    startTimer();
});

stopBtn.addEventListener('click', () => {
    if (timer) {
        clearInterval(timer);
        timer = null;
        return;
    }

    time = configuredTimeMs;
    updateDisplay();
});