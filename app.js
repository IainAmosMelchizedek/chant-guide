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
  const audioLabel = document.getElementById('audio-label');
  const slider = document.getElementById('speed-slider');
  const sliderValue = document.getElementById('speed-value');

  if (chant.defaultBpm) {
    slider.value = chant.defaultBpm;
    sliderValue.textContent = chant.defaultBpm;
  }

  if (chant.audioUrl) {
    audioPlayer.src = getAudioUrl(chant.audioUrl);
    audioSection.style.display = 'block';
    audioLabel.textContent = '♫ Audio will play when you press Start';
  } else {
    audioPlayer.src = '';
    audioSection.style.display = 'none';
  }

  currentSyllables = chant.syllables;
  currentOffset = chant.audioOffset || 0;
}

let metronomeTimer = null;
let currentSyllables = [];
let currentOffset = 0;
let metronomeStarted = false;
let offsetTimer = null;

function startMetronome(syllables) {
  if (metronomeTimer) clearInterval(metronomeTimer);
  currentSyllables = syllables;
  metronomeStarted = true;
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

  if (offsetTimer) clearTimeout(offsetTimer);
  offsetTimer = null;

  metronomeStarted = false;

  const display = document.getElementById('syllable-display');
  const phonetic = document.getElementById('phonetic-display');
  const btnStart = document.getElementById('btn-start');
  const audioPlayer = document.getElementById('audio-player');
  const audioLabel = document.getElementById('audio-label');

  if (display) display.textContent = '—';
  if (phonetic) phonetic.textContent = '';
  if (btnStart) btnStart.textContent = '▶ Start';
  if (audioLabel) audioLabel.textContent = '♫ Audio will play when you press Start';

  if (audioPlayer) {
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
  }
}

function startAll() {
  const audioPlayer = document.getElementById('audio-player');
  const audioLabel = document.getElementById('audio-label');

  if (!audioPlayer.src || audioPlayer.src === window.location.href) {
    startMetronome(currentSyllables);
    document.getElementById('btn-start').textContent = '⏸ Pause';
    return;
  }

  audioPlayer.play();
  document.getElementById('btn-start').textContent = '⏸ Pause';

  if (currentOffset > 0) {
    audioLabel.textContent = `♫ Chant begins in ${currentOffset}s...`;
    let remaining = currentOffset;
    const countdown = setInterval(() => {
      remaining--;
      if (remaining > 0) {
        audioLabel.textContent = `♫ Chant begins in ${remaining}s...`;
      } else {
        clearInterval(countdown);
        audioLabel.textContent = '♫ Playing';
        startMetronome(currentSyllables);
      }
    }, 1000);
    offsetTimer = countdown;
  } else {
    audioLabel.textContent = '♫ Playing';
    startMetronome(currentSyllables);
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
    if (metronomeTimer) restartMetronome();
  });
});
