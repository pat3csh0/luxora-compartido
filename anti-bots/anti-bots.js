/*
  Anti-bots Honeypot para Luxora / GoHighLevel
  ─────────────────────────────────────────────
  Protege formularios contra bots de spam inyectando un campo
  invisible (honeypot) que los humanos no ven y no rellenan,
  pero los bots rellenan automaticamente.

  Si el campo honeypot tiene valor al enviar, el script cancela
  el envio silenciosamente. GHL no recibe nada, no se crea
  contacto, no se dispara ningun workflow.

  NO afecta a usuarios reales. Es fisicamente imposible que un
  humano rellene un campo invisible.

  Vanilla JS, sin dependencias.

  v1.1 — 2026-04-13 · JLM
    + Honeypot con geometria visible pero clip-eado por ancestro: derrota
      bots que chequean visibilidad via getBoundingClientRect/offsetParent.
    + Check de interaccion humana: bloquea submits sin ningun evento
      pointerdown/touchstart/keydown/mousemove/focusin previo.
    + Grace period de 50ms tras bloqueo por falta de interaccion para
      cubrir race conditions con autofill/focus automatico.
*/
(function() {
  // ── Configuracion del honeypot ────────────────────────────
  // Nombres que parecen campos reales para enganar bots avanzados.
  // Se rota aleatoriamente para que los bots que hacen blacklist
  // de nombres de campo no puedan excluirlos.
  // WeakMap para almacenar las refs del honeypot fuera del DOM
  // (evita DOM clobbering — un atacante no puede sobreescribir esto
  // inyectando un elemento con name="_honeypotInput")
  var honeypotRefs = new WeakMap();

  var fieldNames = ['website', 'url', 'company_url', 'homepage', 'site_url'];

  // ── Tracker de interaccion humana ─────────────────────────
  // Se activa con el primer evento de interaccion real. Un usuario que
  // hace CUALQUIER cosa antes de enviar (tocar pantalla, mover raton,
  // pulsar una tecla, que el navegador haga focus autofill) dispara uno
  // de estos eventos. Un bot que hace form.submit() o dispatchEvent sin
  // simular interaccion no los dispara.
  var sawInteraction = false;
  var interactionEvents = ['pointerdown', 'touchstart', 'keydown', 'mousemove', 'focusin'];
  interactionEvents.forEach(function(ev) {
    document.addEventListener(ev, function() { sawInteraction = true; },
      { once: true, capture: true, passive: true });
  });

  // ── Inyectar el honeypot ──────────────────────────────────
  function injectHoneypot(form) {
    if (form.dataset.honeypotInjected) return;
    form.dataset.honeypotInjected = '1';

    // Nombre aleatorio POR FORM (no global) para que un bot que
    // aprende el nombre de un form no pueda reutilizarlo en otro
    var thisFieldName = fieldNames[Math.floor(Math.random() * fieldNames.length)];

    var wrapper = document.createElement('div');
    // Tecnicas anti-deteccion v1.1: el wrapper tiene height:0 y overflow:hidden
    // para CLIP-ear al hijo, pero el INPUT tiene geometria real (200x40).
    // Asi, bots que chequean visibilidad via getBoundingClientRect/offsetParent
    // reciben dimensiones no-cero y creen que el campo es visible → lo rellenan
    // → caen al honeypot. Humanos no lo ven porque el ancestro lo clip-ea.
    // NO usamos display:none (trivial de detectar), ni left:-9999px (bots
    // sofisticados chequean offset tambien).
    wrapper.setAttribute('aria-hidden', 'true');
    wrapper.style.cssText = [
      'position:relative',
      'height:0',
      'overflow:hidden',
      'margin:0',
      'padding:0'
    ].join(';');

    var input = document.createElement('input');
    input.type = 'text';
    input.name = thisFieldName;
    input.id = 'hp_' + thisFieldName;
    input.tabIndex = -1;       // no accesible por tab
    input.autocomplete = 'off'; // no autocompletar
    input.setAttribute('aria-hidden', 'true');
    // Input con geometria real: bot ve rect 200x40. Humano no lo ve porque
    // el wrapper lo clip-ea (height:0 + overflow:hidden).
    input.style.cssText = [
      'position:absolute',
      'top:0',
      'left:0',
      'width:200px',
      'height:40px',
      'pointer-events:none'
    ].join(';');

    wrapper.appendChild(input);

    // Insertar al principio del form (no al final, para que bots
    // que rellenan en orden lo encuentren antes)
    form.insertBefore(wrapper, form.firstChild);

    // ── Congelar: detectar si el honeypot fue tocado ─────────
    // Un bot avanzado podria rellenar el honeypot y luego limpiarlo
    // justo antes del submit. Este flag se activa en cuanto el campo
    // recibe cualquier input y ya no se puede desactivar.
    var wasTouched = false;
    input.addEventListener('input', function() { wasTouched = true; });
    input.addEventListener('change', function() { wasTouched = true; });

    // ── Guardar referencia en WeakMap (evita DOM clobbering) ──
    honeypotRefs.set(form, { input: input, touched: function() { return wasTouched; } });
    // Tambien guardar el nombre para re-buscar en multi-step forms
    // donde GHL puede re-crear el DOM y la ref del WeakMap queda stale
    form.dataset.honeypotField = thisFieldName;

    // ── Sobreescribir form.submit() para que bots que llaman
    //    HTMLFormElement.prototype.submit.call(form) directamente
    //    (sin disparar el evento submit) tambien sean bloqueados.
    //    Solo aplica a <form> reales (los popups de GHL son divs y no tienen .submit())
    if (typeof form.submit === 'function') {
      var origSubmit = form.submit.bind(form);
      form.submit = function() {
        if (isBotDetected(form)) return;
        if (!sawInteraction) return; // bot con form.submit() programatico
        origSubmit();
      };
    }
  }

  // ── Obtener honeypot de forma robusta ──────────────────────
  // WeakMap como primera opcion; si la ref es stale (multi-step
  // re-crea el DOM), buscar por nombre de campo en el form.
  // Devuelve { input, touched() } o null.
  function getHoneypot(form) {
    var ref = honeypotRefs.get(form);
    if (ref && ref.input && ref.input.parentNode) return ref;
    // Fallback por DOM query (multi-step: ref stale)
    var fname = form.dataset.honeypotField;
    if (fname) {
      var el = form.querySelector('input[name="' + fname + '"]');
      if (el) return { input: el, touched: function() { return el.value.length > 0; } };
    }
    return null;
  }

  // Comprobar si el honeypot fue activado por un bot.
  // Doble check: valor actual del campo O flag "touched" que se
  // activo cuando el campo recibio input (un bot que limpia el
  // valor antes del submit sigue siendo detectado por el flag).
  function isBotDetected(form) {
    var hp = getHoneypot(form);
    if (!hp) return false;
    return (hp.input.value && hp.input.value.length > 0) || hp.touched();
  }

  // ── Interceptar el submit ─────────────────────────────────
  // Llamable varias veces por form: la primera registra el submit listener;
  // las siguientes solo cubren botones nuevos que GHL pueda renderizar
  // despues del scan inicial (lazy render del builder).
  function guardForm(form) {
    if (form.dataset.honeypotGuarded) {
      // Form ya guardado a nivel submit, pero pueden haber aparecido
      // botones nuevos. Re-escanear solo para clicks.
      guardButtons(form);
      return;
    }
    form.dataset.honeypotGuarded = '1';

    // useCapture=true para ejecutarse ANTES que cualquier otro listener
    form.addEventListener('submit', function(e) {
      // Check 1: honeypot activado (bot que rellena todo)
      if (isBotDetected(form)) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return false;
      }
      // Check 2: falta de interaccion humana (bot que hace form.submit()
      // programatico sin simular pointer/touch/keyboard)
      if (!sawInteraction) {
        e.preventDefault();
        e.stopImmediatePropagation();
        // Grace period para cubrir race con autofill/focus automatico:
        // si en 50ms aparece interaccion real, re-disparar el submit.
        // Si no, queda bloqueado silenciosamente.
        setTimeout(function() {
          if (sawInteraction) {
            // Usar requestSubmit si existe (dispara submit event, pasa por
            // nuestro guard con sawInteraction ya true → permite). Si no,
            // usar el prototype nativo para evitar nuestro override (que
            // tambien chequea sawInteraction y podria bloquear en un race).
            if (typeof form.requestSubmit === 'function') {
              try { form.requestSubmit(); } catch (err) { /* noop */ }
            } else if (typeof form.submit === 'function' &&
                       typeof HTMLFormElement !== 'undefined' &&
                       HTMLFormElement.prototype.submit) {
              try { HTMLFormElement.prototype.submit.call(form); }
              catch (err) { /* noop */ }
            }
          }
        }, 50);
        return false;
      }
    }, true);

    guardButtons(form);
  }

  // Escanear y atacar click listeners a los botones de submit del form.
  // Extraido para poder re-llamarse cuando GHL renderiza botones nuevos.
  function guardButtons(form) {
    // GHL usa varios patrones: <button type="submit">, <button> sin type,
    // <a> con clase submit, o simplemente el ultimo boton del contenedor.
    var btns = form.querySelectorAll('button[type="submit"], input[type="submit"], button:not([type]), button:not([type="button"]), .btn-submit, a.btn-submit, [data-form-submit], .hl_cta_btn');
    // Si no encontro botones con los selectores anteriores, buscar cualquier boton
    if (btns.length === 0) btns = form.querySelectorAll('button, a[role="button"]');
    for (var i = 0; i < btns.length; i++) {
      (function(btn) {
        if (btn.dataset.honeypotBtn) return;
        btn.dataset.honeypotBtn = '1';
        btn.addEventListener('click', function(e) {
          // Check honeypot
          if (isBotDetected(form)) {
            e.preventDefault();
            e.stopImmediatePropagation();
            return false;
          }
          // Check interaccion: un click humano real SIEMPRE viene precedido
          // de pointerdown/touchstart/keydown. Si sawInteraction es false
          // aqui, es un click sintetico (button.click() programatico de un
          // bot que no simulo eventos de pointer). Sin grace period.
          if (!sawInteraction) {
            e.preventDefault();
            e.stopImmediatePropagation();
            return false;
          }
        }, true);
      })(btns[i]);
    }
  }

  // ── Escanear formularios ──────────────────────────────────
  // GHL usa dos patrones distintos:
  // 1. Formularios nativos en landings: usan <form> tag
  // 2. Formularios popup: usan divs con clase hl_main_popup, SIN <form> tag
  // El script debe cubrir ambos casos.
  function scan() {
    // Patron 1: <form> tags estandar
    var forms = document.querySelectorAll('form');
    for (var i = 0; i < forms.length; i++) {
      injectHoneypot(forms[i]);
      guardForm(forms[i]);
      (function(f) { setTimeout(function() { guardForm(f); }, 300); })(forms[i]);
    }

    // Patron 2: contenedores de GHL sin <form>
    // GHL usa al menos 3 patrones distintos sin tag <form>:
    //   - Popups: div.hl_main_popup / div.popup-body
    //   - Forms inline del builder: div.ghl-form-wrap / div[id="_builder-form"]
    //   - Otros wrappers: div.form-builder--wrap
    var popups = document.querySelectorAll('.hl_main_popup, [class*="popup-body"], .ghl-form-wrap, [id="_builder-form"], .form-builder--wrap');
    for (var i = 0; i < popups.length; i++) {
      var popup = popups[i];
      // Solo actuar si tiene inputs (es un formulario) y no tiene <form> hijo
      var hasInputs = popup.querySelector('input[type="email"], input[type="tel"], input[type="text"]');
      var hasForm = popup.querySelector('form');
      if (hasInputs && !hasForm) {
        // Tratar el popup como si fuera un <form>
        injectHoneypot(popup);
        guardForm(popup);
        (function(p) { setTimeout(function() { guardForm(p); }, 300); })(popup);
      }
    }
  }

  // Escanear ahora + cada vez que GHL re-renderice
  scan();
  new MutationObserver(scan).observe(document.body, {childList: true, subtree: true});
})();
