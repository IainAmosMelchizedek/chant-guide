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
  const chant = await fetchChant(url);
  document.getElementById('chant-title').textContent = chant.title;
  document.getElementById('chant-tradition').textContent = chant.tradition + ' — ' + chant.source;
  document.getElementById('chant-sanskrit').textContent = chant.sanskrit.replace(/\\n/g, '\n');
  document.getElementById('chant-meaning').textContent = chant.meaning;
  document.getElementById('chant-rounds').textContent = 'Rounds: ' + chant.rounds;

  const audioBtn = document.getElementById('btn-audio');
  const audioPlayer = document.getElementById('audio-player');

  if (chant.audioUrl) {
    audioPlayer.src = chant.audioUrl;
    audioBtn.style.display = 'inline-block';
    audioBtn.textContent = '♫ Play Audio';
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
  } else {
    audioBtn.style.display = 'none';
    audioPlayer.src = '';
  }

  startMetronome(chant.syllables);
}

let metronomeTimer = null;
let currentSyllables = [];

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

function stopMetronome() {
  if (metronomeTimer) clearInterval(metronomeTimer);
  metronomeTimer = null;
  document.getElementById('syllable-display').textContent = '—';
  document.getElementById('phonetic-display').textContent = '';
}

function toggleAudio() {
  const audioPlayer = document.getElementById('audio-player');
  const audioBtn = document.getElementById('btn-audio');
  if (audioPlayer.paused) {
    audioPlayer.play();
    audioBtn.textContent = '■ Stop Audio';
  } else {
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
    audioBtn.textContent = '♫ Play Audio';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadChantList();

  document.getElementById('chant-select').addEventListener('change', e => {
    loadChant(e.target.value);
  });

  document.getElementById('btn-stop').addEventListener('click', stopMetronome);

  document.getElementById('btn-start').addEventListener('click', async () => {
    const url = document.getElementById('chant-select').value;
    const chant = await fetchChant(url);
    startMetronome(chant.syllables);
  });

  document.getElementById('btn-audio').addEventListener('click', toggleAudio);

  document.getElementById('speed-slider').addEventListener('input', e => {
    document.getElementById('speed-value').textContent = e.target.value;
    if (metronomeTimer) restartMetronome();
  });
});
