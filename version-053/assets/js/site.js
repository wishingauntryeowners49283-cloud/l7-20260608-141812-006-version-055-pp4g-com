import { H as Hls } from "./video-player-dru42stk.js";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function setupMobileMenu() {
    const button = $('[data-mobile-menu-button]');
    const menu = $('[data-mobile-menu]');

    if (!button || !menu) {
        return;
    }

    button.addEventListener('click', () => {
        menu.classList.toggle('is-open');
        document.body.classList.toggle('is-menu-open', menu.classList.contains('is-open'));
    });
}

function setupHeroCarousel() {
    const root = $('[data-hero]');

    if (!root) {
        return;
    }

    const slides = $$('[data-hero-slide]', root);
    const dots = $$('[data-hero-dot]', root);
    const prev = $('[data-hero-prev]', root);
    const next = $('[data-hero-next]', root);

    if (slides.length <= 1) {
        return;
    }

    let index = 0;
    let timer = null;

    const show = (nextIndex) => {
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle('is-active', slideIndex === index);
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle('is-active', dotIndex === index);
        });
    };

    const start = () => {
        stop();
        timer = window.setInterval(() => show(index + 1), 5500);
    };

    const stop = () => {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
    };

    prev?.addEventListener('click', () => {
        show(index - 1);
        start();
    });

    next?.addEventListener('click', () => {
        show(index + 1);
        start();
    });

    dots.forEach((dot) => {
        dot.addEventListener('click', () => {
            const dotIndex = Number(dot.dataset.heroDot || 0);
            show(dotIndex);
            start();
        });
    });

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    start();
}

function setupCardFilter() {
    const root = $('[data-card-filter]');

    if (!root) {
        return;
    }

    const keyword = $('[data-filter-keyword]', root);
    const region = $('[data-filter-region]', root);
    const year = $('[data-filter-year]', root);
    const type = $('[data-filter-type]', root);
    const count = $('[data-filter-count]', root);
    const list = $('[data-filter-list]');
    const empty = $('[data-filter-empty]');
    const cards = list ? $$('.movie-card', list) : [];

    const apply = () => {
        const q = (keyword?.value || '').trim().toLowerCase();
        const selectedRegion = region?.value || '';
        const selectedYear = year?.value || '';
        const selectedType = type?.value || '';
        let visible = 0;

        cards.forEach((card) => {
            const matchesKeyword = !q || (card.dataset.search || '').includes(q);
            const matchesRegion = !selectedRegion || card.dataset.region === selectedRegion;
            const matchesYear = !selectedYear || card.dataset.year === selectedYear;
            const matchesType = !selectedType || card.dataset.type === selectedType;
            const matches = matchesKeyword && matchesRegion && matchesYear && matchesType;
            card.hidden = !matches;
            visible += matches ? 1 : 0;
        });

        if (count) {
            count.textContent = `${visible} 部内容`;
        }

        if (empty) {
            empty.hidden = visible !== 0;
        }
    };

    [keyword, region, year, type].forEach((control) => {
        control?.addEventListener('input', apply);
        control?.addEventListener('change', apply);
    });

    apply();
}

function normalize(value) {
    return String(value || '').trim().toLowerCase();
}

function movieCardTemplate(movie) {
    return `
        <article class="movie-card" data-search="${escapeHtml(movie.search)}">
            <a class="movie-card__cover poster-frame" href="${escapeHtml(movie.url)}">
                <img src="${escapeHtml(movie.cover)}" alt="${escapeHtml(movie.title)}" class="movie-card__image" loading="lazy" onerror="this.classList.add('is-hidden');">
                <span class="movie-card__duration">${escapeHtml(movie.duration)}</span>
            </a>
            <div class="movie-card__body">
                <a class="movie-card__title" href="${escapeHtml(movie.url)}">${escapeHtml(movie.title)}</a>
                <div class="movie-card__meta">
                    <span>★ ${escapeHtml(movie.rating)}</span>
                    <span>${escapeHtml(movie.viewsText)}次</span>
                </div>
                <div class="movie-card__submeta">
                    <span>${escapeHtml(movie.region)}</span>
                    <span>${escapeHtml(movie.year)}</span>
                </div>
                <a class="movie-card__category" href="${escapeHtml(movie.categoryUrl)}">${escapeHtml(movie.category)}</a>
            </div>
        </article>
    `;
}

