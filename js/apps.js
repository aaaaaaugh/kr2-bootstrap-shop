/* SoundProject — общий скрипт для всех 4 страниц */
const SRC = n => `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${n}.mp3`;
const BASE_TRACKS = [
    { id: 1, title: 'Ночной маршрут', artist: 'Lume', genre: 'Electronic', hue: 18, src: SRC(1) },
    { id: 2, title: 'Тёплый бетон', artist: 'Кора', genre: 'Lo-Fi', hue: 200, src: SRC(2) },
    { id: 3, title: 'Сто вторая', artist: 'Дым и Ко', genre: 'Hip-Hop', hue: 280, src: SRC(3) },
    { id: 4, title: 'Стекло', artist: 'Anya Vale', genre: 'Pop', hue: 340, src: SRC(4) },
    { id: 5, title: 'Перегон', artist: 'Trans-Sib', genre: 'Rock', hue: 8, src: SRC(5) },
    { id: 6, title: 'Тихий лифт', artist: 'Lume', genre: 'Ambient', hue: 170, src: SRC(6) },
    { id: 7, title: 'Фонари', artist: 'Кора', genre: 'Lo-Fi', hue: 45, src: SRC(7) },
    { id: 8, title: 'Низкая вода', artist: 'Ostrov', genre: 'Electronic', hue: 230, src: SRC(8) },
    { id: 9, title: 'Лето в метро', artist: 'Anya Vale', genre: 'Pop', hue: 320, src: SRC(9) },
    { id: 10, title: 'Гул', artist: 'Trans-Sib', genre: 'Rock', hue: 24, src: SRC(10) },
    { id: 11, title: 'Серый кофе', artist: 'Дым и Ко', genre: 'Hip-Hop', hue: 260, src: SRC(11) },
    { id: 12, title: 'Долгий вдох', artist: 'Ostrov', genre: 'Ambient', hue: 150, src: SRC(12) }
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

/* ---------- Карточки ---------- */
function cardHTML(t, col = 'col-12 col-md-6 col-lg-4') {
    return `<div class="${col}"><article class="card track-card h-100">
    <div class="cover" style="--h:${t.hue}">
      <button class="btn btn-play" data-play="${t.id}" aria-label="Играть: ${esc(t.title)}"><i class="bi bi-play-fill"></i></button>
    </div>
    <div class="card-body">
      <span class="badge badge-genre">${esc(t.genre)}</span>
      <h3 class="h6 mt-2 mb-0">${esc(t.title)}</h3>
      <p class="small text-secondary mb-3">${esc(t.artist)}</p>
      <div class="d-flex justify-content-between align-items-center">
        <a href="product.html?id=${t.id}" class="btn btn-sm btn-outline-dark">Открыть</a>
        <button class="btn btn-sm btn-like" data-like="${t.id}" aria-label="Лайк"><i class="bi bi-heart"></i></button>
      </div>
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
    audio.play().catch(() => showToast('Не удалось запустить аудио. Проверьте интернет.'));
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
        b.innerHTML = `<i class="bi ${on ? 'bi-pause-fill' : 'bi-play-fill'}"></i>`;
    });
    const main = $('#pToggle');
    if (main) main.innerHTML = `<i class="bi ${playing ? 'bi-pause-fill' : 'bi-play-fill'} fs-4"></i>`;
    const likes = store.get('sp_likes', []);
    $$('[data-like]').forEach(b => {
        const liked = likes.includes(Number(b.dataset.like));
        b.classList.toggle('liked', liked);
        b.setAttribute('aria-pressed', liked);
        b.innerHTML = `<i class="bi ${liked ? 'bi-heart-fill' : 'bi-heart'}"></i>`;
    });
}
function toggleLike(id) {
    id = Number(id);
    const likes = store.get('sp_likes', []);
    const i = likes.indexOf(id);
    i > -1 ? likes.splice(i, 1) : likes.push(id);
    store.set('sp_likes', likes);
    refreshUI();
    document.dispatchEvent(new CustomEvent('likes:changed'));
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
    const l = e.target.closest('[data-like]');
    if (l) toggleLike(l.dataset.like);
});

document.addEventListener('DOMContentLoaded', () => {
    // Нижний плеер
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

    // Волна в hero
    const wave = $('#wave');
    if (wave) {
        wave.innerHTML = Array.from({ length: 56 }, (_, i) => {
            const h = 18 + Math.abs(Math.sin(i * 0.5) * 55 + Math.sin(i * 1.3) * 25);
            return `<span style="--h:${h}%;--d:${(i % 9) * 0.08}s"></span>`;
        }).join('');
    }

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
        showToast('Трек загружен и добавлен в каталог.');
        document.dispatchEvent(new CustomEvent('tracks:changed'));
    });

    document.dispatchEvent(new CustomEvent('sp:ready'));
    refreshUI();
});

window.SP = { audio, esc, allTracks, renderCards, playTrack, showToast, refreshUI, $, $$ };