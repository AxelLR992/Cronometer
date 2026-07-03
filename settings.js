const form = document.getElementById('settings-form');
const timeInput = document.getElementById('time-input');
const questionInput = document.getElementById('question-input');

window.electronAPI.onCurrentSettings((settings) => {
  if (!settings) return;

  const seconds = Math.max(1, Math.floor((settings.timeMs || 60000) / 1000));
  timeInput.value = String(seconds);
  questionInput.value = settings.question || '';
});

window.electronAPI.requestCurrentSettings();

window.electronAPI.onSettingsSaved(() => {
  window.close();
});

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const seconds = Number(timeInput.value);
  const question = questionInput.value.trim();

  if (!Number.isFinite(seconds) || seconds < 1 || !question) {
    return;
  }

  window.electronAPI.saveSettings({
    timeMs: Math.floor(seconds * 1000),
    question,
  });
});
