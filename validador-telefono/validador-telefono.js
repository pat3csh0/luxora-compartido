/*
  Validador de telefono para Luxora / GoHighLevel
  ────────────────────────────────────────────────
  Limpia y valida numeros de telefono en formularios de GHL/Luxora.
  Funciona con o sin el selector de paises (intl-tel-input).

  Dos capas de proteccion:
  1. Limpieza silenciosa: quita espacios, guiones, parentesis, puntos.
     Normaliza formatos arcaicos (0034 → +34, 34xxx → +34xxx).
  2. Aviso amigable: si el numero tiene digitos de mas/menos o un
     formato irreconocible, muestra un aviso bajo el campo.
     NO bloquea el envio.

  Vanilla JS, sin dependencias.

  v1.0 — 2026-04-12 · JLM
*/
(function() {
  // ── Reglas de validacion por pais ─────────────────────────
  // Cada entrada: [prefijo, longitud del numero SIN prefijo, nombre]
  // Solo validamos la longitud si conocemos el pais.
  var COUNTRY_RULES = {
    '34':  { len: 9, name: 'Espana', mobileStart: /^[67]/, landlineStart: /^[89]/ },
    '33':  { len: 9, name: 'Francia' },
    '39':  { len: [9,10], name: 'Italia' },
    '49':  { len: [10,11], name: 'Alemania' },
    '44':  { len: 10, name: 'Reino Unido' },
    '351': { len: 9, name: 'Portugal' },
    '31':  { len: 9, name: 'Paises Bajos' },
    '32':  { len: 9, name: 'Belgica' },
    '41':  { len: 9, name: 'Suiza' },
    '43':  { len: [10,11], name: 'Austria' },
    '1':   { len: 10, name: 'EEUU/Canada' },
    '52':  { len: 10, name: 'Mexico' },
    '54':  { len: [10,11], name: 'Argentina' },
    '55':  { len: [10,11], name: 'Brasil' },
    '56':  { len: 9, name: 'Chile' },
    '57':  { len: 10, name: 'Colombia' },
    '51':  { len: 9, name: 'Peru' },
    '593': { len: [9,10], name: 'Ecuador' },
    '58':  { len: 10, name: 'Venezuela' },
    '598': { len: 8, name: 'Uruguay' },
    '595': { len: 9, name: 'Paraguay' },
    '591': { len: 8, name: 'Bolivia' },
    '376': { len: [6,9], name: 'Andorra' },
    '350': { len: 8, name: 'Gibraltar' },
    '212': { len: 9, name: 'Marruecos' },
    '40':  { len: 9, name: 'Rumania' },
    '48':  { len: 9, name: 'Polonia' },
    '380': { len: 9, name: 'Ucrania' },
    '7':   { len: 10, name: 'Rusia' }
  };

  // Prefijos ordenados de mayor a menor longitud (para matching greedy)
  // Ordenados de mayor a menor longitud para matching greedy:
  // Si no, prefijo '1' (EEUU) matchearia antes que '351' (Portugal)
  var PREFIXES = Object.keys(COUNTRY_RULES).sort(function(a,b) { return b.length - a.length; });

  // ── Limpieza de formato ───────────────────────────────────
  function cleanPhone(value) {
    if (!value) return '';
    var s = value.trim();
    // Quitar todo excepto digitos y el primer +
    var hasPlus = s.charAt(0) === '+';
    s = s.replace(/[^\d]/g, '');
    // Normalizar 00XX al principio → +XX
    // Prefijo internacional europeo: 0034 → +34 (comun en lineas fijas espanolas)
    if (s.substring(0, 2) === '00') {
      s = s.substring(2);
      hasPlus = true;
    }
    if (hasPlus) s = '+' + s;
    return s;
  }

  // ── Detectar prefijo de pais ──────────────────────────────
  function detectCountry(cleaned) {
    // Si tiene +, buscar prefijo
    if (cleaned.charAt(0) === '+') {
      var digits = cleaned.substring(1);
      for (var i = 0; i < PREFIXES.length; i++) {
        if (digits.substring(0, PREFIXES[i].length) === PREFIXES[i]) {
          var national = digits.substring(PREFIXES[i].length);
          return { prefix: PREFIXES[i], national: national, rule: COUNTRY_RULES[PREFIXES[i]] };
        }
      }
      // Tiene + pero prefijo desconocido — internacional no validable
      return { prefix: digits.substring(0, 3), national: digits.substring(3), rule: null };
    }
    return null; // Sin prefijo
  }

  // ── Validar numero ────────────────────────────────────────
  function validatePhone(value) {
    var cleaned = cleanPhone(value);
    if (!cleaned) return { cleaned: '', error: null };

    var onlyDigits = cleaned.replace(/\+/g, '');

    // Demasiado corto para ser un numero real
    if (onlyDigits.length < 6) {
      return { cleaned: cleaned, error: 'Este numero parece demasiado corto' };
    }

    // Demasiado largo para cualquier numero del mundo
    // ITU-T E.164: maximo 15 digitos en un numero internacional
    if (onlyDigits.length > 15) {
      return { cleaned: cleaned, error: 'Este numero tiene demasiados digitos' };
    }

    // ── Con prefijo internacional ────────────────────────────
    var country = detectCountry(cleaned);
    if (country) {
      if (country.rule) {
        var expectedLen = country.rule.len;
        var natLen = country.national.length;
        var validLen = false;

        if (Array.isArray(expectedLen)) {
          for (var i = 0; i < expectedLen.length; i++) {
            if (natLen === expectedLen[i]) { validLen = true; break; }
          }
        } else {
          validLen = (natLen === expectedLen);
        }

        if (!validLen) {
          var expected = Array.isArray(expectedLen) ? expectedLen.join(' o ') : expectedLen;
          if (natLen < (Array.isArray(expectedLen) ? expectedLen[0] : expectedLen)) {
            return { cleaned: cleaned, error: 'Parece que faltan digitos (se esperan ' + expected + ' para ' + country.rule.name + ')' };
          } else {
            return { cleaned: cleaned, error: 'Este numero tiene digitos de mas (se esperan ' + expected + ' para ' + country.rule.name + ')' };
          }
        }
      }
      // Prefijo valido + longitud correcta (o desconocida) → OK
      return { cleaned: cleaned, error: null };
    }

    // ── Sin prefijo — asumir espanol ────────────────────────
    // 9 digitos que empiezan por 6, 7, 8 o 9
    if (onlyDigits.length === 9 && /^[6789]/.test(onlyDigits)) {
      return { cleaned: cleaned, error: null };
    }

    // Tiene pinta de espanol con el 34 pegado sin +
    if (onlyDigits.length === 11 && onlyDigits.substring(0, 2) === '34') {
      return { cleaned: '+' + onlyDigits, error: null };
    }

    // 9 digitos pero empieza por cifra inusual
    if (onlyDigits.length === 9 && /^[12345]/.test(onlyDigits)) {
      return { cleaned: cleaned, error: 'Este numero no parece un movil o fijo espanol' };
    }

    // Longitud incorrecta sin prefijo
    if (onlyDigits.length < 9) {
      return { cleaned: cleaned, error: 'Parece que faltan digitos' };
    }
    if (onlyDigits.length > 9 && onlyDigits.length < 11) {
      return { cleaned: cleaned, error: 'Este numero tiene un formato inusual' };
    }
    if (onlyDigits.length >= 11 && !cleaned.startsWith('+')) {
      return { cleaned: cleaned, error: 'Si es un numero internacional, anade + al principio' };
    }

    return { cleaned: cleaned, error: null };
  }

  // ── UI: enganchar al campo de telefono ────────────────────
  function attach(input) {
    if (input.dataset.phonecheck) return;
    input.dataset.phonecheck = '1';

    // Detectar si intl-tel-input esta activo (GHL country selector)
    var hasIntlTelInput = function() {
      return input.closest('.iti') !== null || input.classList.contains('iti__tel-input');
    };

    var hint = document.createElement('div');
    hint.style.cssText = 'font-size:13px;margin-top:6px;color:#b45309;display:none;line-height:1.35;font-family:inherit';

    // Insertar hint despues del wrapper de intl-tel-input si existe, o despues del input
    var insertAfter = hasIntlTelInput() ? input.closest('.iti') || input : input;
    insertAfter.insertAdjacentElement('afterend', hint);

    var validate = function() {
      var result = validatePhone(input.value);

      // Limpiar formato silenciosamente (espacios, guiones, etc.)
      // Solo si NO hay intl-tel-input activo (que tiene su propia limpieza)
      if (!hasIntlTelInput() && result.cleaned && result.cleaned !== input.value.trim()) {
        input.value = result.cleaned;
        input.dispatchEvent(new Event('input', {bubbles:true}));
      }

      // Mostrar/ocultar aviso
      if (result.error) {
        hint.textContent = result.error;
        hint.style.display = 'block';
      } else {
        hint.style.display = 'none';
      }
    };

    input.addEventListener('blur', validate);
    input.addEventListener('change', validate);
  }

  // ── Escanear campos de telefono ───────────────────────────
  function scan() {
    // Selectores para campos de telefono en GHL
    var selectors = [
      'input[type="tel"]',
      'input[name*="phone" i]',
      'input[name*="telefono" i]',
      'input[name*="tel" i]',
      'input[name*="movil" i]',
      'input[name*="mobile" i]',
      'input[placeholder*="telefono" i]',
      'input[placeholder*="phone" i]'
    ];
    var inputs = document.querySelectorAll(selectors.join(','));
    for (var i = 0; i < inputs.length; i++) {
      attach(inputs[i]);
    }
  }

  scan();
  new MutationObserver(scan).observe(document.body, {childList: true, subtree: true});
})();
