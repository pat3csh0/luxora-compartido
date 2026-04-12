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

  v1.0 — 2026-04-12 · JLM
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
  var fieldName = fieldNames[Math.floor(Math.random() * fieldNames.length)];

  // ── Inyectar el honeypot ──────────────────────────────────
  function injectHoneypot(form) {
    if (form.dataset.honeypotInjected) return;
    form.dataset.honeypotInjected = '1';

    // Crear un wrapper que parece un campo de formulario normal
    // para enganar bots que inspeccionan el DOM.
    var wrapper = document.createElement('div');
    // Tecnicas anti-deteccion: NO usar display:none (bots lo detectan).
    // En su lugar, combinar overflow, height, opacity y position para
    // hacerlo invisible a humanos pero presente en el DOM.
    wrapper.setAttribute('aria-hidden', 'true');
    wrapper.style.cssText = [
      'position:absolute',
      'left:-9999px',
      'top:-9999px',
      'width:0',
      'height:0',
      'overflow:hidden',
      'opacity:0',
      'z-index:-1',
      'pointer-events:none'
    ].join(';');

    var input = document.createElement('input');
    input.type = 'text';
    input.name = fieldName;
    input.id = 'hp_' + fieldName;
    input.tabIndex = -1;       // no accesible por tab
    input.autocomplete = 'off'; // no autocompletar

    wrapper.appendChild(input);

    // Insertar al principio del form (no al final, para que bots
    // que rellenan en orden lo encuentren antes)
    form.insertBefore(wrapper, form.firstChild);

    // ── Guardar referencia en WeakMap (evita DOM clobbering) ──
    honeypotRefs.set(form, input);

    // ── Sobreescribir form.submit() para que bots que llaman
    //    HTMLFormElement.prototype.submit.call(form) directamente
    //    (sin disparar el evento submit) tambien sean bloqueados ──
    var origSubmit = form.submit.bind(form);
    form.submit = function() {
      var hp = honeypotRefs.get(form);
      if (hp && hp.value && hp.value.length > 0) return; // bot
      origSubmit();
    };
  }

  // ── Interceptar el submit ─────────────────────────────────
  function guardForm(form) {
    if (form.dataset.honeypotGuarded) return;
    form.dataset.honeypotGuarded = '1';

    // useCapture=true para ejecutarse ANTES que cualquier otro listener
    form.addEventListener('submit', function(e) {
      var hp = honeypotRefs.get(form);
      if (hp && hp.value && hp.value.length > 0) {
        // Bot detectado: el campo honeypot tiene valor
        e.preventDefault();
        e.stopImmediatePropagation();
        // No dar feedback visual — el bot no debe saber que fue detectado
        return false;
      }
      // Humano: el campo esta vacio, dejar pasar el submit
    }, true);

    // Tambien escuchar click en botones de submit (GHL a veces
    // usa botones que no disparan el evento submit del form)
    var btns = form.querySelectorAll('button[type="submit"], input[type="submit"], button:not([type])');
    for (var i = 0; i < btns.length; i++) {
      (function(btn) {
        if (btn.dataset.honeypotBtn) return;
        btn.dataset.honeypotBtn = '1';
        btn.addEventListener('click', function(e) {
          var hp = honeypotRefs.get(form);
          if (hp && hp.value && hp.value.length > 0) {
            e.preventDefault();
            e.stopImmediatePropagation();
            return false;
          }
        }, true);
      })(btns[i]);
    }
  }

  // ── Escanear formularios ──────────────────────────────────
  function scan() {
    var forms = document.querySelectorAll('form');
    for (var i = 0; i < forms.length; i++) {
      injectHoneypot(forms[i]);
      guardForm(forms[i]);
    }
  }

  // Escanear ahora + cada vez que GHL re-renderice
  scan();
  new MutationObserver(scan).observe(document.body, {childList: true, subtree: true});
})();
