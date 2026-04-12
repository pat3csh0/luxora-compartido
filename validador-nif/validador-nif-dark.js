/*
  Validador de NIF/CIF/NIE (DARK) para Luxora / GoHighLevel
  ───────────────────────────────────────────────────
  Valida documentos de identidad espanoles en formularios de
  GHL/Luxora. Detecta automaticamente el campo por el texto
  de su label (nif, dni, cif, nie, documento, etc.).

  Dos funciones:
  1. Limpieza silenciosa: quita espacios, guiones, puntos.
     Convierte a mayusculas. (12.345.678-a → 12345678A)
  2. Aviso generico si el formato no es correcto:
     "Revisa tu DNI/NIF — el formato no parece correcto"
     NO sugiere la letra correcta. NO bloquea el envio.

  Tipos soportados:
  - DNI/NIF: 8 digitos + letra (validacion letra de control mod 23)
  - NIE: X/Y/Z + 7 digitos + letra (conversion X=0, Y=1, Z=2 + mod 23)
  - CIF: letra + 7 digitos + control (validacion digito/letra de control)

  Vanilla JS, sin dependencias.

  v1.0 — 2026-04-12 · JLM
*/
(function() {
  // ── Tabla de letras de control para DNI/NIE ───────────────
  // Secuencia de 23 letras definida por el Ministerio del Interior.
  // Indice = numero % 23. Ej: 12345678 % 23 = 14 → 'Z'
  var DNI_LETTERS = 'TRWAGMYFPDXBNJZSQVHLCKE';

  // ── Letras iniciales de CIF y tipo de control ─────────────
  // Segun BOE n.49 (26 feb 2008, articulo 2):
  // 'D' = control DEBE ser digito
  // 'L' = control DEBE ser letra
  // No listado = acepta ambos
  var CIF_MUST_DIGIT  = /^[ABCDEFGHJUV]$/;   // Sociedades + UTE + Fondos
  var CIF_MUST_LETTER = /^[PQSNWR]$/;         // Entidades publicas + extranjeras
  var CIF_CONTROL_LETTERS = 'JABCDEFGHI';

  // ── Limpieza ──────────────────────────────────────────────
  function cleanNif(value) {
    if (!value) return '';
    return value
      .replace(/[\s.\-\/\\]/g, '')  // quitar espacios, puntos, guiones, barras
      .toUpperCase()
      .trim();
  }

  // ── Validar DNI/NIF (8 digitos + letra, o K/L/M + 7 digitos + letra) ─
  function validateDNI(cleaned) {
    // DNI estandar: 8 digitos + letra
    // NIF temporal: K/L/M + 7 digitos + letra (se valida igual reemplazando K/L/M por 0)
    // DNI corto: 1-7 digitos + letra (se rellena con ceros a la izquierda)
    var match = cleaned.match(/^([KLM]?\d{1,8})([A-Z])$/);
    if (!match) return null;
    var numStr = match[1];
    var letter = match[2];
    // Reemplazar K/L/M por 0 (NIF temporal)
    numStr = numStr.replace(/^[KLM]/, '0');
    // Left-pad a 8 digitos
    while (numStr.length < 8) numStr = '0' + numStr;
    if (numStr.length !== 8) return null;
    var number = parseInt(numStr, 10);
    var expected = DNI_LETTERS.charAt(number % 23);
    return { type: 'DNI', valid: letter === expected };
  }

  // ── Validar NIE (X/Y/Z + 7 digitos + letra) ──────────────
  function validateNIE(cleaned) {
    var match = cleaned.match(/^([XYZ])(\d{7})([A-Z])$/);
    if (!match) return null; // no es formato NIE
    var prefix = match[1];
    var digits = match[2];
    var letter = match[3];
    // Convertir X=0, Y=1, Z=2
    var prefixNum = prefix === 'X' ? '0' : prefix === 'Y' ? '1' : '2';
    var number = parseInt(prefixNum + digits, 10);
    var expected = DNI_LETTERS.charAt(number % 23);
    return { type: 'NIE', valid: letter === expected };
  }

  // ── Validar CIF (letra + 7 digitos + control) ─────────────
  // Algoritmo segun BOE n.49 (26 feb 2008):
  // - Posiciones impares (0,2,4,6): multiplicar por 2, sumar digitos
  // - Posiciones pares (1,3,5): sumar directamente
  // - Control = (10 - total % 10) % 10
  function validateCIF(cleaned) {
    var match = cleaned.match(/^([ABCDEFGHJNPQRSUVW])(\d{7})([0-9A-J])$/);
    if (!match) return null;
    var tipo = match[1];
    var digits = match[2];
    var control = match[3];

    var evenSum = 0; // pares (indices 1,3,5)
    var oddSum = 0;  // impares (indices 0,2,4,6)
    for (var i = 0; i < 7; i++) {
      var d = parseInt(digits.charAt(i), 10);
      if (i % 2 === 0) {
        // Posicion impar: multiplicar por 2, sumar digitos del resultado
        var doubled = d * 2;
        oddSum += Math.floor(doubled / 10) + (doubled % 10);
      } else {
        // Posicion par: sumar directamente
        evenSum += d;
      }
    }
    var total = evenSum + oddSum;
    // El % 10 exterior maneja el caso total%10===0 (que daria 10, fuera de rango)
    var controlDigit = (10 - (total % 10)) % 10;
    var controlLetter = CIF_CONTROL_LETTERS.charAt(controlDigit);

    var valid = false;
    if (CIF_MUST_LETTER.test(tipo)) {
      valid = control === controlLetter;
    } else if (CIF_MUST_DIGIT.test(tipo)) {
      valid = control === String(controlDigit);
    } else {
      valid = control === String(controlDigit) || control === controlLetter;
    }

    return { type: 'CIF', valid: valid };
  }

  // ── Validar NIE legacy con prefijo T ───────────────────────
  // Formato antiguo: T + 8 chars alfanumericos. No tiene checksum.
  // Se acepta automaticamente si cumple el patron.
  function validateNIE_T(cleaned) {
    if (/^T[A-Z0-9]{8}$/.test(cleaned)) {
      return { type: 'NIE', valid: true };
    }
    return null;
  }

  // ── Validar cualquier documento ───────────────────────────
  function validateDocument(value) {
    var cleaned = cleanNif(value);
    if (!cleaned) return { cleaned: '', error: null, type: null };

    // Intentar cada tipo en orden
    var result = validateDNI(cleaned);
    if (!result) result = validateNIE(cleaned);
    if (!result) result = validateNIE_T(cleaned);
    if (!result) result = validateCIF(cleaned);

    if (!result) {
      // Formato no reconocido — puede ser un documento extranjero
      // Solo avisar si parece un intento de DNI/NIE/CIF espanol
      if (/^[0-9XYZABCDEFGHJKLMNPQRSUVW]/i.test(cleaned) && cleaned.length >= 7 && cleaned.length <= 10) {
        return { cleaned: cleaned, error: 'Revisa tu documento — el formato no parece correcto', type: null };
      }
      // No parece un documento espanol, no avisar
      return { cleaned: cleaned, error: null, type: null };
    }

    if (!result.valid) {
      return { cleaned: cleaned, error: 'Revisa tu ' + result.type + ' — el formato no parece correcto', type: result.type };
    }

    return { cleaned: cleaned, error: null, type: result.type };
  }

  // ── Detectar campos por label ─────────────────────────────
  var KEYWORDS = ['nif', 'cif', 'dni', 'nie', 'documento', 'fiscal',
                   'identificacion', 'identificación', 'tax id', 'vat'];

  function isNifField(input) {
    // Buscar en el label asociado
    var id = input.id || input.name;
    if (id) {
      var labels = document.querySelectorAll('label[for="' + id + '"]');
      for (var i = 0; i < labels.length; i++) {
        var text = labels[i].textContent.toLowerCase();
        for (var k = 0; k < KEYWORDS.length; k++) {
          if (text.indexOf(KEYWORDS[k]) >= 0) return true;
        }
      }
    }
    // Buscar en el label padre (patron comun en GHL)
    var parent = input.parentElement;
    while (parent && parent !== document.body) {
      var label = parent.querySelector('label');
      if (label) {
        var text = label.textContent.toLowerCase();
        for (var k = 0; k < KEYWORDS.length; k++) {
          if (text.indexOf(KEYWORDS[k]) >= 0) return true;
        }
      }
      parent = parent.parentElement;
    }
    // Buscar en placeholder o name del propio input
    var ph = (input.placeholder || '').toLowerCase();
    var nm = (input.name || '').toLowerCase();
    for (var k = 0; k < KEYWORDS.length; k++) {
      if (ph.indexOf(KEYWORDS[k]) >= 0 || nm.indexOf(KEYWORDS[k]) >= 0) return true;
    }
    // Buscar data-attribute explícito
    if (input.dataset.nif === 'true' || input.dataset.dni === 'true') return true;
    return false;
  }

  // ── UI: enganchar al campo ────────────────────────────────
  function attach(input) {
    if (input.dataset.nifcheck) return;
    input.dataset.nifcheck = '1';

    var hint = document.createElement('div');
    hint.style.cssText = 'font-size:13px;margin-top:6px;color:#1f2937;display:none;line-height:1.35;font-family:inherit';
    input.insertAdjacentElement('afterend', hint);

    var validate = function() {
      var result = validateDocument(input.value);

      // Normalizar formato silenciosamente (quitar puntos, guiones, mayusculas)
      var currentCleaned = cleanNif(input.value);
      if (currentCleaned && currentCleaned !== input.value) {
        input.value = currentCleaned;
        input.dispatchEvent(new Event('input', {bubbles:true}));
      }

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

  // ── Escanear campos ───────────────────────────────────────
  function scan() {
    // Buscar todos los inputs de texto y comprobar si son campos de NIF
    var inputs = document.querySelectorAll('input[type="text"], input:not([type])');
    for (var i = 0; i < inputs.length; i++) {
      if (isNifField(inputs[i])) {
        attach(inputs[i]);
      }
    }
  }

  scan();
  new MutationObserver(scan).observe(document.body, {childList: true, subtree: true});
})();
