/* ==========================================================================
   Luca Monteserin | PH + VIDEO - Lógica e Interactividad
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Selectores utilitarios
  const $ = (selector) => document.querySelector(selector);   const $$ = (selector) => [...document.querySelectorAll(selector)];

  const WA_NUMBER = "5493492591128";
  const pad = (n) => String(n).padStart(2, '0');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayKey = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

  const setPressed = (selector, fn) => {
    $$(selector).forEach((btn) => btn.setAttribute('aria-pressed', fn(btn)));
  };

  const showToast = (message) => {
    const toastEl = $('#toast');
    const toastMsg = $('#toast-msg');
    if (!toastEl || !toastMsg) return;

    toastMsg.textContent = message;
    toastEl.classList.remove('hidden');
    toastEl.classList.add('flex', 'show');

    clearTimeout(toastEl._timer);
    toastEl._timer = setTimeout(() => {
      toastEl.classList.add('hidden');
      toastEl.classList.remove('flex', 'show');
    }, 3500);
  };

  const scrollToSection = (id) => {
    const target = $(id);
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  };

  /* --------------------------------------------------------------------------
     1. Header, Menú Móvil y Hero Slider
     -------------------------------------------------------------------------- */
  const header = $('#main-header');   window.addEventListener('scroll', () => {     if (header) {       header.classList.toggle('scrolled', window.scrollY > 20);     }   }, { passive: true });    // Autoplay del carrusel de fondo en Hero   const slides = $$('.hero-slide');
  let currentSlide = 0;
  if (slides.length > 0 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    setInterval(() => {
      slides[currentSlide].classList.remove('active');
      currentSlide = (currentSlide + 1) % slides.length;
      slides[currentSlide].classList.add('active');
    }, 5000);
  }

  // Menú desplegable en pantallas móviles
  const mobileMenu = $('#mobile-menu');
  const menuBtn = $('#menu-btn');   if (menuBtn && mobileMenu) {     menuBtn.onclick = () => {       const isOpen = mobileMenu.classList.toggle('hidden') === false;       menuBtn.setAttribute('aria-expanded', isOpen);     };      mobileMenu.querySelectorAll('a').forEach((link) => {       link.onclick = () => {         mobileMenu.classList.add('hidden');         menuBtn.setAttribute('aria-expanded', 'false');       };     });   }    /* --------------------------------------------------------------------------      2. Animaciones al Scroll (Reveal) y Spy de Navegación      -------------------------------------------------------------------------- */   const revealObserver = new IntersectionObserver((entries) => {     entries.forEach((entry) => {       if (entry.isIntersecting) {         entry.target.classList.add('on');         revealObserver.unobserve(entry.target);       }     });   }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });    $$('.reveal').forEach((el, index) => {
    el.style.transitionDelay = `${(index % 3) * 0.1}s`;
    revealObserver.observe(el);
  });

  const navLinks = $$('header nav a');
  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navLinks.forEach((link) => {
          link.classList.toggle('current', link.getAttribute('href') === `#${entry.target.id}`);
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  navLinks.forEach((link) => {
    const section = $(link.getAttribute('href'));
    if (section) spyObserver.observe(section);
  });

  /* --------------------------------------------------------------------------
     3. Filtros de Galería
     -------------------------------------------------------------------------- */
  $$('.filter').forEach((btn) => {     btn.onclick = () => {       const category = btn.dataset.cat;       setPressed('.filter', (x) => x === btn);       $$
('#gallery .card').forEach((card) => {
        card.style.display = (category === 'todos' || card.dataset.cat === category) ? '' : 'none';
      });
    };
  });

  /* --------------------------------------------------------------------------
     4. Modal Lightbox
     -------------------------------------------------------------------------- */
  const lightbox = $('#lightbox');   let lightboxTrigger = null;    $$('#gallery .card').forEach((card) => {
    card.onclick = () => {
      lightboxTrigger = card;
      const lbImg = $('#lb-img');
      const lbTitle = $('#lb-title');
      const lbDesc = $('#lb-desc');

      if (lbImg) {
        lbImg.src = card.dataset.full;
        lbImg.alt = card.dataset.title;
      }
      if (lbTitle) lbTitle.textContent = card.dataset.title;
      if (lbDesc) lbDesc.textContent = card.dataset.desc;

      if (lightbox) {
        lightbox.classList.replace('hidden', 'flex');
        requestAnimationFrame(() => {
          lightbox.classList.add('open');
          const closeBtn = $('#lb-close');
          if (closeBtn) closeBtn.focus();
        });
      }
    };
  });

  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.classList.remove('open');
    setTimeout(() => {
      lightbox.classList.replace('flex', 'hidden');
      if (lightboxTrigger) lightboxTrigger.focus();
    }, 300);
  };

  const lbCloseBtn = $('#lb-close');
  if (lbCloseBtn) lbCloseBtn.onclick = closeLightbox;

  if (lightbox) {
    lightbox.onclick = (e) => {
      if (e.target === lightbox) closeLightbox();
    };
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox && !lightbox.classList.contains('hidden')) {
      closeLightbox();
    }
  });

  /* --------------------------------------------------------------------------
     5. Slider Antes y Después (Edición de Color)
     -------------------------------------------------------------------------- */
  const baBox = $('#ba');
  const baAfter = $('#ba-after');
  const baLine = $('#ba-line');

  if (baBox && baAfter && baLine) {
    const baImg = baAfter.querySelector('img');
    let isDragging = false;
    let sliderPos = 50;

    const fitImageWidth = () => {
      if (baImg) baImg.style.width = `${baBox.getBoundingClientRect().width}px`;
    };

    const updateSlider = (percent) => {
      sliderPos = Math.max(0, Math.min(100, percent));
      baAfter.style.width = `${sliderPos}%`;
      baLine.style.left = `${sliderPos}%`;
      baBox.setAttribute('aria-valuenow', Math.round(sliderPos));
    };

    const handlePointerMove = (clientX) => {
      const rect = baBox.getBoundingClientRect();
      updateSlider(((clientX - rect.left) / rect.width) * 100);
    };

    baBox.addEventListener('pointerdown', (e) => {
      isDragging = true;
      baBox.setPointerCapture(e.pointerId);
      handlePointerMove(e.clientX);
    });

    baBox.addEventListener('pointermove', (e) => {
      if (isDragging) handlePointerMove(e.clientX);
    });

    ['pointerup', 'pointercancel'].forEach((evt) => {
      baBox.addEventListener(evt, () => { isDragging = false; });
    });

    baBox.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') updateSlider(sliderPos - 5);
      if (e.key === 'ArrowRight') updateSlider(sliderPos + 5);
    });

    window.addEventListener('resize', fitImageWidth);
    fitImageWidth();
    updateSlider(50);
  }

  /* --------------------------------------------------------------------------
     6. Calendario de Disponibilidad
     -------------------------------------------------------------------------- */
  const bookedDates = new Set([
    "2026-10-10", "2026-10-12", "2026-10-17", "2026-11-06", "2026-11-07",
    "2026-11-14", "2026-11-28", "2026-12-05", "2026-12-11", "2026-12-12",
    "2026-12-26", "2027-01-23", "2027-02-05", "2027-02-07", "2027-02-13",
    "2027-02-27", "2027-04-24"
  ]);

  const MESES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  let currentYear = Math.min(2027, Math.max(2026, today.getFullYear()));
  let currentMonth = currentYear === today.getFullYear() ? today.getMonth() : 0;
  let selectedDateKey = null;

  const renderCalendar = () => {
    const grid = $('#cal-grid');
    const monthTitle = $('#month-title');
    if (!grid || !monthTitle) return;

    monthTitle.textContent = `${MESES[currentMonth]} ${currentYear}`;
    setPressed('.yr', (btn) => +btn.dataset.y === currentYear);
    grid.innerHTML = '';

    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    for (let i = 0; i < firstDayIndex; i++) {
      const emptyCell = document.createElement('div');
      emptyCell.className = 'aspect-square rounded-2xl bg-white/[.02] border border-white/5 opacity-30';
      grid.appendChild(emptyCell);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${currentYear}-${pad(currentMonth + 1)}-${pad(day)}`;
      const dayOfWeek = new Date(currentYear, currentMonth, day).getDay();
      const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;
      const isPast = dateKey < todayKey;
      const isBooked = bookedDates.has(dateKey);

      const cell = document.createElement(isBooked || isPast ? 'div' : 'button');
      let classes = 'aspect-square rounded-2xl border p-1 sm:p-2 flex flex-col justify-center items-center text-center transition-all duration-300 ';
      let tagText = '';

      if (isBooked) {
        classes += 'bg-gold-500/10 border-gold-400/40 text-gold-300';
        tagText = 'Reservado';
        cell.setAttribute('aria-label', `${day} de ${MESES[currentMonth]}: reservado`);
      } else if (isPast) {
        classes += 'border-white/5 text-slate-600 opacity-50';
        cell.setAttribute('aria-label', `${day} de ${MESES[currentMonth]}: fecha pasada`);
      } else {
        cell.type = 'button';
        cell.setAttribute('aria-label', `${day} de ${MESES[currentMonth]}: disponible`);
        cell.onclick = () => pickDate(dateKey, day);

        classes += isWeekend
          ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500 hover:text-warm-950 hover:scale-105 shadow-sm'
          : 'bg-warm-950/50 border-white/10 text-slate-300 hover:border-gold-400/50 hover:text-gold-300 hover:scale-105';

        if (isWeekend) tagText = 'Disponible';
      }

      if (selectedDateKey === dateKey) {
        classes += ' ring-2 ring-gold-400 scale-105 shadow-lg shadow-gold-500/20';
      }

      cell.className = classes;
      cell.innerHTML = `
        <span class="font-bold text-xs sm:text-sm leading-none">${day}</span>
        ${tagText ? `<span class="text-[10px] mt-0.5 hidden sm:block truncate px-1 font-semibold">${tagText}</span>` : ''}
      `;
      grid.appendChild(cell);
    }
  };

  const swapMonthAnimation = (callback) => {
    const grid = $('#cal-grid');
    if (!grid) return;
    grid.classList.add('swap');
    setTimeout(() => {
      callback();
      grid.classList.remove('swap');
    }, 150);
  };

  const pickDate = (key, dayNumber) => {
    selectedDateKey = key;
    renderCalendar();

    const banner = $('#date-banner');
    const dateText = $('#date-text');
    const formDateField = $('#f-date');

    if (dateText) dateText.textContent = `${dayNumber} de ${MESES[currentMonth]} de ${currentYear}`;
    if (banner) {
      banner.classList.remove('hidden');
      banner.classList.add('flex');
    }
    if (formDateField) formDateField.value = key;
  };

  const prevBtn = $('#prev');
  const nextBtn = $('#next');    if (prevBtn) {     prevBtn.onclick = () => swapMonthAnimation(() => {       currentMonth--;       if (currentMonth < 0) {         if (currentYear === 2027) {           currentYear = 2026;           currentMonth = 11;         } else {           currentMonth = 0;         }       }       renderCalendar();     });   }    if (nextBtn) {     nextBtn.onclick = () => swapMonthAnimation(() => {       currentMonth++;       if (currentMonth > 11) {         if (currentYear === 2026) {           currentYear = 2027;           currentMonth = 0;         } else {           currentMonth = 11;         }       }       renderCalendar();     });   }    $$('.yr').forEach((btn) => {
    btn.onclick = () => swapMonthAnimation(() => {
      currentYear = +btn.dataset.y;
      currentMonth = currentYear === today.getFullYear() ? today.getMonth() : 0;
      renderCalendar();
    });
  });

  const confirmDateBtn = $('#date-confirm');
  if (confirmDateBtn) {
    confirmDateBtn.onclick = () => {
      scrollToSection('#contacto');
      showToast('Fecha cargada en el formulario.');
    };
  }

  /* --------------------------------------------------------------------------
     7. Cotizador de Presupuesto
     -------------------------------------------------------------------------- */
  const PRICES = {
    hour: 75000,
    cam: 350000,
    drone: 150000,
    book: 150000,
    express: 150000,
    live: 350000
  };

  const state = {
    ev: 'Quinceaños',
    fmt: 'ambos',
    h: 8,
    books: 0
  };

  const FORMAT_LABELS = {
    foto: 'Solo foto',
    video: 'Solo video',
    ambos: 'Foto + video'
  };

  const formatARS = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const calculateBudget = () => {
    const isBoth = state.fmt === 'ambos' ? 2 : 1;
    const isChecked = (id) => {
      const el = $(`#${id}`);
      return el ? el.checked : false;
    };

    let total = state.h * PRICES.hour * isBoth + state.books * PRICES.book * isBoth;

    if (state.fmt !== 'video' && isChecked('xphoto')) total += PRICES.cam;
    if (state.fmt !== 'foto' && isChecked('xvideo')) total += PRICES.cam;
    if (state.fmt !== 'video' && isChecked('express')) total += PRICES.express;
    if (state.fmt !== 'foto' && isChecked('live')) total += PRICES.live;
    if (state.fmt !== 'foto' && isChecked('drone')) total += PRICES.drone;

    const totalEl = $('#total');
    if (totalEl) {
      totalEl.style.transform = 'scale(1.04)';
      setTimeout(() => { totalEl.style.transform = 'scale(1)'; }, 150);
      totalEl.textContent = formatARS(total);
    }
    return total;
  };

  const applyCoverageFormat = () => {
    const format = state.fmt;
    const visibilityMap = {
      xphoto: format !== 'video',
      express: format !== 'video',
      xvideo: format !== 'foto',
      live: format !== 'foto',
      drone: format !== 'foto'
    };

    for (const key in visibilityMap) {
      const container = $(`#c-${key}`);
      const checkbox = $(`#${key}`);
      if (container) container.style.display = visibilityMap[key] ? 'flex' : 'none';
      if (!visibilityMap[key] && checkbox) checkbox.checked = false;
    }

    setPressed('.fmt', (btn) => btn.dataset.fmt === format);
    calculateBudget();
  };

  $$('.ev').forEach((btn) => {
    btn.onclick = () => {
      state.ev = btn.dataset.ev;
      setPressed('.ev', (x) => x === btn);
      const title = $('#calc-title');
      if (title) title.textContent = `Tu presupuesto: ${state.ev}`;
      calculateBudget();
    };
  });

  $$('.fmt').forEach((btn) => {     btn.onclick = () => {       state.fmt = btn.dataset.fmt;       applyCoverageFormat();     };   });    $$
