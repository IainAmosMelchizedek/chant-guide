const GITHUB_USER = 'IainAmosMelchizedek';
const GITHUB_REPO = 'chant-guide';
const CHANTS_PATH = 'chants';
const API_BASE = 'https://api.github.com';

async function fetchChantList() {
  const url = `${API_BASE}/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${CHANTS_PATH}`;
  const res = await fetch(url);
  const files = await res.json();
  return files.filter(f => f.name.endsWith('.json'));
}

async function fetchChant(downloadUrl) {
  const res = await fetch(downloadUrl);
  const chant = await res.json();
  return chant;
}

async function loadChantList() {
  const files = await fetchChantList();
  const select = document.getElementById('chant-select');
  select.innerHTML = '';
  files.forEach(file => {
    const opt = document.createElement('option');
    opt.value = file.download_url;
    opt.textContent = file.name.replace('.json', '').replace(/-/g, ' ');
    select.appendChild(opt);
  });
  if (files.length > 0) loadChant(files[0].download_url);
}

async function loadChant(url) {
  const chant = await fetchChant(url);
  document.getElementById('chant-title').textContent = chant.title;
  document.getElementById('chant-tradition').textContent = chant.tradition + ' — ' + chant.source;
  document.getElementById('chant-sanskrit').textContent = chant.sanskrit.replace(/\\n/g, '\n');
  document.getElementById('chant-meaning').textContent = chant.meaning;
  document.getElementById('chant-rounds').textContent = 'Rounds: ' + chant.rounds;
  startMetronome(chant.syllables);
}

let metronomeTimer = null;

function startMetronome(syllables) {
  if (metronomeTimer) clearInterval(metronomeTimer);
  let i = 0;
  const display = document.getElementById('syllable-display');
  const phonetic = document.getElementById('phonetic-display');
  const bpm = document.getElementById('speed-slider').value;
  const ms = Math.round(60000 / bpm);

  function showNext() {
    if (i >= syllables.length) i = 0;
    const syl = syllables[i];
    display.textContent = syl.text;
    display.className = syl.emphasis ? 'emphasis' : '';
    phonetic.textContent = syl.phonetic;
    i++;
  }

  showNext();
  metronomeTimer = setInterval(showNext, ms);
}

function stopMetronome() {
  if (metronomeTimer) clearInterval(metronomeTimer);
  document.getElementById('syllable-display').textContent = '—';
  document.getElementById('phonetic-display').textContent = '';
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

document.getElementById('speed-slider').addEventListener('input', async e => {
    document.getElementById('speed-value').textContent = e.target.value;
    const url = document.getElementById('chant-select').value;
    const chant = await fetchChant(url);
    startMetronome(chant.syllables);
  });