function escapeHtml(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function setupSearchApp() {
    const root = $('[data-search-app]');

    if (!root || !Array.isArray(window.MOVIES)) {
        return;
    }

    const keyword = $('[data-search-keyword]', root);
    const region = $('[data-search-region]', root);
    const year = $('[data-search-year]', root);
    const type = $('[data-search-type]', root);
    const count = $('[data-search-count]', root);
    const results = $('[data-search-results]', root);
    const pagination = $('[data-search-pagination]', root);
    const pageSize = 48;
    let page = 1;
    let filtered = window.MOVIES.slice();

    const urlKeyword = new URLSearchParams(window.location.search).get('q');
    if (urlKeyword && keyword) {
        keyword.value = urlKeyword;
    }

    const apply = () => {
        const q = normalize(keyword?.value);
        const selectedRegion = region?.value || '';
        const selectedYear = year?.value || '';
        const selectedType = type?.value || '';

        filtered = window.MOVIES.filter((movie) => {
            const matchesKeyword = !q || normalize(movie.search).includes(q);
            const matchesRegion = !selectedRegion || movie.region === selectedRegion;
            const matchesYear = !selectedYear || String(movie.year) === selectedYear;
            const matchesType = !selectedType || movie.type === selectedType;
            return matchesKeyword && matchesRegion && matchesYear && matchesType;
        });

        page = 1;
        render();
    };

    const render = () => {
        const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
        page = Math.min(page, totalPages);
        const start = (page - 1) * pageSize;
        const current = filtered.slice(start, start + pageSize);

        if (count) {
            count.textContent = `${filtered.length} 部内容`;
        }

        if (results) {
            results.innerHTML = current.length
                ? current.map(movieCardTemplate).join('')
                : '<p class="empty-state">没有找到匹配内容，请调整搜索条件。</p>';
        }

        renderPagination(totalPages);
    };

    const renderPagination = (totalPages) => {
        if (!pagination) {
            return;
        }

        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }

        const buttons = [];
        const min = Math.max(1, page - 3);
        const max = Math.min(totalPages, page + 3);

        buttons.push(`<button type="button" data-page="${Math.max(1, page - 1)}">上一页</button>`);
        for (let i = min; i <= max; i += 1) {
            buttons.push(`<button type="button" class="${i === page ? 'is-active' : ''}" data-page="${i}">${i}</button>`);
        }
        buttons.push(`<button type="button" data-page="${Math.min(totalPages, page + 1)}">下一页</button>`);
        pagination.innerHTML = buttons.join('');
    };

    pagination?.addEventListener('click', (event) => {
        const target = event.target.closest('button[data-page]');
        if (!target) {
            return;
        }
        page = Number(target.dataset.page || 1);
        render();
        root.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    [keyword, region, year, type].forEach((control) => {
        control?.addEventListener('input', apply);
        control?.addEventListener('change', apply);
    });

    apply();
}

function setupPlayers() {
    $$('.js-player').forEach((video) => {
        const shell = video.closest('[data-player-shell]');
        const button = $('[data-play-button]', shell || document);
        const message = $('[data-player-message]', shell || document);
        const src = video.dataset.hlsSrc;
        let hls = null;
        let initialized = false;

        const showMessage = (text) => {
            if (!message) {
                return;
            }
            message.textContent = text;
            message.hidden = false;
        };

        const init = () => {
            if (initialized) {
                video.play().catch(() => undefined);
                return;
            }

            initialized = true;
            button?.classList.add('is-hidden');

            if (!src) {
                showMessage('未找到可用播放源。');
                return;
            }

            if (Hls && Hls.isSupported()) {
                hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                });
                hls.loadSource(src);
                hls.attachMedia(video);
                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    video.play().catch(() => undefined);
                });
                hls.on(Hls.Events.ERROR, (eventName, data) => {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                        showMessage('网络错误，正在尝试重新加载播放源。');
                        hls.startLoad();
                    } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                        showMessage('媒体错误，正在尝试恢复播放。');
                        hls.recoverMediaError();
                    } else {
                        showMessage('播放器初始化失败，请刷新页面后重试。');
                        hls.destroy();
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = src;
                video.addEventListener('loadedmetadata', () => {
                    video.play().catch(() => undefined);
                }, { once: true });
            } else {
                showMessage('当前浏览器不支持 HLS 播放。');
            }
        };

        button?.addEventListener('click', init);
        video.addEventListener('play', () => button?.classList.add('is-hidden'));
        window.addEventListener('beforeunload', () => hls?.destroy());
    });
}

setupMobileMenu();
setupHeroCarousel();
setupCardFilter();
setupSearchApp();
setupPlayers();
