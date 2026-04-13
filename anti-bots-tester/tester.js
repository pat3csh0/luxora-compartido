/*
  Tester visual del anti-bot de luxora-compartido
  ────────────────────────────────────────────────
  Panel flotante que permite a un usuario verificar que el script
  anti-bots.js esta instalado y funciona, sin tocar consola.

  Carga: via bookmarklet o pegando <script src="tester.js"> en la pagina.

  Requisitos de la pagina:
  - anti-bots.js v1.0+ ya cargado (marca los forms con data-honeypot-injected)
  - Opcional: data-antibot-debug en el <script> del anti-bot, para exponer
    window.__antiBotDebug y poder leer el flag wasTouched en vivo.

  Sin dependencias. Vanilla JS. Prefijo .abt-* para aislar estilos.
  v0.1 — 2026-04-13 · JLM
*/
(function() {
  if (window.__abtTester) {
    // Ya esta cargado: si el panel fue cerrado, lo reabrimos
    window.__abtTester.open();
    return;
  }

  var SS_KEY = 'abt-tester-state';
  var MAX_LOG = 30;
  var RANDOM_VALUES = [
    'http://spam-site.tld',
    'http://bot-crawler.example',
    'https://cheap-seo.biz',
    'http://casino-free.net',
    'https://viagra-online.xyz'
  ];

  // ── Estilos (inline para no depender de red adicional) ────
  var CSS = [
    '.abt-panel{all:initial;position:fixed;right:20px;bottom:20px;width:340px;max-height:calc(100vh - 40px);',
      'background:#161a22;color:#e7e9ee;border:1px solid #2a2f3a;border-radius:12px;',
      'box-shadow:0 14px 40px rgba(0,0,0,.55);font:13px/1.45 -apple-system,Segoe UI,Inter,Roboto,sans-serif;',
      'z-index:2147483647;display:flex;flex-direction:column;overflow:hidden}',
    '.abt-panel *{box-sizing:border-box;font-family:inherit}',
    '.abt-panel.abt-min{max-height:42px}',
    '.abt-panel.abt-min .abt-body{display:none}',
    '.abt-panel.abt-min .abt-footer{display:none}',
    '.abt-head{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;',
      'background:#1c212c;border-bottom:1px solid #2a2f3a;cursor:move;flex-shrink:0}',
    '.abt-title{font-weight:600;font-size:13px;color:#e7e9ee}',
    '.abt-title::before{content:"\u{1F9EA}  ";opacity:.85}',
    '.abt-head-btns{display:flex;gap:6px}',
    '.abt-iconbtn{width:24px;height:24px;border:1px solid #2a2f3a;background:transparent;color:#8b93a7;',
      'border-radius:4px;cursor:pointer;line-height:1;font-size:12px;padding:0}',
    '.abt-iconbtn:hover{color:#e7e9ee;border-color:#7cc4ff}',
    '.abt-iconbtn:focus-visible{outline:2px solid #7cc4ff;outline-offset:1px}',
    '.abt-body{padding:14px;overflow:auto;flex:1}',
    '.abt-label{font-size:10px;text-transform:uppercase;letter-spacing:.6px;color:#8b93a7;margin:0 0 6px;font-weight:600}',
    '.abt-select{width:100%;padding:7px 10px;background:#0f1117;color:#e7e9ee;border:1px solid #2a2f3a;',
      'border-radius:6px;font:inherit;margin-bottom:14px}',
    '.abt-select:focus-visible{outline:2px solid #7cc4ff;outline-offset:1px}',
    '.abt-state{background:#0f1117;border:1px solid #2a2f3a;border-radius:8px;padding:10px 12px;margin-bottom:12px}',
    '.abt-state ul{list-style:none;margin:0;padding:0}',
    '.abt-state li{display:flex;justify-content:space-between;gap:8px;padding:3px 0;font-size:12px;align-items:center}',
    '.abt-state li>span:first-child{color:#8b93a7;flex-shrink:0}',
    '.abt-state li>span:last-child{font-family:ui-monospace,Menlo,monospace;text-align:right;',
      'overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:60%}',
    '.abt-ok{color:#5ecf9a} .abt-warn{color:#f4c25a} .abt-err{color:#ff7a85} .abt-muted{color:#8b93a7}',
    '.abt-toggle{display:flex;align-items:center;gap:6px;font-size:11px;color:#8b93a7;margin:8px 0 10px;cursor:pointer}',
    '.abt-toggle input{accent-color:#7cc4ff}',
    '.abt-actions{display:grid;gap:6px;margin-bottom:12px}',
    '.abt-btn{width:100%;text-align:left;padding:9px 12px;background:#1f242f;color:#e7e9ee;',
      'border:1px solid #2a2f3a;border-radius:6px;font:inherit;cursor:pointer;display:flex;',
      'align-items:center;gap:8px;min-height:40px}',
    '.abt-btn:hover{border-color:#7cc4ff;background:#242a37}',
    '.abt-btn:focus-visible{outline:2px solid #7cc4ff;outline-offset:1px}',
    '.abt-btn:disabled{opacity:.5;cursor:not-allowed}',
    '.abt-btn.abt-primary{background:linear-gradient(180deg,#2d3648,#1f2635);border-color:#7cc4ff;color:#cfe6ff}',
    '.abt-btn.abt-danger{border-color:#4a2f36;color:#ffbac1}',
    '.abt-btn .abt-kbd{margin-left:auto;font-size:10px;color:#8b93a7;border:1px solid #2a2f3a;',
      'padding:1px 5px;border-radius:3px;font-family:ui-monospace,Menlo,monospace}',
    '.abt-log{background:#0f1117;border:1px solid #2a2f3a;border-radius:8px;padding:8px 10px;',
      'max-height:140px;overflow:auto;font-family:ui-monospace,Menlo,monospace;font-size:11px}',
    '.abt-log-line{padding:3px 0;border-bottom:1px dashed #20252f;display:flex;gap:8px;align-items:baseline}',
    '.abt-log-line:last-child{border:0}',
    '.abt-log-line time{color:#8b93a7;flex-shrink:0}',
    '.abt-log-line .abt-ico{flex-shrink:0;width:12px;text-align:center}',
    '.abt-log-line span.abt-msg{flex:1;word-break:break-word}',
    '.abt-footer{padding:8px 14px;background:#12161e;border-top:1px solid #2a2f3a;',
      'font-size:10px;color:#8b93a7;display:flex;justify-content:space-between;flex-shrink:0}',
    '@media (prefers-reduced-motion:reduce){.abt-panel,.abt-btn{transition:none}}',
    '@media (max-width:480px){.abt-panel{right:8px;bottom:8px;left:8px;width:auto}}'
  ].join('');

  // ── Estado ────────────────────────────────────────────────
  var state = {
    selectedIndex: 0,
    forms: [],
    allowRealSubmit: false,
    minimized: false,
    log: [],
    resumeAfterReload: null
  };

  // Recuperar estado persistido (para sobrevivir a reload)
  try {
    var saved = sessionStorage.getItem(SS_KEY);
    if (saved) {
      var parsed = JSON.parse(saved);
      state.allowRealSubmit = !!parsed.allowRealSubmit;
      state.minimized = !!parsed.minimized;
      state.log = Array.isArray(parsed.log) ? parsed.log.slice(-MAX_LOG) : [];
      state.resumeAfterReload = parsed.resumeAfterReload || null;
    }
  } catch (e) {}

  function persist() {
    try {
      sessionStorage.setItem(SS_KEY, JSON.stringify({
        allowRealSubmit: state.allowRealSubmit,
        minimized: state.minimized,
        log: state.log.slice(-MAX_LOG),
        resumeAfterReload: state.resumeAfterReload
      }));
    } catch (e) {}
  }

  // ── Detectar formularios con anti-bot ─────────────────────
  function scanForms() {
    var list = document.querySelectorAll('[data-honeypot-injected]');
    var out = [];
    for (var i = 0; i < list.length; i++) {
      var f = list[i];
      var fname = f.dataset.honeypotField || null;
      var input = fname ? f.querySelector('input[name="' + fname + '"]') : null;
      var isPopup = f.tagName !== 'FORM';
      var hidden = isPopup && offsetInvisible(f);
      var label = (isPopup ? 'Popup' : 'Form') + ' #' + (i + 1);
      if (fname) label += ' · hp=' + fname;
      if (hidden) label += ' (oculto)';
      out.push({
        el: f, fieldName: fname, input: input,
        isPopup: isPopup, hidden: hidden, label: label
      });
    }
    state.forms = out;
    if (state.selectedIndex >= out.length) state.selectedIndex = 0;
    return out;
  }

  function offsetInvisible(el) {
    return el.offsetParent === null && el.offsetWidth === 0 && el.offsetHeight === 0;
  }

  function currentTarget() {
    return state.forms[state.selectedIndex] || null;
  }

  // Estado del honeypot: usa __antiBotDebug si esta disponible;
  // si no, lee solo lo que el DOM expone.
  function readHoneypotState(target) {
    if (!target) return null;
    var dbg = window.__antiBotDebug;
    if (dbg && typeof dbg.getState === 'function') {
      var s = dbg.getState(target.el);
      if (s) return { fieldName: s.fieldName, value: s.value, wasTouched: s.wasTouched, guarded: s.guarded, source: 'debug' };
    }
    // Fallback sin debug API
    var val = target.input ? target.input.value : '';
    return {
      fieldName: target.fieldName,
      value: val,
      wasTouched: null,
      guarded: target.el.dataset.honeypotGuarded === '1',
      source: 'dom'
    };
  }

  // ── Log ───────────────────────────────────────────────────
  function log(type, msg) {
    var now = new Date();
    var hh = pad(now.getHours()), mm = pad(now.getMinutes()), ss = pad(now.getSeconds());
    state.log.push({ t: hh + ':' + mm + ':' + ss, type: type, msg: msg });
    if (state.log.length > MAX_LOG) state.log = state.log.slice(-MAX_LOG);
    persist();
    renderLog();
  }
  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  // ── Acciones ──────────────────────────────────────────────
  function actDetect() {
    scanForms();
    renderAll();
    var t = currentTarget();
    if (!t) {
      log('err', 'No se detect\u00f3 ning\u00fan formulario con anti-bot.');
      return;
    }
    log('ok', 'Honeypot detectado: ' + (t.fieldName || '(sin nombre)') + ' en ' + t.label);
  }

  function actFill() {
    var t = currentTarget();
    if (!t || !t.input) { log('err', 'No hay formulario objetivo.'); return; }
    var val = RANDOM_VALUES[Math.floor(Math.random() * RANDOM_VALUES.length)];
    setNativeValue(t.input, val);
    t.input.dispatchEvent(new Event('input', { bubbles: true }));
    t.input.dispatchEvent(new Event('change', { bubbles: true }));
    log('warn', 'Campo relleno con "' + val + '". wasTouched quedar\u00e1 true aunque lo limpies.');
    renderState();
  }

  function actClear() {
    var t = currentTarget();
    if (!t || !t.input) { log('err', 'No hay formulario objetivo.'); return; }
    setNativeValue(t.input, '');
    t.input.dispatchEvent(new Event('input', { bubbles: true }));
    var dbg = window.__antiBotDebug;
    if (dbg) {
      var stillTouched = (dbg.getState(t.el) || {}).wasTouched;
      if (stillTouched === true) {
        log('warn', 'Campo limpiado. wasTouched sigue true (dise\u00f1o): el form seguir\u00e1 bloqueado hasta recargar.');
      } else {
        log('ok', 'Campo limpiado.');
      }
    } else {
      log('warn', 'Campo limpiado. Sin debug API no se puede verificar wasTouched: recarga para garantizar un reset limpio.');
    }
    renderState();
  }

  // setear value eludiendo frameworks que escuchan set-accessor
  function setNativeValue(input, value) {
    var proto = Object.getPrototypeOf(input);
    var desc = Object.getOwnPropertyDescriptor(proto, 'value');
    if (desc && desc.set) desc.set.call(input, value);
    else input.value = value;
  }

  function actSubmit() {
    var t = currentTarget();
    if (!t) { log('err', 'No hay formulario objetivo.'); return; }
    var form = t.el;

    // Capturamos el estado ANTES del submit. Tras el submit, el campo puede
    // haberse limpiado o el DOM re-renderizado, y la evaluacion posterior
    // seria ambigua (especialmente sin debug API, donde wasTouched no es legible).
    var preHp = readHoneypotState(t);
    var preShouldBlock = preHp && (
      preHp.wasTouched === true ||
      (preHp.value && preHp.value.length > 0)
    );
    var hadDebug = preHp && preHp.source === 'debug';

    // Listener bubble para detectar si el submit sobrevivio al guard del anti-bot.
    // El anti-bot registra en capture=true y llama stopImmediatePropagation cuando
    // detecta bot: no llegaria aqui. Si llega, significa que el anti-bot lo permitio.
    var reached = false;
    var bubbleListener = function(e) {
      reached = true;
      if (!state.allowRealSubmit) {
        e.preventDefault();
      }
    };
    form.addEventListener('submit', bubbleListener, false);

    // Buscar un boton submit para clickearlo; si no, hacer requestSubmit/submit.
    var btn = form.querySelector('button[type="submit"], input[type="submit"], .hl_cta_btn, [data-form-submit], .btn-submit');
    if (!btn) btn = form.querySelector('button:not([type="button"]), a[role="button"]');

    log('muted', 'Intentando enviar (submit ' + (state.allowRealSubmit ? 'REAL' : 'simulado') + ')\u2026');

    try {
      if (btn) {
        btn.click();
      } else if (form.tagName === 'FORM') {
        if (typeof form.requestSubmit === 'function') form.requestSubmit();
        else form.submit();
      } else {
        log('warn', 'No hay bot\u00f3n submit identificable en este popup.');
      }
    } catch (err) {
      log('err', 'Error al intentar enviar: ' + (err && err.message));
    }

    // Dar un tick al navegador y evaluar contra el estado PRE-submit capturado.
    setTimeout(function() {
      form.removeEventListener('submit', bubbleListener, false);
      if (reached) {
        if (preShouldBlock) {
          log('err', 'FALLO: submit pas\u00f3 pese a tener el honeypot activado. \u00bfAnti-bot no est\u00e1 guardando este form?');
        } else {
          log('ok', 'Submit PERMITIDO (honeypot vac\u00edo \u2014 happy path correcto).');
        }
      } else {
        if (preShouldBlock) {
          log('ok', 'Submit BLOQUEADO por anti-bot (esperado con honeypot activado).');
        } else if (!hadDebug) {
          log('warn', 'Sin debug API no se puede distinguir "no se dispar\u00f3 submit" de "bloqueado por wasTouched". Activa data-antibot-debug para claridad.');
        } else {
          log('warn', 'No se detect\u00f3 submit. Puede que el bot\u00f3n no dispare submit nativo.');
        }
      }
      renderState();
    }, 120);
  }

  function actReload() {
    state.resumeAfterReload = Date.now();
    persist();
    log('muted', 'Recargando p\u00e1gina (reset de wasTouched)\u2026');
    setTimeout(function() { location.reload(); }, 200);
  }

  // ── Render ────────────────────────────────────────────────
  var root, selectEl, stateEl, logEl, allowToggle, minBtn, closeBtn;

  function build() {
    // Inyectar estilos una sola vez
    if (!document.getElementById('abt-style')) {
      var style = document.createElement('style');
      style.id = 'abt-style';
      style.textContent = CSS;
      document.head.appendChild(style);
    }

    root = document.createElement('aside');
    root.className = 'abt-panel' + (state.minimized ? ' abt-min' : '');
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-label', 'Tester anti-bot');
    root.setAttribute('aria-modal', 'false');

    root.innerHTML =
      '<header class="abt-head" data-drag>' +
        '<span class="abt-title">Tester anti-bot</span>' +
        '<div class="abt-head-btns">' +
          '<button class="abt-iconbtn" data-min aria-label="Minimizar" title="Minimizar">_</button>' +
          '<button class="abt-iconbtn" data-close aria-label="Cerrar (Esc)" title="Cerrar (Esc)">\u00d7</button>' +
        '</div>' +
      '</header>' +
      '<div class="abt-body">' +
        '<p class="abt-label">Formulario objetivo</p>' +
        '<select class="abt-select" aria-label="Seleccionar formulario objetivo" data-select></select>' +
        '<p class="abt-label">Estado actual</p>' +
        '<div class="abt-state" role="status" aria-live="polite" data-state></div>' +
        '<label class="abt-toggle"><input type="checkbox" data-allow> Permitir submit real (si no, solo simula)</label>' +
        '<p class="abt-label">Acciones</p>' +
        '<div class="abt-actions">' +
          '<button class="abt-btn" data-act="detect">\ud83d\udd0d Detectar campo anti-bot <span class="abt-kbd">D</span></button>' +
          '<button class="abt-btn" data-act="fill">\u270f\ufe0f Rellenar con dato random <span class="abt-kbd">R</span></button>' +
          '<button class="abt-btn" data-act="clear">\ud83e\uddf9 Limpiar campo <span class="abt-kbd">L</span></button>' +
          '<button class="abt-btn abt-primary" data-act="submit">\ud83d\udce4 Intentar enviar <span class="abt-kbd">Enter</span></button>' +
          '<button class="abt-btn abt-danger" data-act="reload">\ud83d\udd04 Recargar (reset wasTouched)</button>' +
        '</div>' +
        '<p class="abt-label">Historial</p>' +
        '<div class="abt-log" aria-live="polite" aria-atomic="false" data-log></div>' +
      '</div>' +
      '<footer class="abt-footer"><span>Esc cierra \u00b7 arrastra la cabecera</span><span>v0.1</span></footer>';

    document.body.appendChild(root);

    selectEl = root.querySelector('[data-select]');
    stateEl = root.querySelector('[data-state]');
    logEl = root.querySelector('[data-log]');
    allowToggle = root.querySelector('[data-allow]');
    minBtn = root.querySelector('[data-min]');
    closeBtn = root.querySelector('[data-close]');

    allowToggle.checked = state.allowRealSubmit;

    wireEvents();
    makeDraggable();

    scanForms();
    renderAll();

    // Si volvemos de un reload, el usuario probablemente querra probar el happy path
    if (state.resumeAfterReload) {
      var age = Date.now() - state.resumeAfterReload;
      state.resumeAfterReload = null;
      persist();
      if (age < 60000) {
        log('muted', 'P\u00e1gina recargada. Prueba "Intentar enviar" sin rellenar: deber\u00eda permitirlo.');
      }
    }
  }

  function wireEvents() {
    root.querySelectorAll('[data-act]').forEach(function(b) {
      b.addEventListener('click', function() {
        var a = b.getAttribute('data-act');
        if (a === 'detect') actDetect();
        else if (a === 'fill') actFill();
        else if (a === 'clear') actClear();
        else if (a === 'submit') actSubmit();
        else if (a === 'reload') actReload();
      });
    });
    selectEl.addEventListener('change', function() {
      state.selectedIndex = parseInt(selectEl.value, 10) || 0;
      renderState();
    });
    allowToggle.addEventListener('change', function() {
      state.allowRealSubmit = allowToggle.checked;
      persist();
      log(state.allowRealSubmit ? 'warn' : 'muted',
        state.allowRealSubmit ? 'Submit real ACTIVADO: los env\u00edos ir\u00e1n al endpoint real.'
                               : 'Submit real desactivado (solo simula).');
    });
    minBtn.addEventListener('click', toggleMin);
    closeBtn.addEventListener('click', close);

    document.addEventListener('keydown', onKey, true);

    // Re-scan cuando GHL abre popups o re-renderiza
    // Debounce mayor que el del anti-bot para que su inyeccion de honeypot
    // haya terminado antes de que volvamos a escanear.
    window.__abtObserver = new MutationObserver(debounce(function() {
      var prev = state.forms.length;
      scanForms();
      if (state.forms.length !== prev) {
        renderSelect();
      }
    }, 500));
    window.__abtObserver.observe(document.body, { childList: true, subtree: true });
  }

  function onKey(e) {
    if (!root || !document.body.contains(root)) return;
    if (e.key === 'Escape') { close(); e.preventDefault(); return; }

    // Nunca capturar atajos si el usuario esta editando en un campo,
    // ni siquiera dentro del panel (select abierto, etc).
    var active = document.activeElement;
    if (active) {
      var tag = active.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || active.isContentEditable) return;
    }
    // Solo activar atajos si el foco esta en el body o dentro del panel
    if (active && active !== document.body && !root.contains(active)) return;

    if (e.key === 'd' || e.key === 'D') { actDetect(); e.preventDefault(); }
    else if (e.key === 'r' || e.key === 'R') { actFill(); e.preventDefault(); }
    else if (e.key === 'l' || e.key === 'L') { actClear(); e.preventDefault(); }
  }

  function renderAll() {
    renderSelect();
    renderState();
    renderLog();
  }

  function renderSelect() {
    if (!selectEl) return;
    selectEl.innerHTML = '';
    if (state.forms.length === 0) {
      var opt = document.createElement('option');
      opt.textContent = '\u2014 Ning\u00fan formulario con anti-bot detectado \u2014';
      opt.value = '';
      selectEl.appendChild(opt);
      selectEl.disabled = true;
      return;
    }
    selectEl.disabled = false;
    for (var i = 0; i < state.forms.length; i++) {
      var o = document.createElement('option');
      o.value = String(i);
      o.textContent = state.forms[i].label;
      if (i === state.selectedIndex) o.selected = true;
      selectEl.appendChild(o);
    }
  }

  function renderState() {
    if (!stateEl) return;
    var t = currentTarget();
    var hp = readHoneypotState(t);
    var scriptOk = !!document.querySelector('[data-honeypot-injected]');
    var dbg = !!window.__antiBotDebug;
    var rows = [];

    rows.push(row('Script anti-bot', scriptOk
      ? '<span class="abt-ok">\u2713 detectado</span>'
      : '<span class="abt-err">\u2717 no detectado</span>'));
    rows.push(row('Modo debug', dbg
      ? '<span class="abt-ok">\u2713 activo (' + (dbg && window.__antiBotDebug.version) + ')</span>'
      : '<span class="abt-muted">off (no ves wasTouched)</span>'));

    if (!hp) {
      rows.push(row('Campo honeypot', '<span class="abt-muted">\u2014</span>'));
    } else {
      rows.push(row('Campo honeypot', esc(hp.fieldName || '(sin nombre)')));
      rows.push(row('Valor actual', hp.value
        ? '<span class="abt-warn">"' + esc(truncate(hp.value, 24)) + '"</span>'
        : '<span class="abt-muted">""</span>'));
      if (hp.wasTouched === true) {
        rows.push(row('wasTouched', '<span class="abt-err">true (form bloqueado)</span>'));
      } else if (hp.wasTouched === false) {
        rows.push(row('wasTouched', '<span class="abt-ok">false</span>'));
      } else {
        rows.push(row('wasTouched', '<span class="abt-muted">desconocido</span>'));
      }
      rows.push(row('Guard submit', hp.guarded
        ? '<span class="abt-ok">\u2713 activo</span>'
        : '<span class="abt-warn">no activo</span>'));
    }
    stateEl.innerHTML = '<ul>' + rows.join('') + '</ul>';
  }

  function row(k, v) {
    return '<li><span>' + esc(k) + '</span><span>' + v + '</span></li>';
  }

  function renderLog() {
    if (!logEl) return;
    if (state.log.length === 0) {
      logEl.innerHTML = '<div class="abt-log-line"><span class="abt-muted">Sin acciones todav\u00eda.</span></div>';
      return;
    }
    var html = '';
    var recent = state.log.slice(-MAX_LOG);
    for (var i = recent.length - 1; i >= 0; i--) {
      var e = recent[i];
      var ico = e.type === 'ok' ? '<span class="abt-ico abt-ok">\u2713</span>'
              : e.type === 'err' ? '<span class="abt-ico abt-err">\u2717</span>'
              : e.type === 'warn' ? '<span class="abt-ico abt-warn">\u26a0</span>'
              : '<span class="abt-ico abt-muted">\u00b7</span>';
      html += '<div class="abt-log-line"><time>' + esc(e.t) + '</time>' + ico +
              '<span class="abt-msg">' + esc(e.msg) + '</span></div>';
    }
    logEl.innerHTML = html;
  }

  // ── Arrastre ──────────────────────────────────────────────
  function makeDraggable() {
    var head = root.querySelector('[data-drag]');
    var dragging = false, startX = 0, startY = 0, startRect = null;
    head.addEventListener('mousedown', function(e) {
      if (e.target.closest('button')) return;
      dragging = true;
      startX = e.clientX; startY = e.clientY;
      startRect = root.getBoundingClientRect();
      e.preventDefault();
    });
    document.addEventListener('mousemove', function(e) {
      if (!dragging) return;
      var nx = startRect.left + (e.clientX - startX);
      var ny = startRect.top + (e.clientY - startY);
      nx = Math.max(4, Math.min(window.innerWidth - 40, nx));
      ny = Math.max(4, Math.min(window.innerHeight - 40, ny));
      root.style.left = nx + 'px';
      root.style.top = ny + 'px';
      root.style.right = 'auto';
      root.style.bottom = 'auto';
    });
    document.addEventListener('mouseup', function() { dragging = false; });
  }

  function toggleMin() {
    state.minimized = !state.minimized;
    root.classList.toggle('abt-min', state.minimized);
    persist();
  }

  function close() {
    document.removeEventListener('keydown', onKey, true);
    if (window.__abtObserver) { window.__abtObserver.disconnect(); window.__abtObserver = null; }
    if (root && root.parentNode) root.parentNode.removeChild(root);
    root = null;
  }

  function open() {
    if (root && document.body.contains(root)) return;
    build();
  }

  // ── Utilidades ────────────────────────────────────────────
  function esc(s) {
    if (s == null) return '';
    return String(s).replace(/[&<>"']/g, function(c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function truncate(s, n) { return s.length > n ? s.slice(0, n - 1) + '\u2026' : s; }
  function debounce(fn, ms) {
    var tid;
    return function() {
      clearTimeout(tid);
      tid = setTimeout(fn, ms);
    };
  }

  // ── Inicializar ───────────────────────────────────────────
  window.__abtTester = { open: open, close: close };
  build();
})();
