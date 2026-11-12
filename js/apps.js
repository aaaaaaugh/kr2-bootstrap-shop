/* SoundProject — общий скрипт для всех страниц */
const SRC = n => `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${n}.mp3`;
const BASE_TRACKS = [
    { id: 1, title: '100 из 100', artist: 'CODE80, sabdeb, 4, fxk...', genre: 'Electronic', hue: 18, src: SRC(1) },
    { id: 2, title: 'Платина - Валентина', artist: 'Attem, un voleur, Mr Ne...', genre: 'Lo-Fi', hue: 200, src: SRC(2) },
    { id: 3, title: 'Maybelline New York', artist: 'scalevillain, static, Cod...', genre: 'Hip-Hop', hue: 280, src: SRC(3) },
    { id: 4, title: 'Бентли', artist: 'THRILL PILL, artizzzzd...', genre: 'Pop', hue: 340, src: SRC(4) },
    { id: 5, title: 'I Am Cute', artist: 'LIL MORTY', genre: 'Rock', hue: 8, src: SRC(5) },
    { id: 6, title: 'Тихий лифт', artist: 'Lume', genre: 'Ambient', hue: 170, src: SRC(6) }
];

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const store = {
    get: (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
    set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { } }
};
const allTracks = () => BASE_TRACKS.concat(store.get('sp_uploads', []));
const fmt = s => (isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}` : '0:00');
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ---------- Карточки треков (в стиле Spotify со скриншота) ---------- */
function cardHTML(t, col = 'col-6 col-md-4 col-lg-2') {
    return `<div class="${col}"><article class="track-card h-100">
    <div class="cover" style="background-image: url('https://picsum.photos/seed/track${t.id}/300/300')">
      <button class="btn btn-play position-absolute start-0 bottom-0 m-2 text-white bg-dark bg-opacity-75 rounded-circle d-flex align-items-center justify-content-center" data-play="${t.id}" aria-label="Play: ${esc(t.title)}" style="width:40px;height:40px;"><i class="bi bi-play-fill fs-5"></i></button>
    </div>
    <div class="pt-2">
      <a href="catalog.html?id=${t.id}" class="text-decoration-none"><h3 class="h6">${esc(t.title)}</h3></a>
      <p>${esc(t.artist)}</p>
    </div></article></div>`;
}

function renderCards(sel, list, col) {
    const box = $(sel);
    if (box) box.innerHTML = list.map(t => cardHTML(t, col)).join('');
    refreshUI();
}

/* ---------- Плеер ---------- */
const audio = new Audio();
audio.preload = 'none';
let currentId = null;

function playTrack(id) {
    const t = allTracks().find(x => x.id === Number(id));
    if (!t) return;
    if (currentId === t.id) { audio.paused ? audio.play() : audio.pause(); return; }
    currentId = t.id;
    audio.src = t.src || SRC(1);
    audio.play().catch(() => showToast('Could not play audio. Check internet connection.'));
    const title = $('#playerTitle'), artist = $('#playerArtist');
    if (title) title.textContent = t.title;
    if (artist) artist.textContent = t.artist;
    store.set('sp_last', t.id);
}

function step(dir) {
    const list = allTracks();
    const i = list.findIndex(t => t.id === currentId);
    playTrack(list[(i + dir + list.length) % list.length].id);
}

function refreshUI() {
    const playing = !audio.paused;
    document.body.classList.toggle('is-playing', playing);
    $$('[data-play]').forEach(b => {
        const on = playing && Number(b.dataset.play) === currentId;
        b.innerHTML = `<i class="bi ${on ? 'bi-pause-fill' : 'bi-play-fill'} fs-5"></i>`;
    });
    const main = $('#pToggle');
    if (main) main.innerHTML = `<i class="bi ${playing ? 'bi-pause-fill' : 'bi-play-fill'} fs-4"></i>`;
}

function showToast(msg) {
    const el = $('#appToast');
    if (!el) return;
    $('.toast-body', el).textContent = msg;
    bootstrap.Toast.getOrCreateInstance(el, { delay: 3500 }).show();
}

/* ---------- События ---------- */
document.addEventListener('click', e => {
    const p = e.target.closest('[data-play]');
    if (p) { playTrack(p.dataset.play); return; }
});

document.addEventListener('DOMContentLoaded', () => {
    $('#pToggle')?.addEventListener('click', () => {
        if (currentId === null) playTrack(store.get('sp_last', 1)); else audio.paused ? audio.play() : audio.pause();
    });
    $('#pPrev')?.addEventListener('click', () => step(-1));
    $('#pNext')?.addEventListener('click', () => step(1));

    const bar = $('#pProgress'), vol = $('#pVolume');
    bar?.addEventListener('input', () => { if (audio.duration) audio.currentTime = (bar.value / 100) * audio.duration; });
    vol?.addEventListener('input', () => { audio.volume = vol.value / 100; });

    audio.addEventListener('timeupdate', () => {
        if (bar && audio.duration) bar.value = (audio.currentTime / audio.duration) * 100;
        const tm = $('#pTime');
        if (tm) tm.textContent = `${fmt(audio.currentTime)} / ${fmt(audio.duration)}`;
    });

    ['play', 'pause', 'ended'].forEach(ev => audio.addEventListener(ev, refreshUI));
    audio.addEventListener('ended', () => step(1));

    // Форма загрузки трека
    const form = $('#uploadForm');
    form?.addEventListener('submit', e => {
        e.preventDefault();
        form.classList.add('was-validated');
        if (!form.checkValidity()) return;
        const uploads = store.get('sp_uploads', []);
        uploads.push({
            id: Date.now(), title: $('#upTitle').value.trim(), artist: $('#upArtist').value.trim(),
            genre: $('#upGenre').value, hue: Math.floor(Math.random() * 360), src: SRC(1), mine: true
        });
        store.set('sp_uploads', uploads);
        bootstrap.Modal.getInstance($('#uploadModal')).hide();
        form.reset();
        form.classList.remove('was-validated');
        showToast('Track uploaded successfully.');
        document.dispatchEvent(new CustomEvent('tracks:changed'));
    });

    document.dispatchEvent(new CustomEvent('sp:ready'));
    refreshUI();
});

window.SP = { audio, esc, allTracks, renderCards, playTrack, showToast, refreshUI, $, $$ };