('.hrs').forEach((btn) => {
    btn.onclick = () => {
      state.h = +btn.dataset.h;
      setPressed('.hrs', (x) => x === btn);
      calculateBudget();
    };
  });

  const booksMinus = $('#books-minus');
  const booksPlus = $('#books-plus');
  const booksOutput = $('#books');

  if (booksMinus && booksPlus && booksOutput) {
    booksMinus.onclick = () => {
      state.books = Math.max(0, state.books - 1);
      booksOutput.textContent = state.books;
      calculateBudget();
    };
    booksPlus.onclick = () => {
      state.books = Math.min(2, state.books + 1);
      booksOutput.textContent = state.books;
      calculateBudget();
    };
  }

  ['xphoto', 'xvideo', 'express', 'live', 'drone'].forEach((id) => {
    const el = $(`#${id}`);
    if (el) el.onchange = calculateBudget;
  });

  const quoteSendBtn = $('#quote-send');
  if (quoteSendBtn) {
    quoteSendBtn.onclick = () => {
      const totalAmount = calculateBudget();
      const extras = [];
      const isChecked = (id) => {
        const el = $(`#${id}`);
        return el ? el.checked : false;
      };

      if (state.fmt !== 'video' && isChecked('xphoto')) extras.push('2.º fotógrafo');
      if (state.fmt !== 'foto' && isChecked('xvideo')) extras.push('2.º videógrafo');
      if (state.books)