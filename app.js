/**
 * VIAL PLAY - Test de Reacción Vial | GCBA
 * Gerencia de Educación y Convivencia Vial - Dirección General de Seguridad Vial
 * Stand Interactivo Kiosk Application
 */

(function () {
  'use strict';

  // =========================================================================
  // State & Storage Keys
  // =========================================================================
  const STORAGE_KEY_DB = 'vialplay_participants_db';
  const STORAGE_KEY_PWD = 'vialplay_admin_pwd';
  const DEFAULT_ADMIN_PWD = 'vial2026';
  const TOTAL_ATTEMPTS = 3;

  const state = {
    currentParticipant: {
      name: '',
      email: '',
      role: '',
      attempts: [],
      avgTime: 0,
      bestTime: 0,
      date: ''
    },
    game: {
      currentRound: 1,
      subState: 'idle', // 'idle' | 'waiting' | 'trigger' | 'early' | 'round_result'
      startTime: 0,
      triggerTimeoutId: null,
      roundsData: []
    },
    soundEnabled: true
  };

  // Web Audio Context for zero-dependency high fidelity sounds
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playTone(freq, type, duration, gainValue = 0.15) {
    if (!state.soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      gain.gain.setValueAtTime(gainValue, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      console.warn('Audio tone error', e);
    }
  }

  function playSoundCue(type) {
    switch (type) {
      case 'ready':
        playTone(440, 'sine', 0.15, 0.1);
        break;
      case 'trigger': // Sudden warning buzzer/siren
        playTone(880, 'square', 0.25, 0.2);
        setTimeout(() => playTone(660, 'sawtooth', 0.2, 0.18), 70);
        break;
      case 'early': // Low error buzz
        playTone(180, 'sawtooth', 0.35, 0.25);
        break;
      case 'success': // Chime
        playTone(523.25, 'sine', 0.12, 0.15); // C5
        setTimeout(() => playTone(659.25, 'sine', 0.15, 0.15), 100); // E5
        setTimeout(() => playTone(783.99, 'sine', 0.25, 0.2), 200); // G5
        break;
      case 'complete': // Fanfare
        [523, 659, 784, 1046].forEach((f, idx) => {
          setTimeout(() => playTone(f, 'triangle', 0.3, 0.2), idx * 120);
        });
        break;
    }
  }

  // =========================================================================
  // DOM Elements
  // =========================================================================
  const views = {
    login: document.getElementById('view-login'),
    briefing: document.getElementById('view-briefing'),
    game: document.getElementById('view-game'),
    results: document.getElementById('view-results')
  };

  // Header Elements
  const btnToggleSound = document.getElementById('btn-toggle-sound');
  const iconSoundOn = document.getElementById('icon-sound-on');
  const iconSoundOff = document.getElementById('icon-sound-off');
  const btnToggleFullscreen = document.getElementById('btn-toggle-fullscreen');
  const btnOpenAdmin = document.getElementById('btn-open-admin');

  // Login View Elements
  const formParticipant = document.getElementById('form-participant');
  const inputName = document.getElementById('input-name');
  const inputEmail = document.getElementById('input-email');
  const selectRole = document.getElementById('select-role');
  const formError = document.getElementById('form-error');

  // Briefing View Elements
  const briefingWelcomeName = document.getElementById('briefing-welcome-name');
  const btnBackToLogin = document.getElementById('btn-back-to-login');
  const btnStartTest = document.getElementById('btn-start-test');

  // Game View Elements
  const hudName = document.getElementById('hud-name');
  const hudBestTime = document.getElementById('hud-best-time');
  const attemptsIndicator = document.getElementById('attempts-indicator');
  const reactionSurface = document.getElementById('reaction-surface');
  const lensRed = document.getElementById('lens-red');
  const lensYellow = document.getElementById('lens-yellow');
  const lensGreen = document.getElementById('lens-green');
  const gameStatusBadge = document.getElementById('game-status-badge');
  const gameMainInstruction = document.getElementById('game-main-instruction');
  const gameSubInstruction = document.getElementById('game-sub-instruction');
  const gameTimerDisplay = document.getElementById('game-timer-display');
  const gameTimerMs = document.getElementById('game-timer-ms');
  const earlyWarningBox = document.getElementById('early-warning-box');
  const btnRetryEarly = document.getElementById('btn-retry-early');

  // Results View Elements
  const resParticipantName = document.getElementById('res-participant-name');
  const resDatetime = document.getElementById('res-datetime');
  const resAvgTime = document.getElementById('res-avg-time');
  const resRatingBadge = document.getElementById('res-rating-badge');
  const resAtt1 = document.getElementById('res-att-1');
  const resAtt2 = document.getElementById('res-att-2');
  const resAtt3 = document.getElementById('res-att-3');
  const resBestTime = document.getElementById('res-best-time');
  const resDescTime = document.getElementById('res-desc-time');
  const dist40User = document.getElementById('dist-40-user');
  const dist40Cars = document.getElementById('dist-40-cars');
  const bar40User = document.getElementById('bar-40-user');
  const dist60User = document.getElementById('dist-60-user');
  const dist60Cars = document.getElementById('dist-60-cars');
  const bar60User = document.getElementById('bar-60-user');
  const btnNextParticipant = document.getElementById('btn-next-participant');
  const btnRetryTest = document.getElementById('btn-retry-test');

  // Admin Modal Elements
  const modalAdmin = document.getElementById('modal-admin');
  const adminLoginView = document.getElementById('admin-login-view');
  const adminDashboardView = document.getElementById('admin-dashboard-view');
  const btnCloseAdminLogin = document.getElementById('btn-close-admin-login');
  const btnCloseAdminDash = document.getElementById('btn-close-admin-dash');
  const btnCancelAdmin = document.getElementById('btn-cancel-admin');
  const formAdminAuth = document.getElementById('form-admin-auth');
  const adminPasswordInput = document.getElementById('admin-password');
  const adminAuthError = document.getElementById('admin-auth-error');
  const statTotalUsers = document.getElementById('stat-total-users');
  const statAvgStand = document.getElementById('stat-avg-stand');
  const statBestStand = document.getElementById('stat-best-stand');
  const adminSearchInput = document.getElementById('admin-search-input');
  const btnExportCsv = document.getElementById('btn-export-csv');
  const btnChangePwd = document.getElementById('btn-change-pwd');
  const btnClearDb = document.getElementById('btn-clear-db');
  const adminTableBody = document.getElementById('admin-table-body');
  const tableEmptyMsg = document.getElementById('table-empty-msg');
  const pwdChangeContainer = document.getElementById('pwd-change-container');
  const newAdminPassword = document.getElementById('new-admin-password');
  const btnSaveNewPwd = document.getElementById('btn-save-new-pwd');
  const btnCancelNewPwd = document.getElementById('btn-cancel-new-pwd');
  const pwdChangeMsg = document.getElementById('pwd-change-msg');
  const btnAdminLogout = document.getElementById('btn-admin-logout');
  const btnKioskReset = document.getElementById('btn-kiosk-reset');

  // =========================================================================
  // View Routing
  // =========================================================================
  function switchView(target) {
    Object.keys(views).forEach(key => {
      if (key === target) {
        views[key].classList.add('active');
      } else {
        views[key].classList.remove('active');
      }
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // =========================================================================
  // Local Database & Storage
  // =========================================================================
  function getParticipants() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_DB);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading localStorage', e);
      return [];
    }
  }

  function saveParticipant(record) {
    const list = getParticipants();
    list.unshift(record); // newest first
    try {
      localStorage.setItem(STORAGE_KEY_DB, JSON.stringify(list));
    } catch (e) {
      console.error('Error saving participant to localStorage', e);
    }
  }

  function getAdminPassword() {
    return localStorage.getItem(STORAGE_KEY_PWD) || DEFAULT_ADMIN_PWD;
  }

  function setAdminPassword(pwd) {
    localStorage.setItem(STORAGE_KEY_PWD, pwd);
  }

  // =========================================================================
  // Sound & Fullscreen Controls
  // =========================================================================
  btnToggleSound.addEventListener('click', () => {
    state.soundEnabled = !state.soundEnabled;
    iconSoundOn.classList.toggle('hidden', !state.soundEnabled);
    iconSoundOff.classList.toggle('hidden', state.soundEnabled);
    if (state.soundEnabled) {
      playTone(550, 'sine', 0.1, 0.1);
    }
  });

  btnToggleFullscreen.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  });

  // =========================================================================
  // Form Registration & Validation
  // =========================================================================
  formParticipant.addEventListener('submit', (e) => {
    e.preventDefault();
    initAudio();
    formError.classList.add('hidden');

    const name = inputName.value.trim();
    const email = inputEmail.value.trim();
    const role = selectRole.value;

    if (!name || name.length < 3) {
      formError.textContent = 'Por favor ingresá tu nombre y apellido completo.';
      formError.classList.remove('hidden');
      inputName.focus();
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      formError.textContent = 'Por favor ingresá una dirección de correo electrónico válida.';
      formError.classList.remove('hidden');
      inputEmail.focus();
      return;
    }

    state.currentParticipant = {
      name,
      email,
      role,
      attempts: [],
      avgTime: 0,
      bestTime: 0,
      date: new Date().toLocaleString('es-AR')
    };

    briefingWelcomeName.textContent = `¡Hola, ${name.split(' ')[0]}!`;
    playSoundCue('ready');
    switchView('briefing');
  });

  btnBackToLogin.addEventListener('click', () => {
    switchView('login');
  });

  btnStartTest.addEventListener('click', () => {
    initAudio();
    startGameSession();
  });

  // =========================================================================
  // Game Logic & State Machine
  // =========================================================================
  function startGameSession() {
    state.game.currentRound = 1;
    state.game.roundsData = [];
    hudName.textContent = state.currentParticipant.name;
    hudBestTime.textContent = '-- ms';

    updateAttemptPills();
    switchView('game');
    setupReadyState();
  }

  function updateAttemptPills() {
    const pills = attemptsIndicator.querySelectorAll('.attempt-pill');
    pills.forEach((pill) => {
      const roundNum = parseInt(pill.getAttribute('data-attempt'), 10);
      pill.classList.remove('active', 'completed');
      if (roundNum === state.game.currentRound) {
        pill.classList.add('active');
      } else if (roundNum < state.game.currentRound) {
        pill.classList.add('completed');
      }
    });
  }

  function clearTrafficLights() {
    lensRed.classList.remove('active');
    lensYellow.classList.remove('active');
    lensGreen.classList.remove('active');
  }

  function setupReadyState() {
    state.game.subState = 'idle';
    if (state.game.triggerTimeoutId) {
      clearTimeout(state.game.triggerTimeoutId);
      state.game.triggerTimeoutId = null;
    }

    reactionSurface.className = 'reaction-surface state-ready';
    clearTrafficLights();
    lensGreen.classList.add('active');

    gameStatusBadge.textContent = `INTENTO ${state.game.currentRound} DE ${TOTAL_ATTEMPTS}`;
    gameMainInstruction.textContent = 'Tocá la pantalla para empezar';
    gameSubInstruction.textContent = 'Al tocar, el semáforo entrará en modo de espera';
    gameTimerDisplay.classList.add('hidden');
    earlyWarningBox.classList.add('hidden');
  }

  function startWaitingState() {
    state.game.subState = 'waiting';
    reactionSurface.className = 'reaction-surface state-waiting';

    clearTrafficLights();
    lensYellow.classList.add('active');

    gameStatusBadge.textContent = '¡ATENCIÓN!';
    gameMainInstruction.textContent = 'Esperá la luz ROJA...';
    gameSubInstruction.textContent = 'Concentrate. No toques todavía.';
    gameTimerDisplay.classList.add('hidden');
    earlyWarningBox.classList.add('hidden');

    playSoundCue('ready');

    // Random trigger delay between 1.8s and 4.8s
    const randomDelay = Math.floor(Math.random() * 3000) + 1800;

    state.game.triggerTimeoutId = setTimeout(() => {
      triggerBrakeCue();
    }, randomDelay);
  }

  function triggerBrakeCue() {
    state.game.subState = 'trigger';
    state.game.startTime = performance.now();

    reactionSurface.className = 'reaction-surface state-trigger';
    clearTrafficLights();
    lensRed.classList.add('active');

    gameStatusBadge.textContent = '¡FRENÁ AHORA!';
    gameMainInstruction.textContent = '¡TOCÁ YA!';
    gameSubInstruction.textContent = '¡Freno de emergencia activado!';

    playSoundCue('trigger');
  }

  function handleSurfaceInteraction(e) {
    if (e) {
      e.preventDefault();
    }
    initAudio();

    if (state.game.subState === 'idle') {
      startWaitingState();
    } else if (state.game.subState === 'waiting') {
      // User tapped too early!
      handleEarlyTap();
    } else if (state.game.subState === 'trigger') {
      // Valid reaction!
      handleSuccessfulReaction();
    }
  }

  function handleEarlyTap() {
    if (state.game.triggerTimeoutId) {
      clearTimeout(state.game.triggerTimeoutId);
      state.game.triggerTimeoutId = null;
    }

    state.game.subState = 'early';
    reactionSurface.className = 'reaction-surface state-early';
    clearTrafficLights();
    lensYellow.classList.add('active');

    gameStatusBadge.textContent = '¡FALTA DE CONDUCCIÓN!';
    gameMainInstruction.textContent = '';
    gameSubInstruction.textContent = '';
    gameTimerDisplay.classList.add('hidden');
    earlyWarningBox.classList.remove('hidden');

    playSoundCue('early');
  }

  btnRetryEarly.addEventListener('click', (e) => {
    e.stopPropagation();
    setupReadyState();
  });

  function handleSuccessfulReaction() {
    const elapsed = Math.round(performance.now() - state.game.startTime);
    state.game.subState = 'round_result';

    reactionSurface.className = 'reaction-surface state-success';
    playSoundCue('success');

    state.game.roundsData.push(elapsed);
    gameTimerMs.textContent = elapsed;
    gameTimerDisplay.classList.remove('hidden');

    // Update best time in HUD
    const currentBest = Math.min(...state.game.roundsData);
    hudBestTime.textContent = `${currentBest} ms`;

    gameStatusBadge.textContent = `¡EXCELENTE FRENADA!`;
    gameMainInstruction.textContent = `${elapsed} ms`;
    gameSubInstruction.textContent = getQuickFeedback(elapsed);

    // After brief delay, proceed to next round or finish
    setTimeout(() => {
      if (state.game.currentRound < TOTAL_ATTEMPTS) {
        state.game.currentRound++;
        updateAttemptPills();
        setupReadyState();
      } else {
        finishGameSession();
      }
    }, 1800);
  }

  function getQuickFeedback(ms) {
    if (ms < 250) return '¡Reflejos extraordinarios! Reacción de nivel profesional.';
    if (ms < 350) return '¡Muy buen tiempo de respuesta! Conducción alerta.';
    if (ms < 480) return 'Tiempo dentro del promedio habitual.';
    return 'Reacción lenta. En la calle recordá mantener mayor distancia de frenado.';
  }

  // Bind clicks / touches / keyboard spacebar to reaction surface
  reactionSurface.addEventListener('pointerdown', handleSurfaceInteraction);

  window.addEventListener('keydown', (e) => {
    // Only react to spacebar if on game screen
    if (e.code === 'Space' && views.game.classList.contains('active')) {
      e.preventDefault();
      handleSurfaceInteraction();
    }
  });

  // =========================================================================
  // Game Completion & Results Calculation
  // =========================================================================
  function finishGameSession() {
    playSoundCue('complete');

    const rounds = state.game.roundsData;
    const sum = rounds.reduce((acc, val) => acc + val, 0);
    const avg = Math.round(sum / rounds.length);
    const best = Math.min(...rounds);

    state.currentParticipant.attempts = rounds;
    state.currentParticipant.avgTime = avg;
    state.currentParticipant.bestTime = best;

    // Save to Stand DB
    saveParticipant({
      id: 'VP-' + Date.now().toString(36).toUpperCase(),
      name: state.currentParticipant.name,
      email: state.currentParticipant.email,
      role: state.currentParticipant.role,
      attempts: rounds,
      avgTime: avg,
      bestTime: best,
      date: state.currentParticipant.date
    });

    renderResults(avg, best, rounds);
    switchView('results');
  }

  function renderResults(avg, best, rounds) {
    resParticipantName.textContent = state.currentParticipant.name;
    resDatetime.textContent = state.currentParticipant.date;
    resAvgTime.textContent = avg;
    resDescTime.textContent = avg;

    resAtt1.textContent = rounds[0] ? `${rounds[0]} ms` : '-';
    resAtt2.textContent = rounds[1] ? `${rounds[1]} ms` : '-';
    resAtt3.textContent = rounds[2] ? `${rounds[2]} ms` : '-';
    resBestTime.textContent = `${best} ms`;

    // Tier badge evaluation
    resRatingBadge.className = 'tier-badge';
    if (avg < 260) {
      resRatingBadge.classList.add('tier-optimal');
      resRatingBadge.textContent = 'Reflejos Extraordinarios (Nivel Piloto)';
    } else if (avg < 360) {
      resRatingBadge.classList.add('tier-optimal');
      resRatingBadge.textContent = 'Reflejos Óptimos (Atención Plena)';
    } else if (avg < 500) {
      resRatingBadge.classList.add('tier-good');
      resRatingBadge.textContent = 'Rango Promedio (Conducción Segura)';
    } else {
      resRatingBadge.classList.add('tier-danger');
      resRatingBadge.textContent = 'Atención Requerida (Distancia Crítica)';
    }

    // Reaction distance physics:
    // Distance (m) = Speed (m/s) * Time (s)
    // 40 km/h = 11.11 m/s
    // 60 km/h = 16.67 m/s
    const seconds = avg / 1000;
    const dist40 = (11.11 * seconds).toFixed(1);
    const dist60 = (16.67 * seconds).toFixed(1);

    dist40User.textContent = dist40;
    dist60User.textContent = dist60;

    // 1 car length ~ 4.5m
    dist40Cars.textContent = (dist40 / 4.5).toFixed(1);
    dist60Cars.textContent = (dist60 / 4.5).toFixed(1);

    // Visual percentage bar (max 25m reference)
    const bar40Pct = Math.min(100, Math.max(10, (dist40 / 20) * 100));
    const bar60Pct = Math.min(100, Math.max(10, (dist60 / 30) * 100));
    bar40User.style.width = `${bar40Pct}%`;
    bar60User.style.width = `${bar60Pct}%`;
  }

  btnNextParticipant.addEventListener('click', () => {
    // Reset inputs for next stand attendee
    inputName.value = '';
    inputEmail.value = '';
    formError.classList.add('hidden');
    switchView('login');
  });

  btnRetryTest.addEventListener('click', () => {
    startGameSession();
  });

  // =========================================================================
  // Admin Panel & Modal Management
  // =========================================================================
  function openAdminModal() {
    adminPasswordInput.value = '';
    adminAuthError.classList.add('hidden');
    pwdChangeContainer.classList.add('hidden');

    adminLoginView.classList.remove('hidden');
    adminDashboardView.classList.add('hidden');
    modalAdmin.classList.remove('hidden');
    adminPasswordInput.focus();
  }

  function closeAdminModal() {
    modalAdmin.classList.add('hidden');
  }

  btnOpenAdmin.addEventListener('click', openAdminModal);
  btnCloseAdminLogin.addEventListener('click', closeAdminModal);
  btnCloseAdminDash.addEventListener('click', closeAdminModal);
  btnCancelAdmin.addEventListener('click', closeAdminModal);

  formAdminAuth.addEventListener('submit', (e) => {
    e.preventDefault();
    const entered = adminPasswordInput.value.trim();
    if (entered === getAdminPassword()) {
      showAdminDashboard();
    } else {
      adminAuthError.classList.remove('hidden');
      adminPasswordInput.select();
    }
  });

  function showAdminDashboard() {
    adminLoginView.classList.add('hidden');
    adminDashboardView.classList.remove('hidden');
    refreshAdminDashboard();
  }

  function refreshAdminDashboard(filterText = '') {
    const list = getParticipants();
    statTotalUsers.textContent = list.length;

    if (list.length > 0) {
      const avgAll = Math.round(list.reduce((acc, p) => acc + (p.avgTime || 0), 0) / list.length);
      const bestAll = Math.min(...list.map(p => p.bestTime || 9999));
      statAvgStand.textContent = `${avgAll} ms`;
      statBestStand.textContent = `${bestAll} ms`;
    } else {
      statAvgStand.textContent = '0 ms';
      statBestStand.textContent = '0 ms';
    }

    const filtered = list.filter(p => {
      const q = filterText.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q) || (p.role && p.role.toLowerCase().includes(q));
    });

    adminTableBody.innerHTML = '';
    if (filtered.length === 0) {
      tableEmptyMsg.classList.remove('hidden');
    } else {
      tableEmptyMsg.classList.add('hidden');
      filtered.forEach((p, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${filtered.length - idx}</td>
          <td>${p.date || '-'}</td>
          <td><strong>${escapeHtml(p.name)}</strong></td>
          <td>${escapeHtml(p.email)}</td>
          <td><span class="stat-pill">${escapeHtml(p.role || 'Conductor')}</span></td>
          <td><strong style="color: var(--gcba-yellow);">${p.avgTime} ms</strong></td>
          <td><strong style="color: var(--traffic-green);">${p.bestTime} ms</strong></td>
          <td><small>${p.attempts ? p.attempts.join(' / ') : '-'}</small></td>
        `;
        adminTableBody.appendChild(tr);
      });
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, function (m) {
      return ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      })[m];
    });
  }

  adminSearchInput.addEventListener('input', (e) => {
    refreshAdminDashboard(e.target.value.trim());
  });

  // Export CSV for Excel (UTF-8 BOM formatted)
  btnExportCsv.addEventListener('click', () => {
    const list = getParticipants();
    if (list.length === 0) {
      alert('No hay registros guardados para exportar.');
      return;
    }

    const headers = ['ID', 'Fecha', 'Nombre y Apellido', 'Email', 'Rol de Movilidad', 'Promedio (ms)', 'Mejor Tiempo (ms)', 'Intento 1', 'Intento 2', 'Intento 3'];
    const rows = list.map(p => [
      `"${p.id || ''}"`,
      `"${p.date || ''}"`,
      `"${(p.name || '').replace(/"/g, '""')}"`,
      `"${(p.email || '').replace(/"/g, '""')}"`,
      `"${(p.role || '').replace(/"/g, '""')}"`,
      p.avgTime || '',
      p.bestTime || '',
      p.attempts && p.attempts[0] ? p.attempts[0] : '',
      p.attempts && p.attempts[1] ? p.attempts[1] : '',
      p.attempts && p.attempts[2] ? p.attempts[2] : ''
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStamp = new Date().toISOString().slice(0, 10);
    link.download = `VIAL_PLAY_Stand_GCBA_${dateStamp}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });

  // Change Password
  btnChangePwd.addEventListener('click', () => {
    pwdChangeContainer.classList.toggle('hidden');
    newAdminPassword.value = '';
    pwdChangeMsg.textContent = '';
  });

  btnCancelNewPwd.addEventListener('click', () => {
    pwdChangeContainer.classList.add('hidden');
  });

  btnSaveNewPwd.addEventListener('click', () => {
    const val = newAdminPassword.value.trim();
    if (val.length < 4) {
      pwdChangeMsg.style.color = '#FF5A68';
      pwdChangeMsg.textContent = 'La clave debe tener al menos 4 caracteres.';
      return;
    }
    setAdminPassword(val);
    pwdChangeMsg.style.color = '#00E676';
    pwdChangeMsg.textContent = '¡Contraseña actualizada correctamente!';
    setTimeout(() => {
      pwdChangeContainer.classList.add('hidden');
    }, 1500);
  });

  // Wipe Database
  btnClearDb.addEventListener('click', () => {
    const confirm1 = confirm('¿Estás seguro de que deseás BORRAR todos los registros de los participantes del stand?');
    if (confirm1) {
      const confirm2 = confirm('Esta acción no se puede deshacer. ¿Confirmar el borrado definitivo?');
      if (confirm2) {
        localStorage.removeItem(STORAGE_KEY_DB);
        refreshAdminDashboard();
        alert('Base de datos restablecida.');
      }
    }
  });

  btnAdminLogout.addEventListener('click', () => {
    closeAdminModal();
  });

  btnKioskReset.addEventListener('click', () => {
    closeAdminModal();
    inputName.value = '';
    inputEmail.value = '';
    formError.classList.add('hidden');
    switchView('login');
  });

  // Close modal when clicking on overlay background
  modalAdmin.addEventListener('click', (e) => {
    if (e.target === modalAdmin) {
      closeAdminModal();
    }
  });

  // Keyboard escape to close admin modal
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modalAdmin.classList.contains('hidden')) {
      closeAdminModal();
    }
  });

})();
