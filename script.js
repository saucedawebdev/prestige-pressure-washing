(function () {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const header = document.querySelector('.site-header');
    const FORM_RECIPIENT = 'ramonsauceda931@yahoo.com';

    /* ── 1. Scroll reveal ── */
    function initScrollReveal() {
        if (prefersReducedMotion) return;

        document.documentElement.classList.add('js-ready');

        const revealSelectors = [
            '.featured-header',
            '.featured-showcase',
            '.featured-list li',
            'section .container > h2',
            'section .container > .section-subtitle',
            '.cta .container',
            '.service-card',
            '.gallery-card',
            '.feature-card',
            '.testimonial-card',
            '.service-areas-map',
            '.area-card',
        ];

        const elements = document.querySelectorAll(revealSelectors.join(', '));
        const staggerGroups = new Map();

        elements.forEach((el) => {
            el.classList.add('reveal');

            const parent = el.parentElement;
            if (
                el.matches('.service-card, .gallery-card, .feature-card, .testimonial-card, .area-card, .featured-list li')
            ) {
                if (!staggerGroups.has(parent)) staggerGroups.set(parent, []);
                staggerGroups.get(parent).push(el);
            }
        });

        staggerGroups.forEach((group) => {
            group.forEach((el, index) => {
                el.style.setProperty('--reveal-delay', `${index * 100}ms`);
                el.classList.add('reveal-stagger');
            });
        });

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                });
            },
            { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
        );

        elements.forEach((el) => observer.observe(el));
    }

    /* ── 2. Mobile navigation ── */
    function initMobileNav() {
        const toggle = document.querySelector('.nav-toggle');
        const menu = document.getElementById('nav-menu');
        if (!toggle || !menu) return;

        const backdrop = document.createElement('div');
        backdrop.className = 'nav-backdrop';
        backdrop.hidden = true;
        document.body.appendChild(backdrop);

        const closeMenu = () => {
            toggle.setAttribute('aria-expanded', 'false');
            toggle.setAttribute('aria-label', 'Open menu');
            menu.classList.remove('is-open');
            backdrop.classList.remove('is-visible');
            backdrop.hidden = true;
            document.body.classList.remove('nav-open');
        };

        const openMenu = () => {
            toggle.setAttribute('aria-expanded', 'true');
            toggle.setAttribute('aria-label', 'Close menu');
            menu.classList.add('is-open');
            backdrop.hidden = false;
            requestAnimationFrame(() => backdrop.classList.add('is-visible'));
            document.body.classList.add('nav-open');
        };

        toggle.addEventListener('click', () => {
            const isOpen = toggle.getAttribute('aria-expanded') === 'true';
            if (isOpen) closeMenu();
            else openMenu();
        });

        backdrop.addEventListener('click', closeMenu);

        menu.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', closeMenu);
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
                closeMenu();
                toggle.focus();
            }
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) closeMenu();
        });
    }

    /* ── 3. Header scroll state ── */
    function initHeaderScroll() {
        if (!header) return;

        const onScroll = () => {
            header.classList.toggle('is-scrolled', window.scrollY > 50);
        };

        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
    }

    /* ── 4. Anchor scroll with offset ── */
    function getScrollOffset() {
        return (header?.offsetHeight ?? 80) + 16;
    }

    function scrollToTarget(target) {
        const top = target.getBoundingClientRect().top + window.scrollY - getScrollOffset();
        window.scrollTo({
            top,
            behavior: prefersReducedMotion ? 'auto' : 'smooth',
        });
    }

    function initAnchorScroll() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="#"]');
            if (!link) return;

            const id = link.getAttribute('href');
            if (!id || id === '#') return;

            const target = document.querySelector(id);
            if (!target) return;

            e.preventDefault();
            scrollToTarget(target);
            history.pushState(null, '', id);
        });
    }

    /* ── 5. Gallery lightbox ── */
    function initGalleryLightbox() {
        const galleryImages = document.querySelectorAll('.gallery-card img');
        if (!galleryImages.length) return;

        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox';
        lightbox.setAttribute('role', 'dialog');
        lightbox.setAttribute('aria-modal', 'true');
        lightbox.setAttribute('aria-label', 'Image preview');
        lightbox.hidden = true;
        lightbox.innerHTML = `
            <div class="lightbox-backdrop"></div>
            <button class="lightbox-close" type="button" aria-label="Close image preview">&times;</button>
            <figure class="lightbox-content">
                <img src="" alt="">
                <figcaption class="lightbox-caption"></figcaption>
            </figure>
        `;
        document.body.appendChild(lightbox);

        const lightboxImg = lightbox.querySelector('img');
        const lightboxCaption = lightbox.querySelector('.lightbox-caption');
        const closeBtn = lightbox.querySelector('.lightbox-close');
        const backdrop = lightbox.querySelector('.lightbox-backdrop');
        let lastFocused = null;

        galleryImages.forEach((img) => {
            const card = img.closest('.gallery-card');
            if (card) {
                card.classList.add('gallery-card--interactive');
                card.setAttribute('tabindex', '0');
                card.setAttribute('role', 'button');
                card.setAttribute('aria-label', `View ${img.alt || 'gallery image'} full size`);
            }
        });

        function openLightbox(img) {
            lastFocused = document.activeElement;
            lightboxImg.src = img.src;
            lightboxImg.alt = img.alt;
            lightboxCaption.textContent = img.alt || '';
            lightbox.hidden = false;
            document.body.classList.add('lightbox-open');
            closeBtn.focus();
        }

        function closeLightbox() {
            lightbox.hidden = true;
            document.body.classList.remove('lightbox-open');
            lightboxImg.src = '';
            if (lastFocused) lastFocused.focus();
        }

        function handleOpen(e) {
            const card = e.target.closest('.gallery-card');
            if (!card) return;
            const img = card.querySelector('img');
            if (img) openLightbox(img);
        }

        document.querySelector('.gallery-grid')?.addEventListener('click', handleOpen);
        document.querySelector('.gallery-grid')?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleOpen(e);
            }
        });

        closeBtn.addEventListener('click', closeLightbox);
        backdrop.addEventListener('click', closeLightbox);

        document.addEventListener('keydown', (e) => {
            if (!lightbox.hidden && e.key === 'Escape') closeLightbox();
        });
    }

    /* ── 6. Contact form ── */
    function initContactForm() {
        const form = document.getElementById('contact-form');
        const status = document.getElementById('form-status');
        if (!form || !status) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            const formData = new FormData(form);
            if (formData.get('_honey')) return;

            const submitBtn = form.querySelector('[type="submit"]');
            const defaultBtnText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';
            status.hidden = true;

            try {
                const response = await fetch(`https://formsubmit.co/ajax/${FORM_RECIPIENT}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                    body: JSON.stringify({
                        name: formData.get('name'),
                        email: formData.get('email'),
                        phone: formData.get('phone'),
                        message: formData.get('message'),
                        _subject: 'New estimate request — Prestige Pressure Washing',
                        _template: 'table',
                        _captcha: 'false',
                    }),
                });

                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || 'Unable to send your request.');
                }

                status.hidden = false;
                status.className = 'form-status is-success';
                status.textContent =
                    "Thanks! Your request has been received. We'll contact you within 24 hours.";
                form.reset();
            } catch {
                status.hidden = false;
                status.className = 'form-status is-error';
                status.textContent =
                    'Something went wrong. Please try again or call us directly.';
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = defaultBtnText;
            }
        });
    }

    initScrollReveal();
    initMobileNav();
    initHeaderScroll();
    initAnchorScroll();
    initGalleryLightbox();
    initContactForm();
})();
