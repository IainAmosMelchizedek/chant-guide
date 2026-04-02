const GITHUB_USER = 'IainAmosMelchizedek';
const GITHUB_REPO = 'chant-guide';
const BRANCH = 'main';

const CHANT_FILES = [
  'gayatri-mantra',
  'valmiki-opening',
  'mahabharata-invocation',
  'kalidasa-kumarasambhava',
  'taittiriya-shanti',
  'jagadodharana'
];

function getRawUrl(name) {
  return `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${BRANCH}/chants/${name}.json`;
}

async function fetchChant(url) {
  const res = await fetch(url);
  const chant = await res.json();
  return chant;
}

function loadChantList() {
  const select = document.getElementById('chant-select');
  select.innerHTML = '';
  CHANT_FILES.forEach(name => {
    const opt = document.createElement('option');
    opt.value = getRawUrl(name);
    opt.textContent = name.replace(/-/g, ' ');
    select.appendChild(opt);
  });
  loadChant(getRawUrl(CHANT_FILES[0]));
}

async function loadChant(url) {
  stopAll();
  const chant = await fetchChant(url);
  document.getElementById('chant-title').textContent = chant.title;
  document.getElementById('chant-tradition').textContent = chant.tradition + ' — ' + chant.source;
  document.getElementById('chant-sanskrit').textContent = chant.sanskrit.replace(/\\n/g, '\n');
  document.getElementById('chant-meaning').textContent = chant.meaning;
  document.getElementById('chant-rounds').textContent = 'Rounds: ' + chant.rounds;

  const audioPlayer = document.getElementById('audio-player');
  const audioSection = document.getElementById('audio-section');

  if (chant.audioUrl) {
    audioPlayer.src = chant.audioUrl;
    audioSection.style.display = 'block';
  } else {
    audioPlayer.src = '';
    audioSection.style.display = 'none';
  }

  currentSyllables = chant.syllables;
}

let metronomeTimer = null;
let currentSyllables = [];
let audioCtx = null;
let analyser = null;
let onsetDetectorTimer = null;

function startMetronome(syllables) {
  if (metronomeTimer) clearInterval(metronomeTimer);
  currentSyllables = syllables;
  let i = 0;
  const display = document.getElementById('syllable-display');
  const phonetic = document.getElementById('phonetic-display');
  const bpm = document.getElementById('speed-slider').value;
  const ms = Math.round(60000 / bpm);

  function showNext() {
    if (i >= currentSyllables.length) i = 0;
    const syl = currentSyllables[i];
    display.textContent = syl.text;
    display.className = syl.emphasis ? 'emphasis' : '';
    phonetic.textContent = syl.phonetic;
    i++;
  }

  showNext();
  metronomeTimer = setInterval(showNext, ms);
}

function restartMetronome() {
  startMetronome(currentSyllables);
}

function stopAll() {
  if (metronomeTimer) clearInterval(metronomeTimer);
  metronomeTimer = null;

  if (onsetDetectorTimer) clearInterval(onsetDetectorTimer);
  onsetDetectorTimer = null;

  if (audioCtx) {
    audioCtx.close();
    audioCtx = null;
    analyser = null;
  }

  document.getElementById('syllable-display').textContent = '—';
  document.getElementById('phonetic-display').textContent = '';
  document.getElementById('audio-label').textContent = '♫ Audio will play when you press Start';

  const audioPlayer = document.getElementById('audio-player');
  audioPlayer.pause();
  audioPlayer.currentTime = 0;
  document.getElementById('btn-start').textContent = '▶ Start';
}

function startAll() {
  const audioPlayer = document.getElementById('audio-player');
  const label = document.getElementById('audio-label');

  if (!audioPlayer.src || audioPlayer.src === window.location.href) {
    startMetronome(currentSyllables);
    document.getElementById('btn-start').textContent = '⏸ Pause';
    return;
  }

  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 256;
  analyser.smoothingTimeConstant = 0.3;

  const source = audioCtx.createMediaElementSource(audioPlayer);
  source.connect(analyser);
  analyser.connect(audioCtx.destination);

  audioPlayer.play();
  label.textContent = '♫ Listening for chant onset...';
  document.getElementById('btn-start').textContent = '⏸ Pause';

  const dataArray = new Uint8Array(analyser.frequencyBinCount);
  const SILENCE_THRESHOLD = 20;
  let detected = false;

  onsetDetectorTimer = setInterval(() => {
    analyser.getByteFrequencyData(dataArray);
    const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;

    if (!detected && avg > SILENCE_THRESHOLD) {
      detected = true;
      clearInterval(onsetDetectorTimer);
      onsetDetectorTimer = null;
      label.textContent = '♫ Playing';
      startMetronome(currentSyllables);
    }
  }, 50);
}

function toggleStartStop() {
  if (metronomeTimer || onsetDetectorTimer) {
    stopAll();
  } else {
    startAll();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadChantList();

  document.getElementById('chant-select').addEventListener('change', e => {
    loadChant(e.target.value);
  });

  document.getElementById('btn-start').addEventListener('click', toggleStartStop);
  document.getElementById('btn-stop').addEventListener('click', stopAll);

  document.getElementById('speed-slider').addEventListener('input', e => {
    document.getElementById('speed-value').textContent = e.target.value;
    if (metronomeTimer) restartMetronome();
  });
});
