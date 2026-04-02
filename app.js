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

function getAudioUrl(path) {
  if (path.startsWith('http')) return path;
  return `https://${GITHUB_USER}.github.io/${GITHUB_REPO}/${path}`;
}

async function fetchChant(url) {
  const res = await fetch(url);
  return await res.json();
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

  const slider = document.getElementById('speed-slider');
  const sliderValue = document.getElementById('speed-value');
  if (chant.defaultBpm) {
    slider.value = chant.defaultBpm;
    sliderValue.textContent = chant.defaultBpm;
  }

  const audioPlayer = document.getElementById('audio-player');
  const audioSection = document.getElementById('audio-section');
  const audioLabel = document.getElementById('audio-label');

  if (chant.audioUrl) {
    audioPlayer.src = getAudioUrl(chant.audioUrl);
    audioSection.style.display = 'block';
    audioLabel.textContent = '♫ Press Start when ready';
  } else {
    audioPlayer.src = '';
    audioSection.style.display = 'none';
  }

  currentSyllables = chant.syllables;
  currentOffset = chant.audioOffset || 0;

  document.getElementById('syllable-display').textContent = '—';
  document.getElementById('phonetic-display').textContent = '';
  document.getElementById('btn-start').textContent = '▶ Start';
}

let metronomeTimer = null;
let currentSyllables = [];
let currentOffset = 0;
let offsetTimer = null;

function startMetronome() {
  if (metronomeTimer) clearInterval(metronomeTimer);
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

function stopAll() {
  if (metronomeTimer) clearInterval(metronomeTimer);
  metronomeTimer = null;

  if (offsetTimer) clearInterval(offsetTimer);
  offsetTimer = null;

  const display = document.getElementById('syllable-display');
  const phonetic = document.getElementById('phonetic-display');
  const btnStart = document.getElementById('btn-start');
  const audioPlayer = document.getElementById('audio-player');
  const audioLabel = document.getElementById('audio-label');

  if (display) display.textContent = '—';
  if (phonetic) phonetic.textContent = '';
  if (btnStart) btnStart.textContent = '▶ Start';
  if (audioLabel) audioLabel.textContent = '♫ Press Start when ready';

  if (audioPlayer) {
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
  }
}

function startAll() {
  const audioPlayer = document.getElementById('audio-player');
  const audioLabel = document.getElementById('audio-label');

  audioPlayer.play();
  document.getElementById('btn-start').textContent = '⏸ Pause';

  if (currentOffset > 0) {
    let remaining = currentOffset;
    audioLabel.textContent = `♫ Chant begins in ${remaining}s...`;
    offsetTimer = setInterval(() => {
      remaining--;
      if (remaining > 0) {
        audioLabel.textContent = `♫ Chant begins in ${remaining}s...`;
      } else {
        clearInterval(offsetTimer);
        offsetTimer = null;
        audioLabel.textContent = '♫ Playing';
        startMetronome();
      }
    }, 1000);
  } else {
    audioLabel.textContent = '♫ Playing';
    startMetronome();
  }
}

function toggleStartStop() {
  if (metronomeTimer || offsetTimer) {
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
    if (metronomeTimer) {
      clearInterval(metronomeTimer);
      metronomeTimer = null;
      startMetronome();
    }
  });
});
