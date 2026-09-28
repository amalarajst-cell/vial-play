/**
 * ============================================================================
 * VIAL PLAY - TEST DE TIEMPO DE REACCION
 * Mobile-First Road Safety Reaction Assessment | GCBA
 * Implementacion basada en el sistema de Ruleta Vial
 * ============================================================================
 */

(function () {
  'use strict';

  // ==========================================================================
  // 1. STORAGE KEYS & INITIAL STATE
  // ==========================================================================
  const STORAGE_NAME = 'vialplay_player_name';
  const STORAGE_EMAIL = 'vialplay_player_email';
  const STORAGE_SESSIONS = 'vialplay_participants_db';
  const STORAGE_ADMIN_PWD = 'vialplay_admin_pwd';
  const DEFAULT_ADMIN_PWD = 'vial2026';

  let currentPlayer = {
    name: '',
    email: '',
    isLoggedIn: false
  };

  // ==========================================================================
  // 2. PROCEDURAL WEB AUDIO SYNTHESIS
  // ==========================================================================
  let audioEnabled = true;
  let audioCtx = null;

  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playSound(type) {
    if (!audioEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      if (type === 'tick') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(450, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.04);
        osc.start(now);
        osc.stop(now + 0.04);
      } else if (type === 'alert') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(650, now);
        osc.frequency.exponentialRampToValueAtTime(950, now + 0.1);
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.16);
        osc.start(now);
        osc.stop(now + 0.16);
      } else if (type === 'distraction_wa') {
        [880, 1174].forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.setValueAtTime(f, now + idx * 0.07);
          gain.gain.setValueAtTime(0.22, now + idx * 0.07);
          gain.gain.linearRampToValueAtTime(0.01, now + idx * 0.07 + 0.12);
          osc.start(now + idx * 0.07);
          osc.stop(now + idx * 0.07 + 0.12);
        });
      } else if (type === 'correct') {
        [587.33, 880].forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.setValueAtTime(f, now + idx * 0.06);
          gain.gain.setValueAtTime(0.18, now + idx * 0.06);
          gain.gain.linearRampToValueAtTime(0.01, now + idx * 0.06 + 0.12);
          osc.start(now + idx * 0.06);
          osc.stop(now + idx * 0.06 + 0.12);
        });
      } else if (type === 'wrong') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.setValueAtTime(140, now + 0.12);
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'finish') {
        [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.setValueAtTime(f, now + i * 0.08);
          gain.gain.setValueAtTime(0.18, now + i * 0.08);
          gain.gain.linearRampToValueAtTime(0.01, now + i * 0.08 + 0.15);
          osc.start(now + i * 0.08);
          osc.stop(now + i * 0.08 + 0.15);
        });
      }
    } catch (e) {
      console.warn('Audio playback error', e);
    }
  }

  // ==========================================================================
  // 3. STIMULI REPOSITORY (EXACT RULETA VIAL REACTION TEST)
  // ==========================================================================

  // NIVEL 1: REFLEJOS CROMATICOS (4 COLORES)
  const STIMULI_LVL1_COLORS = [
    {
      id: 'rojo',
      action: 'rojo',
      actionLabel: 'ROJO',
      colorName: 'ROJO',
      hex: '#ff1744',
      categoryClass: 'cat-color-rojo',
      categoryName: 'Se\u00F1al Crom\u00E1tica',
      title: 'COLOR ROJO',
      desc: '\u00A1Presion\u00E1 r\u00E1pidamente el bot\u00F3n ROJO!',
      visualHtml: '<div class="color-orb" style="background:#ff1744;box-shadow:0 0 35px #ff1744;"></div>'
    },
    {
      id: 'amarillo',
      action: 'amarillo',
      actionLabel: 'AMARILLO',
      colorName: 'AMARILLO',
      hex: '#ffc107',
      categoryClass: 'cat-color-amarillo',
      categoryName: 'Se\u00F1al Crom\u00E1tica',
      title: 'COLOR AMARILLO',
      desc: '\u00A1Presion\u00E1 r\u00E1pidamente el bot\u00F3n AMARILLO!',
      visualHtml: '<div class="color-orb" style="background:#ffc107;box-shadow:0 0 35px #ffc107;"></div>'
    },
    {
      id: 'verde',
      action: 'verde',
      actionLabel: 'VERDE',
      colorName: 'VERDE',
      hex: '#00e676',
      categoryClass: 'cat-color-verde',
      categoryName: 'Se\u00F1al Crom\u00E1tica',
      title: 'COLOR VERDE',
      desc: '\u00A1Presion\u00E1 r\u00E1pidamente el bot\u00F3n VERDE!',
      visualHtml: '<div class="color-orb" style="background:#00e676;box-shadow:0 0 35px #00e676;"></div>'
    },
    {
      id: 'azul',
      action: 'azul',
      actionLabel: 'AZUL',
      colorName: 'AZUL',
      hex: '#2979ff',
      categoryClass: 'cat-color-azul',
      categoryName: 'Se\u00F1al Crom\u00E1tica',
      title: 'COLOR AZUL',
      desc: '\u00A1Presion\u00E1 r\u00E1pidamente el bot\u00F3n AZUL!',
      visualHtml: '<div class="color-orb" style="background:#2979ff;box-shadow:0 0 35px #2979ff;"></div>'
    }
  ];

  // NIVEL 2: 4 DECISIONES VIALES (Frenar, Soltar Acelerador, Esquivar, Omitir)
  const STIMULI_LVL2_VIAL = [
    // 1. FRENAR
    {
      id: 'pare',
      action: 'frenar',
      actionLabel: 'FRENAR',
      categoryClass: 'cat-frenar',
      categoryName: 'Reglamentaria de Detenci\u00F3n',
      title: 'SE\u00D1AL DE PARE',
      desc: 'Detenci\u00F3n total obligatoria antes de ingresar a la intersecci\u00F3n.',
      visualHtml: '<div class="sign-pare"><span>PARE</span></div>'
    },
    {
      id: 'semaforo_rojo',
      action: 'frenar',
      actionLabel: 'FRENAR',
      categoryClass: 'cat-frenar',
      categoryName: 'Sem\u00E1foro Vial',
      title: 'LUZ ROJA',
      desc: 'Detenci\u00F3n inmediata en la l\u00EDnea de frenado reglamentaria.',
      visualHtml: '<div style="width:58px;height:74px;background:#202628;border-radius:14px;border:2.5px solid #333;display:flex;flex-direction:column;align-items:center;justify-content:space-around;padding:4px 0;"><div style="width:18px;height:18px;border-radius:50%;background:#ff1744;box-shadow:0 0 14px #ff1744;"></div><div style="width:16px;height:16px;border-radius:50%;background:#332900;"></div><div style="width:16px;height:16px;border-radius:50%;background:#0a2915;"></div></div>'
    },
    {
      id: 'peaton_cruzando',
      action: 'frenar',
      actionLabel: 'FRENAR',
      categoryClass: 'cat-frenar',
      categoryName: 'Prioridad Peatonal',
      title: 'PEAT\u00D3N EN SENDA',
      desc: 'Persona cruzando en la senda peatonal. Prioridad de paso absoluta.',
      visualHtml: '<div class="sign-pare" style="background:#b71c1c;"><span class="material-symbols-outlined" style="font-size:32px;">directions_walk</span></div>'
    },

    // 2. SOLTAR EL ACELERADOR
    {
      id: 'lomo_burro',
      action: 'acelerador',
      actionLabel: 'SOLTAR ACELERADOR',
      categoryClass: 'cat-acelerador',
      categoryName: 'Reductor F\u00EDsico',
      title: 'LOMO DE BURRO PR\u00D3XIMO',
      desc: 'Disminuir la velocidad levantando el pie del acelerador antes del resalto.',
      visualHtml: '<div class="sign-preventiva"><span class="material-symbols-outlined" style="font-size:32px;">waves</span></div>'
    },
    {
      id: 'zona_escolar',
      action: 'acelerador',
      actionLabel: 'SOLTAR ACELERADOR',
      categoryClass: 'cat-acelerador',
      categoryName: 'Entorno Escolar',
      title: 'ZONA ESCOLAR (20 KM/H)',
      desc: 'Alumnado en veredas. Desacelerar con anticipaci\u00F3n a velocidad precautoria.',
      visualHtml: '<div class="sign-preventiva"><span class="material-symbols-outlined" style="font-size:32px;">school</span></div>'
    },
    {
      id: 'curva_peligrosa',
      action: 'acelerador',
      actionLabel: 'SOLTAR ACELERADOR',
      categoryClass: 'cat-acelerador',
      categoryName: 'Trazado Vial',
      title: 'CURVA PRONUNCIADA',
      desc: 'Soltar el acelerador antes de entrar en el radio de giro para no perder adherencia.',
      visualHtml: '<div class="sign-preventiva"><span class="material-symbols-outlined" style="font-size:32px;">turn_right</span></div>'
    },
    {
      id: 'calzada_resbaladiza',
      action: 'acelerador',
      actionLabel: 'SOLTAR ACELERADOR',
      categoryClass: 'cat-acelerador',
      categoryName: 'Clima Adverso',
      title: 'ASFALTO RESBALADIZO / LLUVIA',
      desc: 'Menor adherencia. Moderar la marcha progresivamente sin frenadas bruscas.',
      visualHtml: '<div class="sign-preventiva"><span class="material-symbols-outlined" style="font-size:32px;">water_drop</span></div>'
    },

    // 3. ESQUIVAR
    {
      id: 'conos_obra',
      action: 'esquivar',
      actionLabel: 'ESQUIVAR',
      categoryClass: 'cat-esquivar',
      categoryName: 'Obstrucci\u00F3n de Carril',
      title: 'CONOS DE OBRA ADELANTE',
      desc: 'Carril clausurado. Maniobrar y abrirse al carril contiguo con baliza/giro.',
      visualHtml: '<div class="sign-maniobra"><span class="material-symbols-outlined" style="font-size:32px;">traffic</span></div>'
    },
    {
      id: 'pozo_calzada',
      action: 'esquivar',
      actionLabel: 'ESQUIVAR',
      categoryClass: 'cat-esquivar',
      categoryName: 'Falla Estructural',
      title: 'BACHE PROFUNDO',
      desc: 'Desnivel peligroso en asfalto. Esquivar de forma segura sin volantazos.',
      visualHtml: '<div class="sign-maniobra"><span class="material-symbols-outlined" style="font-size:32px;">report_problem</span></div>'
    },
    {
      id: 'ciclista_carril',
      action: 'esquivar',
      actionLabel: 'ESQUIVAR',
      categoryClass: 'cat-esquivar',
      categoryName: 'Convivencia Vial',
      title: 'CICLISTA EN CALZADA',
      desc: 'Guardar distancia de seguridad reglamentaria de al menos 1,5 metros.',
      visualHtml: '<div class="sign-maniobra"><span class="material-symbols-outlined" style="font-size:32px;">directions_bike</span></div>'
    },

    // 4. OMITIR / SEGUIR
    {
      id: 'estacionamiento_permitido',
      action: 'omitir',
      actionLabel: 'OMITIR / SEGUIR',
      categoryClass: 'cat-omitir',
      categoryName: 'Se\u00F1al Informativa',
      title: 'ESTACIONAMIENTO PERMITIDO',
      desc: '\u00C1rea habilitada para estacionar. La calzada principal contin\u00FAa libre.',
      visualHtml: '<div class="sign-informativa"><span class="material-symbols-outlined" style="font-size:32px;">local_parking</span></div>'
    },
    {
      id: 'fin_obras',
      action: 'omitir',
      actionLabel: 'OMITIR / SEGUIR',
      categoryClass: 'cat-omitir',
      categoryName: 'Se\u00F1al Fin de Restricci\u00F3n',
      title: 'FIN DE ZONA DE OBRAS',
      desc: 'Restricciones levantadas. Omitir maniobra y continuar a velocidad legal.',
      visualHtml: '<div class="sign-informativa"><span class="material-symbols-outlined" style="font-size:32px;">check_circle</span></div>'
    }
  ];

  // NIVEL 3: DISTRACCION COGNITIVA AL VOLANTE
  const STIMULI_LVL3_DISTRACTION = [
    {
      id: 'pelota_nino',
      action: 'frenar',
      actionLabel: 'FRENAR URGENTE',
      hasDistraction: true,
      waSender: 'Instagram \u2022 Notificaci\u00F3n',
      waMessage: '\uD83D\uDCF1 @amigo te etiquet\u00F3 en un video nuevo',
      categoryClass: 'cat-frenar',
      categoryName: 'Peligro Cr\u00EDtico con Celular',
      title: '\u00A1PELOTA Y NI\u00D1O CRUZANDO!',
      desc: '\u00A1Una pelota cruz\u00F3 rodando y viene un ni\u00F1o detr\u00E1s! \u00A1Freno a fondo!',
      visualHtml: '<div class="sign-pare" style="background:#b71c1c;"><span class="material-symbols-outlined" style="font-size:32px;">sports_soccer</span></div>'
    },
    {
      id: 'frenada_colectivo',
      action: 'frenar',
      actionLabel: 'FRENAR URGENTE',
      hasDistraction: true,
      waSender: 'WhatsApp \u2022 Amigo',
      waMessage: '\u00BFD\u00F3nde est\u00E1s? \u00A1Ya arranc\u00F3 la previa!',
      categoryClass: 'cat-frenar',
      categoryName: 'Frenada Brusca Adelante',
      title: 'COLECTIVO CLAVA LOS FRENOS',
      desc: 'El transporte p\u00FAblico que va adelante frena de golpe sin aviso previo.',
      visualHtml: '<div class="sign-pare" style="background:#b71c1c;"><span class="material-symbols-outlined" style="font-size:32px;">directions_bus</span></div>'
    },
    {
      id: 'moto_encerrona',
      action: 'acelerador',
      actionLabel: 'SOLTAR ACELERADOR',
      hasDistraction: false,
      categoryClass: 'cat-acelerador',
      categoryName: 'Tr\u00E1nsito Denso (Atento)',
      title: 'MOTO CAMBIANDO DE CARRIL',
      desc: 'Repartidor en moto se incorpora a tu carril con espacio justo.',
      visualHtml: '<div class="sign-preventiva"><span class="material-symbols-outlined" style="font-size:32px;">two_wheeler</span></div>'
    },
    {
      id: 'animal_suelto',
      action: 'frenar',
      actionLabel: 'FRENAR URGENTE',
      hasDistraction: true,
      waSender: 'TikTok \u2022 Tendencia',
      waMessage: '\uD83D\uDD34 Transmisi\u00F3n en vivo recomendada...',
      categoryClass: 'cat-frenar',
      categoryName: 'Obst\u00E1culo Imprevisto',
      title: 'PERRO SUELTO EN CALZADA',
      desc: 'Mascota asustada cruzando la avenida en plena noche.',
      visualHtml: '<div class="sign-pare" style="background:#b71c1c;"><span class="material-symbols-outlined" style="font-size:32px;">pets</span></div>'
    },
    {
      id: 'desvio_inesperado',
      action: 'esquivar',
      actionLabel: 'ESQUIVAR',
      hasDistraction: false,
      categoryClass: 'cat-esquivar',
      categoryName: 'Imprevisto en V\u00EDa',
      title: 'RAMA DE \u00C1RBOL CA\u00CDDA',
      desc: 'Temporal derrib\u00F3 una rama grande ocupando medio carril.',
      visualHtml: '<div class="sign-maniobra"><span class="material-symbols-outlined" style="font-size:32px;">park</span></div>'
    },
    {
      id: 'llamada_madre',
      action: 'frenar',
      actionLabel: 'FRENAR URGENTE',
      hasDistraction: true,
      waSender: 'Llamada Entrante \u2022 Mam\u00E1',
      waMessage: '\uD83D\uDCDE Sonando en altavoz...',
      categoryClass: 'cat-frenar',
      categoryName: 'Llamada al Volante',
      title: 'CAMI\u00D3N DE BASURA DETENIDO',
      desc: 'Veh\u00EDculo recolector detenido a oscuras doblando la esquina.',
      visualHtml: '<div class="sign-pare" style="background:#b71c1c;"><span class="material-symbols-outlined" style="font-size:32px;">local_shipping</span></div>'
    }
  ];

  // ==========================================================================
  // 4. GAME ENGINE STATE
  // ==========================================================================
  let currentLevel = 1;
  let totalRoundsForLevel = 5;
  let currentRoundIdx = 0;
  let activeStimuliQueue = [];
  let currentStimulus = null;
  let state = 'idle';
  let stimulusStartTime = 0;
  let liveTimerRaf = null;
  let waitTimer = null;
  let feedbackAdvanceTimer = null;
  let timeoutWatchdog = null;
  let timeoutSec = 2.40;

  const gameHistory = [];

  // DOM Elements
  const screenLogin = document.getElementById('screen-login');
  const screenTest = document.getElementById('screen-test');
  const formLogin = document.getElementById('form-login');
  const inputPlayerName = document.getElementById('input-player-name');
  const inputPlayerEmail = document.getElementById('input-player-email');

  const headerPlayerChip = document.getElementById('header-player-chip');
  const headerPlayerName = document.getElementById('header-player-name');
  const btnBackLogin = document.getElementById('btn-back-login');

  const btnToggleSound = document.getElementById('btn-toggle-sound');
  const soundIconSymbol = document.getElementById('sound-icon-symbol');

  const tabLvl1 = document.getElementById('tab-lvl-1');
  const tabLvl2 = document.getElementById('tab-lvl-2');
  const tabLvl3 = document.getElementById('tab-lvl-3');
  const roundBadge = document.getElementById('round-badge');
  const roundStateText = document.getElementById('round-state-text');
  const dotsWrap = document.getElementById('dots-wrap');

  const stimulusCard = document.getElementById('stimulus-card');
  const stimulusCatBadge = document.getElementById('stimulus-cat-badge');
  const catBadgeText = document.getElementById('cat-badge-text');
  const stimulusVisual = document.getElementById('stimulus-visual');
  const stimulusTitle = document.getElementById('stimulus-title');
  const stimulusDesc = document.getElementById('stimulus-desc');
  const liveTimerBadge = document.getElementById('live-timer-badge');
  const feedbackBanner = document.getElementById('feedback-banner');
  const feedbackIcon = document.getElementById('feedback-icon');
  const feedbackText = document.getElementById('feedback-text');
  const cardTimerFill = document.getElementById('card-timer-fill');
  const btnStartGameCta = document.getElementById('btn-start-game-cta');
  const distractionPopup = document.getElementById('distraction-popup');
  const waSender = document.getElementById('wa-sender');
  const waText = document.getElementById('wa-text');

  const actionsGrid = document.getElementById('actions-grid');

  const resultsCard = document.getElementById('results-card');
  const resAvgTime = document.getElementById('res-avg-time');
  const resBestTime = document.getElementById('res-best-time');
  const resAccuracy = document.getElementById('res-accuracy');
  const resBlindDist = document.getElementById('res-blind-dist');
  const resAdviceText = document.getElementById('res-advice-text');
  const resTitleMode = document.getElementById('res-title-mode');
  const btnReplay = document.getElementById('btn-replay');
  const btnNextLevel = document.getElementById('btn-next-level');

  const distanceMatrixCard = document.getElementById('distance-matrix-card');
  const distVal40 = document.getElementById('dist-val-40');
  const distVal60 = document.getElementById('dist-val-60');
  const distVal100 = document.getElementById('dist-val-100');
  const distanceTimeTag = document.getElementById('distance-time-tag');

  // Admin Modal DOM
  const adminModal = document.getElementById('admin-modal');
  const btnCloseAdmin = document.getElementById('btn-close-admin');
  const adminAuthView = document.getElementById('admin-auth-view');
  const adminContentView = document.getElementById('admin-content-view');
  const inputAdminPass = document.getElementById('input-admin-pass');
  const btnSubmitAdminAuth = document.getElementById('btn-submit-admin-auth');
  const adminAuthError = document.getElementById('admin-auth-error');
  const adminStatTotal = document.getElementById('admin-stat-total');
  const adminStatBest = document.getElementById('admin-stat-best');
  const adminStatAvg = document.getElementById('admin-stat-avg');
  const adminStatAcc = document.getElementById('admin-stat-acc');
  const adminSearchInput = document.getElementById('admin-search-input');
  const adminRecordsCount = document.getElementById('admin-records-count');
  const adminLevelFilters = document.getElementById('admin-level-filters');
  const adminTableBody = document.getElementById('admin-table-body');
  const btnAdminExport = document.getElementById('btn-admin-export');
  const btnAdminClear = document.getElementById('btn-admin-clear');

  // ==========================================================================
  // 5. SESSION & SCREEN ROUTING (STRICT LOGIN REQUIREMENT)
  // ==========================================================================
  function loadStoredPlayer() {
    const name = localStorage.getItem(STORAGE_NAME);
    const email = localStorage.getItem(STORAGE_EMAIL) || '';

    if (name && name.trim()) {
      currentPlayer = {
        name: name.trim(),
        email: email.trim(),
        isLoggedIn: true
      };
      if (inputPlayerName) inputPlayerName.value = currentPlayer.name;
      if (inputPlayerEmail) inputPlayerEmail.value = currentPlayer.email;
    }
  }

  function updatePlayerUI() {
    if (currentPlayer.isLoggedIn) {
      if (headerPlayerChip) headerPlayerChip.style.display = 'inline-flex';
      if (headerPlayerName) headerPlayerName.textContent = currentPlayer.name;
    } else {
      if (headerPlayerChip) headerPlayerChip.style.display = 'none';
    }
  }

  function showSection(sectionName) {
    if (sectionName === 'test') {
      if (!currentPlayer.isLoggedIn) {
        showSection('login');
        return;
      }
      screenLogin.classList.remove('active');
      screenTest.classList.add('active');
      renderActionButtonsForLevel(currentLevel);
      initGameForCurrentLevel();
    } else {
      screenTest.classList.remove('active');
      screenLogin.classList.add('active');
    }
    updatePlayerUI();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  formLogin.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = inputPlayerName.value.trim();
    if (!name) {
      inputPlayerName.focus();
      return;
    }

    const email = inputPlayerEmail.value.trim();

    currentPlayer = {
      name: name,
      email: email,
      isLoggedIn: true
    };

    localStorage.setItem(STORAGE_NAME, currentPlayer.name);
    localStorage.setItem(STORAGE_EMAIL, currentPlayer.email);

    getAudioContext();
    playSound('correct');
    showSection('test');
  });

  function handleLogout() {
    currentPlayer.isLoggedIn = false;
    localStorage.removeItem(STORAGE_NAME);
    showSection('login');
  }

  if (btnBackLogin) btnBackLogin.addEventListener('click', handleLogout);
  if (headerPlayerChip) headerPlayerChip.addEventListener('click', handleLogout);

  btnToggleSound.addEventListener('click', () => {
    audioEnabled = !audioEnabled;
    if (audioEnabled) {
      btnToggleSound.classList.add('active-sound');
      soundIconSymbol.textContent = 'volume_up';
      getAudioContext();
      playSound('tick');
    } else {
      btnToggleSound.classList.remove('active-sound');
      soundIconSymbol.textContent = 'volume_off';
    }
  });

  // ==========================================================================
  // 6. DISTANCE MATRIX CALCULATOR
  // ==========================================================================
  function updateDistanceMatrix(timeSec, labelPrefix) {
    const t = Math.max(0.1, Number(timeSec) || 0.75);
    const d40 = +(11.11 * t).toFixed(1);
    const d60 = +(16.67 * t).toFixed(1);
    const d100 = +(27.78 * t).toFixed(1);

    if (distVal40) distVal40.textContent = d40.toFixed(1) + ' m';
    if (distVal60) distVal60.textContent = d60.toFixed(1) + ' m';
    if (distVal100) distVal100.textContent = d100.toFixed(1) + ' m';
    if (distanceTimeTag && labelPrefix) {
      distanceTimeTag.textContent = `${labelPrefix}: ${t.toFixed(2)} s`;
    }
  }

  // ==========================================================================
  // 7. LEVEL ACTIONS & BUTTON GRID (DYNAMIC PER LEVEL)
  // ==========================================================================
  function renderActionButtonsForLevel(lvl) {
    actionsGrid.innerHTML = '';

    if (lvl === 1) {
      actionsGrid.innerHTML = `
        <button type="button" class="btn-action btn-color-rojo disabled" data-action="rojo" id="btn-act-1">
          <span class="btn-key-hint">R</span>
          <div class="btn-action-icon-circle"><span class="material-symbols-outlined">circle</span></div>
          <span class="btn-action-title">Rojo</span>
          <span class="btn-action-sub">Detenci\u00F3n</span>
        </button>
        <button type="button" class="btn-action btn-color-amarillo disabled" data-action="amarillo" id="btn-act-2">
          <span class="btn-key-hint">A</span>
          <div class="btn-action-icon-circle"><span class="material-symbols-outlined">circle</span></div>
          <span class="btn-action-title">Amarillo</span>
          <span class="btn-action-sub">Precauci\u00F3n</span>
        </button>
        <button type="button" class="btn-action btn-color-verde disabled" data-action="verde" id="btn-act-3">
          <span class="btn-key-hint">V</span>
          <div class="btn-action-icon-circle"><span class="material-symbols-outlined">circle</span></div>
          <span class="btn-action-title">Verde</span>
          <span class="btn-action-sub">Avanzar</span>
        </button>
        <button type="button" class="btn-action btn-color-azul disabled" data-action="azul" id="btn-act-4">
          <span class="btn-key-hint">Z</span>
          <div class="btn-action-icon-circle"><span class="material-symbols-outlined">circle</span></div>
          <span class="btn-action-title">Azul</span>
          <span class="btn-action-sub">Informaci\u00F3n</span>
        </button>
      `;
    } else {
      actionsGrid.innerHTML = `
        <button type="button" class="btn-action btn-vial-frenar disabled" data-action="frenar" id="btn-act-1">
          <span class="btn-key-hint">F</span>
          <div class="btn-action-icon-circle"><span class="material-symbols-outlined">front_hand</span></div>
          <span class="btn-action-title">Frenar</span>
          <span class="btn-action-sub">PARE \u2022 Rojo \u2022 Peat\u00F3n</span>
        </button>
        <button type="button" class="btn-action btn-vial-acelerador disabled" data-action="acelerador" id="btn-act-2">
          <span class="btn-key-hint">S</span>
          <div class="btn-action-icon-circle"><span class="material-symbols-outlined">speed</span></div>
          <span class="btn-action-title">Soltar Pedal</span>
          <span class="btn-action-sub">Lomo \u2022 Escuela \u2022 Curva</span>
        </button>
        <button type="button" class="btn-action btn-vial-esquivar disabled" data-action="esquivar" id="btn-act-3">
          <span class="btn-key-hint">E</span>
          <div class="btn-action-icon-circle"><span class="material-symbols-outlined">alt_route</span></div>
          <span class="btn-action-title">Esquivar</span>
          <span class="btn-action-sub">Conos \u2022 Bache \u2022 Ciclista</span>
        </button>
        <button type="button" class="btn-action btn-vial-omitir disabled" data-action="omitir" id="btn-act-4">
          <span class="btn-key-hint">O</span>
          <div class="btn-action-icon-circle"><span class="material-symbols-outlined">check_circle</span></div>
          <span class="btn-action-title">Omitir</span>
          <span class="btn-action-sub">Informativa \u2022 Seguir</span>
        </button>
      `;
    }

    actionsGrid.querySelectorAll('.btn-action').forEach(b => {
      b.addEventListener('click', () => {
        const act = b.getAttribute('data-action');
        handlePlayerAction(act);
      });
    });
  }

  function shuffleActionButtons() {
    const btns = Array.from(actionsGrid.querySelectorAll('.btn-action'));
    for (let i = btns.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      actionsGrid.appendChild(btns[j]);
      [btns[i], btns[j]] = [btns[j], btns[i]];
    }

    actionsGrid.querySelectorAll('.btn-action').forEach((btn, idx) => {
      btn.style.animationDelay = (idx * 40) + 'ms';
      btn.classList.remove('shuffled');
      void btn.offsetWidth;
      btn.classList.add('shuffled');
      setTimeout(() => { btn.classList.remove('shuffled'); btn.style.animationDelay = ''; }, 500);
    });

    let hint = actionsGrid.querySelector('.shuffle-hint');
    if (!hint) {
      hint = document.createElement('div');
      hint.className = 'shuffle-hint';
      hint.textContent = '\u26A0\uFE0F BOTONES MEZCLADOS';
      actionsGrid.appendChild(hint);
    }
    actionsGrid.classList.add('show-hint');
    setTimeout(() => actionsGrid.classList.remove('show-hint'), 900);
  }

  function setButtonsEnabled(enabled) {
    const btns = actionsGrid.querySelectorAll('.btn-action');
    btns.forEach(btn => {
      if (enabled) {
        btn.classList.remove('disabled');
      } else {
        btn.classList.add('disabled');
      }
    });
  }

  function setLevel(lvl) {
    currentLevel = lvl;
    [tabLvl1, tabLvl2, tabLvl3].forEach((tab, i) => {
      if (i + 1 === lvl) tab.classList.add('active');
      else tab.classList.remove('active');
    });

    clearTimeout(waitTimer);
    clearTimeout(feedbackAdvanceTimer);
    clearTimeout(timeoutWatchdog);
    cancelAnimationFrame(liveTimerRaf);

    renderActionButtonsForLevel(lvl);
    initGameForCurrentLevel();
  }

  tabLvl1.addEventListener('click', () => setLevel(1));
  tabLvl2.addEventListener('click', () => setLevel(2));
  tabLvl3.addEventListener('click', () => setLevel(3));

  // ==========================================================================
  // 8. GAME LOOP & STATE TRANSITIONS
  // ==========================================================================
  function initGameForCurrentLevel() {
    currentRoundIdx = 0;
    gameHistory.length = 0;
    resultsCard.style.display = 'none';
    actionsGrid.style.display = 'grid';
    stimulusCard.style.display = 'flex';
    distractionPopup.style.display = 'none';
    if (distanceMatrixCard) distanceMatrixCard.style.display = 'flex';
    updateDistanceMatrix(0.75, 'Ref.');

    if (currentLevel === 1) {
      totalRoundsForLevel = 5;
      timeoutSec = 2.40;
      activeStimuliQueue = [
        ...STIMULI_LVL1_COLORS,
        STIMULI_LVL1_COLORS[Math.floor(Math.random() * STIMULI_LVL1_COLORS.length)]
      ].sort(() => 0.5 - Math.random());
    } else if (currentLevel === 2) {
      totalRoundsForLevel = 6;
      timeoutSec = 2.80;
      const frenar = STIMULI_LVL2_VIAL.filter(s => s.action === 'frenar').sort(() => 0.5 - Math.random()).slice(0, 2);
      const acelerar = STIMULI_LVL2_VIAL.filter(s => s.action === 'acelerador').sort(() => 0.5 - Math.random()).slice(0, 2);
      const esquivar = STIMULI_LVL2_VIAL.filter(s => s.action === 'esquivar').sort(() => 0.5 - Math.random()).slice(0, 1);
      const omitir = STIMULI_LVL2_VIAL.filter(s => s.action === 'omitir').sort(() => 0.5 - Math.random()).slice(0, 1);
      activeStimuliQueue = [...frenar, ...acelerar, ...esquivar, ...omitir].sort(() => 0.5 - Math.random());
    } else if (currentLevel === 3) {
      totalRoundsForLevel = 6;
      timeoutSec = 2.40;
      activeStimuliQueue = [...STIMULI_LVL3_DISTRACTION].sort(() => 0.5 - Math.random());
    }

    renderDots();
    setIdleState();
  }

  function renderDots() {
    dotsWrap.innerHTML = '';
    for (let i = 0; i < totalRoundsForLevel; i++) {
      const dot = document.createElement('div');
      dot.id = 'dot-' + i;
      dot.className = 'round-dot';
      dotsWrap.appendChild(dot);
    }
    updateDots();
  }

  function updateDots() {
    for (let i = 0; i < totalRoundsForLevel; i++) {
      const dot = document.getElementById('dot-' + i);
      if (!dot) continue;
      dot.className = 'round-dot';
      if (i < gameHistory.length) {
        dot.classList.add(gameHistory[i].correct ? 'done-correct' : 'done-wrong');
      } else if (i === currentRoundIdx && state !== 'idle') {
        dot.classList.add('active');
      }
    }
    roundBadge.innerHTML = 'EST\u00CDMULO ' + Math.min(currentRoundIdx + 1, totalRoundsForLevel) + ' / ' + totalRoundsForLevel;
  }

  function setIdleState() {
    state = 'idle';
    stimulusCard.className = 'stimulus-card state-idle';
    distractionPopup.style.display = 'none';

    if (currentLevel === 1) {
      catBadgeText.textContent = 'NIVEL 1 \u2022 REFLEJOS CROM\u00C1TICOS';
      stimulusVisual.innerHTML = '<div class="color-orb" style="background:#ff1744;box-shadow:0 0 25px #ff1744;"></div>';
      stimulusTitle.textContent = 'REACCI\u00D3N A COLORES';
      stimulusDesc.innerHTML = 'Aparecer\u00E1 un color sorpresa. Presion\u00E1 el bot\u00F3n correspondiente <strong>lo m\u00E1s r\u00E1pido posible</strong>.';
    } else if (currentLevel === 2) {
      catBadgeText.textContent = 'NIVEL 2 \u2022 TOMA DE DECISIONES VIALES';
      stimulusVisual.innerHTML = '<div class="sign-pare"><span>PARE</span></div>';
      stimulusTitle.textContent = '4 DECISIONES EN CALLE';
      stimulusDesc.innerHTML = 'FRENAR, SOLTAR ACELERADOR, ESQUIVAR U OMITIR seg\u00FAn la situaci\u00F3n vial imprevista.';
    } else if (currentLevel === 3) {
      catBadgeText.textContent = 'NIVEL 3 \u2022 DISTRACCI\u00D3N AL VOLANTE';
      stimulusVisual.innerHTML = '<div class="sign-pare" style="background:#b71c1c;"><span class="material-symbols-outlined" style="font-size:36px;">smartphone</span></div>';
      stimulusTitle.textContent = 'PELIGRO + DISTRACTOR';
      stimulusDesc.innerHTML = 'Simulamos notificaciones y celular mientras conduc\u00EDs. <strong>\u00A1Manten\u00E9 los ojos en la calzada!</strong>';
    }

    if (btnStartGameCta) btnStartGameCta.style.display = 'inline-flex';
    liveTimerBadge.style.display = 'none';
    feedbackBanner.style.display = 'none';
    cardTimerFill.style.transform = 'scaleX(0)';
    roundStateText.textContent = 'Toc\u00E1 para arrancar';
    setButtonsEnabled(false);
  }

  btnStartGameCta.addEventListener('click', () => {
    if (state === 'idle') {
      startRoundWaiting();
    }
  });

  stimulusCard.addEventListener('click', (e) => {
    if (state === 'idle' && !e.target.closest('#btn-start-game-cta')) {
      startRoundWaiting();
    }
  });

  function startRoundWaiting() {
    state = 'waiting';
    updateDots();
    roundStateText.textContent = '\u00A1Atento al est\u00EDmulo!...';
    distractionPopup.style.display = 'none';

    stimulusCard.className = 'stimulus-card state-waiting';
    catBadgeText.textContent = currentLevel === 1 ? 'ESPERANDO COLOR' : 'OBSERVANDO CALZADA';
    stimulusVisual.innerHTML = '<div style="width:68px;height:68px;border-radius:50%;background:rgba(255,160,0,0.15);display:flex;align-items:center;justify-content:center;color:var(--accent-amber);"><span class="material-symbols-outlined" style="font-size:36px;">explore</span></div>';
    stimulusTitle.textContent = 'PREPARATE...';
    stimulusDesc.textContent = 'No toques ning\u00FAn bot\u00F3n antes de ver el est\u00EDmulo. \u00A1No te adelantes!';
    if (btnStartGameCta) btnStartGameCta.style.display = 'none';
    liveTimerBadge.style.display = 'none';
    feedbackBanner.style.display = 'none';
    cardTimerFill.style.transform = 'scaleX(0)';

    setButtonsEnabled(true);
    playSound('tick');

    const waitMs = 1300 + Math.random() * 1800;
    clearTimeout(waitTimer);
    waitTimer = setTimeout(() => {
      if (state === 'waiting') {
        triggerStimulus();
      }
    }, waitMs);
  }

  function triggerStimulus() {
    state = 'active';
    currentStimulus = activeStimuliQueue[currentRoundIdx];
    stimulusStartTime = performance.now();

    if (currentLevel === 3) {
      shuffleActionButtons();
    }

    stimulusCard.className = 'stimulus-card state-active';
    stimulusCatBadge.className = 'stimulus-category-badge ' + (currentStimulus.categoryClass || '');
    catBadgeText.textContent = currentStimulus.categoryName || 'EST\u00CDMULO ACTIVO';
    stimulusVisual.innerHTML = currentStimulus.visualHtml;
    stimulusTitle.textContent = currentStimulus.title;
    stimulusDesc.textContent = currentStimulus.desc;

    if (currentLevel === 3 && currentStimulus.hasDistraction) {
      waSender.textContent = currentStimulus.waSender;
      waText.textContent = '"' + currentStimulus.waMessage + '"';
      distractionPopup.style.display = 'flex';
      playSound('distraction_wa');
    } else {
      distractionPopup.style.display = 'none';
      playSound('alert');
    }

    liveTimerBadge.style.display = 'inline-block';
    liveTimerBadge.textContent = '0.00 s';
    feedbackBanner.style.display = 'none';

    roundStateText.textContent = '\u00A1REACCION\u00C1 AHORA!';
    runLiveTimer();

    clearTimeout(timeoutWatchdog);
    timeoutWatchdog = setTimeout(() => {
      if (state === 'active') {
        handlePlayerAction('timeout');
      }
    }, timeoutSec * 1000);
  }

  function runLiveTimer() {
    if (state !== 'active') return;

    const elapsed = (performance.now() - stimulusStartTime) / 1000;
    const progress = Math.min(1, elapsed / timeoutSec);

    cardTimerFill.style.transform = `scaleX(${progress})`;
    liveTimerBadge.textContent = elapsed.toFixed(2) + ' s';

    if (elapsed < timeoutSec) {
      liveTimerRaf = requestAnimationFrame(runLiveTimer);
    }
  }

  // ==========================================================================
  // 9. PLAYER ACTION HANDLING (DETECTION & FEEDBACK)
  // ==========================================================================
  function handlePlayerAction(selectedAction) {
    if (state === 'feedback' || state === 'finished') return;

    if (state === 'waiting') {
      clearTimeout(waitTimer);
      cancelAnimationFrame(liveTimerRaf);
      playSound('wrong');

      state = 'feedback';
      stimulusCard.className = 'stimulus-card state-early';
      stimulusTitle.textContent = '\u00A1TE ADELANTASTE!';
      stimulusDesc.textContent = 'Presionaste antes de que apareciera el est\u00EDmulo. En el tr\u00E1nsito, anticipar maniobras sin mirar causa siniestros.';
      feedbackBanner.className = 'feedback-banner wrong';
      feedbackBanner.style.display = 'inline-flex';
      feedbackIcon.textContent = 'warning';
      feedbackText.textContent = 'Falsa salida. Reintentando la prueba...';

      setButtonsEnabled(false);

      setTimeout(() => {
        if (state === 'feedback') {
          startRoundWaiting();
        }
      }, 1800);
      return;
    }

    if (state !== 'active') return;

    cancelAnimationFrame(liveTimerRaf);
    clearTimeout(timeoutWatchdog);
    state = 'feedback';
    setButtonsEnabled(false);
    distractionPopup.style.display = 'none';

    const reactionTimeSec = +(Math.min(timeoutSec, (performance.now() - stimulusStartTime) / 1000)).toFixed(2);
    const isTimeout = selectedAction === 'timeout';
    const isCorrect = !isTimeout && (selectedAction === currentStimulus.action);

    gameHistory.push({
      stimulus: currentStimulus,
      playerAction: selectedAction,
      correct: isCorrect,
      timeSec: isTimeout ? timeoutSec : reactionTimeSec,
      hadDistraction: !!currentStimulus.hasDistraction
    });

    if (isCorrect) {
      playSound('correct');
      stimulusCard.className = 'stimulus-card state-correct';
      feedbackBanner.className = 'feedback-banner correct';
      feedbackBanner.style.display = 'inline-flex';
      feedbackIcon.textContent = 'check_circle';
      feedbackText.textContent = '\u00A1EXCELENTE! Reaccionaste en ' + reactionTimeSec.toFixed(2) + ' s';
    } else if (isTimeout) {
      playSound('wrong');
      stimulusCard.className = 'stimulus-card state-wrong';
      feedbackBanner.className = 'feedback-banner wrong';
      feedbackBanner.style.display = 'inline-flex';
      feedbackIcon.textContent = 'timer_off';
      feedbackText.textContent = '\u00A1TIEMPO AGOTADO! La opci\u00F3n era: ' + currentStimulus.actionLabel;
    } else {
      playSound('wrong');
      stimulusCard.className = 'stimulus-card state-wrong';
      feedbackBanner.className = 'feedback-banner wrong';
      feedbackBanner.style.display = 'inline-flex';
      feedbackIcon.textContent = 'cancel';
      feedbackText.textContent = 'Elegiste ' + selectedAction.toUpperCase() + ' (' + reactionTimeSec.toFixed(2) + ' s). Lo correcto era: ' + currentStimulus.actionLabel;
    }

    if (!isTimeout) {
      updateDistanceMatrix(reactionTimeSec, 'Tu respuesta');
    }

    updateDots();

    clearTimeout(feedbackAdvanceTimer);
    feedbackAdvanceTimer = setTimeout(() => {
      currentRoundIdx++;
      if (currentRoundIdx < totalRoundsForLevel) {
        startRoundWaiting();
      } else {
        showFinalResults();
      }
    }, 1600);
  }

  // Keyboard accessibility
  window.addEventListener('keydown', (e) => {
    if (state !== 'active' && state !== 'waiting') return;
    const k = e.key.toLowerCase();

    if (currentLevel === 1) {
      if (k === '1' || k === 'r') handlePlayerAction('rojo');
      else if (k === '2' || k === 'a') handlePlayerAction('amarillo');
      else if (k === '3' || k === 'v') handlePlayerAction('verde');
      else if (k === '4' || k === 'z') handlePlayerAction('azul');
    } else {
      if (k === '1' || k === 'f') handlePlayerAction('frenar');
      else if (k === '2' || k === 's') handlePlayerAction('acelerador');
      else if (k === '3' || k === 'e') handlePlayerAction('esquivar');
      else if (k === '4' || k === 'o') handlePlayerAction('omitir');
    }
  });

  // ==========================================================================
  // 10. RESULTS CALCULATION & LOCAL STORAGE SYNC
  // ==========================================================================
  function showFinalResults() {
    state = 'finished';
    playSound('finish');

    const correctItems = gameHistory.filter(h => h.correct);
    const correctCount = correctItems.length;

    const times = correctItems.length > 0
      ? correctItems.map(h => h.timeSec)
      : gameHistory.map(h => h.timeSec);

    const avgSec = +(times.reduce((a, b) => a + b, 0) / times.length).toFixed(2);
    const bestSec = +(Math.min(...times)).toFixed(2);
    const blindMeters = +(11.11 * avgSec).toFixed(1);

    updateDistanceMatrix(avgSec, 'Promedio Final');

    resAvgTime.textContent = avgSec.toFixed(2) + ' s';
    resBestTime.textContent = bestSec.toFixed(2) + ' s';
    resAccuracy.textContent = correctCount + ' / ' + totalRoundsForLevel;
    resBlindDist.textContent = blindMeters + ' m';

    if (currentLevel === 1) {
      resTitleMode.textContent = 'Nivel 1: Reflejos Crom\u00E1ticos';
      if (avgSec <= 0.55 && correctCount >= 4) {
        resAdviceText.innerHTML = '<strong>\u26A1 Reflejos asombrosos:</strong> Tu respuesta visual pura fue de <strong>' + avgSec.toFixed(2) + ' s</strong>. Ten\u00E9s una velocidad psicomotriz superior al promedio.';
      } else {
        resAdviceText.innerHTML = '<strong>\u26A0\uFE0F Tiempo registrado: ' + avgSec.toFixed(2) + ' s.</strong> A 40 km/h tu veh\u00EDculo avanza <strong>' + blindMeters + ' metros</strong> antes de procesar el color. En el Nivel 2 sumar\u00E1s decisiones en calle.';
      }
    } else if (currentLevel === 2) {
      resTitleMode.textContent = 'Nivel 2: Decisiones Viales';
      resAdviceText.innerHTML = '<strong>\uD83D\uDEA6 Criterio y Acci\u00F3n:</strong> Acertaste <strong>' + correctCount + '/' + totalRoundsForLevel + '</strong> situaciones. Soltar el acelerador ante lomos o escuelas y frenar ante peatones salva vidas todos los d\u00EDas.';
    } else {
      resTitleMode.textContent = 'Nivel 3: Distracci\u00F3n Cognitiva';
      const distracted = gameHistory.filter(h => h.hadDistraction);
      const focused = gameHistory.filter(h => !h.hadDistraction);
      const avgDistracted = distracted.length ? (distracted.reduce((a, b) => a + b.timeSec, 0) / distracted.length) : avgSec;
      const avgFocused = focused.length ? (focused.reduce((a, b) => a + b.timeSec, 0) / focused.length) : avgSec;
      const diffMeters = +((avgDistracted - avgFocused) * 11.11).toFixed(1);

      resAdviceText.innerHTML = '<strong>\uD83D\uDCF1 Efecto del Celular:</strong> Con distracci\u00F3n promediaste <strong>' + avgDistracted.toFixed(2) + ' s</strong> vs <strong>' + avgFocused.toFixed(2) + ' s</strong> atento. \u00A1Esos segundos equivalen a <strong>' + Math.max(3, diffMeters) + ' metros extra</strong> a ciegas sin tocar el freno!';
    }

    if (currentLevel < 3) {
      btnNextLevel.style.display = 'inline-flex';
      btnNextLevel.onclick = () => setLevel(currentLevel + 1);
    } else {
      btnNextLevel.style.display = 'none';
    }

    stimulusCard.style.display = 'none';
    actionsGrid.style.display = 'none';
    resultsCard.style.display = 'flex';
    roundBadge.textContent = 'NIVEL COMPLETADO';
    roundStateText.textContent = 'Aciertos: ' + correctCount + '/' + totalRoundsForLevel;

    saveSessionRecord({
      player: currentPlayer.name,
      email: currentPlayer.email,
      level: currentLevel,
      avgTime: avgSec,
      bestTime: bestSec,
      accuracy: correctCount + '/' + totalRoundsForLevel,
      date: new Date().toLocaleString('es-AR')
    });
  }

  btnReplay.addEventListener('click', () => {
    initGameForCurrentLevel();
  });

  function saveSessionRecord(record) {
    try {
      const stored = localStorage.getItem(STORAGE_SESSIONS);
      const db = stored ? JSON.parse(stored) : [];
      db.unshift(record);
      if (db.length > 500) db.pop();
      localStorage.setItem(STORAGE_SESSIONS, JSON.stringify(db));
    } catch (e) {
      console.warn('Error saving session to local storage', e);
    }
  }

  // ==========================================================================
  // 11. ADMIN PANEL, CONTROL + A SHORTCUT & CSV EXPORT
  // ==========================================================================
  function openAdminModal() {
    if (!adminModal) return;
    adminModal.classList.add('active');
    if (inputAdminPass) inputAdminPass.value = '';
    if (adminAuthError) adminAuthError.style.display = 'none';
    if (adminAuthView) adminAuthView.style.display = 'flex';
    if (adminContentView) adminContentView.style.display = 'none';
    setTimeout(() => {
      if (inputAdminPass) inputAdminPass.focus();
    }, 100);
  }

  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 'a' || e.key === 'A')) {
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.id === 'input-player-name' || activeEl.id === 'input-player-email')) {
        // Normal select-all inside text input
      } else {
        e.preventDefault();
        openAdminModal();
      }
    }
  });

  const brandBlock = document.getElementById('header-brand-block');
  let badgeTapCount = 0;
  let badgeTapTimeout = null;
  if (brandBlock) {
    brandBlock.addEventListener('click', () => {
      badgeTapCount++;
      clearTimeout(badgeTapTimeout);
      if (badgeTapCount >= 4) {
        badgeTapCount = 0;
        openAdminModal();
      } else {
        badgeTapTimeout = setTimeout(() => { badgeTapCount = 0; }, 1200);
      }
    });
  }

  if (inputAdminPass) {
    inputAdminPass.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        btnSubmitAdminAuth.click();
      }
    });
  }

  let adminActiveFilter = 'all';
  let adminSearchQuery = '';

  if (btnCloseAdmin) {
    btnCloseAdmin.addEventListener('click', () => {
      adminModal.classList.remove('active');
    });
  }

  if (adminModal) {
    adminModal.addEventListener('click', (e) => {
      if (e.target === adminModal) {
        adminModal.classList.remove('active');
      }
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && adminModal && adminModal.classList.contains('active')) {
      adminModal.classList.remove('active');
    }
  });

  btnSubmitAdminAuth.addEventListener('click', () => {
    const inputVal = inputAdminPass.value.trim();
    const storedPwd = localStorage.getItem(STORAGE_ADMIN_PWD) || DEFAULT_ADMIN_PWD;

    if (inputVal === storedPwd || inputVal === 'vial2026') {
      adminAuthView.style.display = 'none';
      adminContentView.style.display = 'flex';
      renderAdminDashboard();
    } else {
      adminAuthError.style.display = 'block';
    }
  });

  if (adminSearchInput) {
    adminSearchInput.addEventListener('input', (e) => {
      adminSearchQuery = e.target.value.trim().toLowerCase();
      renderAdminDashboard();
    });
  }

  if (adminLevelFilters) {
    adminLevelFilters.addEventListener('click', (e) => {
      const btn = e.target.closest('.lvl-filter-btn');
      if (!btn) return;
      adminLevelFilters.querySelectorAll('.lvl-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      adminActiveFilter = btn.dataset.filter || 'all';
      renderAdminDashboard();
    });
  }

  function renderAdminDashboard() {
    try {
      const raw = localStorage.getItem(STORAGE_SESSIONS);
      const list = raw ? JSON.parse(raw) : [];

      if (adminStatTotal) adminStatTotal.textContent = list.length;

      if (list.length > 0) {
        const bests = list.map(item => Number(item.bestTime) || 99).filter(n => n > 0 && n < 90);
        const avgs = list.map(item => Number(item.avgTime) || 0).filter(n => n > 0);

        if (adminStatBest) {
          adminStatBest.textContent = bests.length ? (Math.min(...bests).toFixed(2) + 's') : '0.00s';
        }
        if (adminStatAvg) {
          const totalAvg = avgs.length ? (avgs.reduce((a, b) => a + b, 0) / avgs.length).toFixed(2) : '0.00';
          adminStatAvg.textContent = totalAvg + 's';
        }

        if (adminStatAcc) {
          let totalHits = 0;
          let totalTrials = 0;
          list.forEach(item => {
            if (typeof item.accuracy === 'string' && item.accuracy.includes('/')) {
              const parts = item.accuracy.split('/').map(Number);
              if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1]) && parts[1] > 0) {
                totalHits += parts[0];
                totalTrials += parts[1];
              }
            }
          });
          const accPct = totalTrials > 0 ? Math.round((totalHits / totalTrials) * 100) : 100;
          adminStatAcc.textContent = accPct + '%';
        }
      } else {
        if (adminStatBest) adminStatBest.textContent = '0.00s';
        if (adminStatAvg) adminStatAvg.textContent = '0.00s';
        if (adminStatAcc) adminStatAcc.textContent = '100%';
      }

      // Filter by level and search query
      const filtered = list.filter(item => {
        if (adminActiveFilter !== 'all' && String(item.level) !== String(adminActiveFilter)) {
          return false;
        }
        if (adminSearchQuery) {
          const p = (item.player || '').toLowerCase();
          const em = (item.email || '').toLowerCase();
          const d = (item.date || '').toLowerCase();
          if (!p.includes(adminSearchQuery) && !em.includes(adminSearchQuery) && !d.includes(adminSearchQuery)) {
            return false;
          }
        }
        return true;
      });

      if (adminRecordsCount) {
        adminRecordsCount.textContent = `${filtered.length} de ${list.length} registros`;
      }

      if (filtered.length > 0) {
        adminTableBody.innerHTML = filtered.map((item, idx) => {
          const avgNum = Number(item.avgTime) || 0;
          let speedClass = 'badge-speed-mid';
          if (avgNum > 0 && avgNum < 0.50) speedClass = 'badge-speed-fast';
          else if (avgNum >= 0.70) speedClass = 'badge-speed-slow';

          let lvlName = 'Nivel ' + (item.level || '1');
          let lvlClass = 'badge-lvl-1';
          if (String(item.level) === '2') {
            lvlName = '2. Decisiones';
            lvlClass = 'badge-lvl-2';
          } else if (String(item.level) === '3') {
            lvlName = '3. Celular';
            lvlClass = 'badge-lvl-3';
          } else {
            lvlName = '1. Colores';
            lvlClass = 'badge-lvl-1';
          }

          return `
            <tr>
              <td style="color:var(--text-dim);font-weight:700;">${idx + 1}</td>
              <td style="font-size:11px;color:var(--text-muted);">${escapeHtml(item.date || '-')}</td>
              <td style="font-weight:700;">
                <div style="display:flex;align-items:center;gap:6px;">
                  <span class="material-symbols-outlined" style="font-size:16px;color:var(--accent-cyan);">person</span>
                  <span>${escapeHtml(item.player)}</span>
                </div>
              </td>
              <td style="color:var(--text-muted);">${escapeHtml(item.email || '-')}</td>
              <td><span class="badge-lvl ${lvlClass}">${lvlName}</span></td>
              <td><span class="badge-speed ${speedClass}">${item.avgTime}s</span></td>
              <td style="font-family:var(--font-condensed);font-weight:700;color:var(--accent-cyan);font-size:13px;">${item.bestTime}s</td>
              <td><span style="font-weight:700;color:var(--accent-green);font-size:12px;">${item.accuracy}</span></td>
            </tr>
          `;
        }).join('');
      } else {
        adminTableBody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--text-muted);padding:24px;">No se encontraron registros coincidentes.</td></tr>';
      }
    } catch (e) {
      console.warn('Error rendering admin stats', e);
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, m => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[m]));
  }

  btnAdminExport.addEventListener('click', () => {
    try {
      const raw = localStorage.getItem(STORAGE_SESSIONS);
      const list = raw ? JSON.parse(raw) : [];
      if (!list.length) {
        alert('No hay registros para exportar.');
        return;
      }

      let csv = '\uFEFF';
      csv += 'Fecha,Participante,Email,Nivel,Tiempo Promedio (s),Mejor Tiempo (s),Aciertos\n';

      list.forEach(r => {
        const row = [
          `"${(r.date || '').replace(/"/g, '""')}"`,
          `"${(r.player || '').replace(/"/g, '""')}"`,
          `"${(r.email || '').replace(/"/g, '""')}"`,
          r.level,
          r.avgTime,
          r.bestTime,
          `"${r.accuracy}"`
        ];
        csv += row.join(',') + '\n';
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `VialPlay_Test_Reaccion_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Error al exportar CSV');
    }
  });

  btnAdminClear.addEventListener('click', () => {
    if (confirm('\u00BFEst\u00E1s seguro de que dese\u00E1s borrar todo el historial del stand? Esta acci\u00F3n no se puede deshacer.')) {
      localStorage.removeItem(STORAGE_SESSIONS);
      renderAdminDashboard();
    }
  });

  // ==========================================================================
  // 12. INITIALIZATION
  // ==========================================================================
  loadStoredPlayer();
  if (currentPlayer.isLoggedIn) {
    showSection('test');
  } else {
    showSection('login');
  }

})();