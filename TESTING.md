# Guía completa de testing — luxora-compartido

Guía paso a paso para verificar que cada herramienta funciona correctamente en producción. Incluye tanto pruebas visuales (usuario) como pruebas técnicas (consola del navegador).

## Requisitos previos

- Navegador Chrome o Edge (para DevTools)
- Un embudo de Luxora/GHL con los scripts en el Tracking Code del cuerpo (Footer)
- Saber abrir DevTools: pulsar `F12` o `Ctrl+Shift+I`

**Importante:** para pruebas limpias, usa siempre una ventana de **Incógnito** (`Ctrl+Shift+N`). Así no hay caché ni cookies previas que interfieran.

---

## 1. Verificador de email

### 1.1 Verificar que el script se cargó

1. Abre la landing en el navegador
2. Abre DevTools (`F12`) → pestaña **Console**
3. Ejecuta:

```js
document.querySelectorAll('script[src*="email-typo-checker"]').forEach(function(s) { console.log('Email checker cargado:', s.src); });
```

**Esperado:** una línea con la URL del script. Si no aparece nada, el script no está en el Tracking Code.

### 1.2 Prueba visual — sugerencia en tiempo real

1. En el formulario, escribe en el campo de email: `test@hormail.com`
2. Espera ~1 segundo sin tocar nada

**Esperado:** debajo del campo aparece el texto "¿Quisiste decir test@hotmail.com? (haz clic para corregir)".

3. Haz clic en la sugerencia

**Esperado:** el campo se autocompleta con `test@hotmail.com` y la sugerencia desaparece.

### 1.3 Prueba visual — autocorrección silenciosa en submit

1. Escribe en el campo de email: `test@gmail.con`
2. **Sin esperar**, pulsa inmediatamente el botón de envío (Reservar Plaza, Confirmar, etc.)

**Esperado:** el formulario se envía. Busca el contacto de prueba en el CRM — el email debe ser `test@gmail.com` (corregido), no `test@gmail.con`.

### 1.4 Prueba visual — sanitización silenciosa

1. Escribe en el campo de email: `  Test@Gmail.COM  ` (con espacios y mayúsculas)
2. Sal del campo (Tab o clic fuera)

**Esperado:** el campo se limpia automáticamente a `test@gmail.com` sin ningún aviso.

### 1.5 Prueba visual — no da falsos positivos

1. Escribe en el campo de email: `usuario@empresa.es`
2. Sal del campo

**Esperado:** no aparece ninguna sugerencia (el dominio es desconocido pero válido).

### 1.6 Pruebas adicionales por consola

```js
// Verificar que la función checkEmail existe y funciona
fetch(document.querySelector('script[src*="email-typo-checker"]').src)
  .then(function(r) { return r.text(); })
  .then(function(code) {
    // Extraer checkEmail del código
    var testFn = new Function(code.replace('})();', 'return checkEmail; })()'));
    var check = testFn();
    
    var tests = [
      ['test@hormail.com', 'test@hotmail.com'],
      ['test@gmail.con', 'test@gmail.com'],
      ['test@gmail.con.com', 'test@gmail.com'],
      ['test@gmail.com', null],
      ['test@hotmail.es', null],
    ];
    
    tests.forEach(function(t) {
      var result = check(t[0]);
      var ok = result === t[1];
      console.log((ok ? 'OK' : 'FAIL') + ': ' + t[0] + ' → ' + result + (ok ? '' : ' (esperado: ' + t[1] + ')'));
    });
  });
```

---

## 2. Validador de teléfono

### 2.1 Verificar que el script se cargó

```js
document.querySelectorAll('script[src*="validador-telefono"]').forEach(function(s) { console.log('Validador teléfono cargado:', s.src); });
```

### 2.2 Prueba visual — limpieza silenciosa de formato

1. En el campo de teléfono, escribe: `655 38 34 94`
2. Sal del campo (Tab o clic fuera)

**Esperado:** el número se limpia automáticamente a `655383494` sin ningún aviso.

### 2.3 Prueba visual — normalización de prefijo

1. Escribe: `0034655383494`
2. Sal del campo

**Esperado:** se normaliza a `+34655383494` sin aviso.

### 2.4 Prueba visual — aviso de dígitos faltantes

1. Escribe: `65538`
2. Sal del campo

**Esperado:** aparece debajo del campo el texto "Parece que faltan dígitos".

### 2.5 Prueba visual — aviso de número español inválido

1. Escribe: `312345678` (9 dígitos pero empieza por 3)
2. Sal del campo

**Esperado:** aparece "Los números españoles empiezan por 6, 7, 8 o 9".

### 2.6 Prueba visual — número internacional válido (no avisa)

1. Escribe: `+33612345678` (número francés)
2. Sal del campo

**Esperado:** no aparece ningún aviso. El número se mantiene tal cual.

### 2.7 Prueba visual — número español válido (no avisa)

1. Escribe: `655383494`
2. Sal del campo

**Esperado:** no aparece ningún aviso.

---

## 3. Validador NIF/CIF/NIE

### 3.1 Requisito previo

El formulario debe tener un campo personalizado con un label que contenga alguna de estas palabras: `nif`, `cif`, `dni`, `nie`, `documento`, `fiscal`, `identificación`.

### 3.2 Verificar que el script se cargó

```js
document.querySelectorAll('script[src*="validador-nif"]').forEach(function(s) { console.log('Validador NIF cargado:', s.src); });
```

### 3.3 Prueba visual — limpieza de formato

1. En el campo de NIF, escribe: `12.345.678-z`
2. Sal del campo

**Esperado:** se limpia automáticamente a `12345678Z` (sin puntos, sin guión, en mayúsculas).

### 3.4 Prueba visual — DNI válido (no avisa)

1. Escribe: `12345678Z`
2. Sal del campo

**Esperado:** no aparece ningún aviso.

### 3.5 Prueba visual — DNI con letra incorrecta

1. Escribe: `12345678A`
2. Sal del campo

**Esperado:** aparece "Revisa tu DNI — el formato no parece correcto".

### 3.6 Prueba visual — NIE válido

1. Escribe: `X0000000T`
2. Sal del campo

**Esperado:** no aparece ningún aviso.

### 3.7 Prueba visual — CIF válido

1. Escribe: `A58818501`
2. Sal del campo

**Esperado:** no aparece ningún aviso.

### 3.8 Tabla de DNIs de prueba

Estos DNIs son matemáticamente correctos (la letra coincide con el mod 23):

| DNI | Letra correcta | Para probar error usa |
|---|---|---|
| 12345678 | Z | 12345678A |
| 00000000 | T | 00000000A |
| 99999999 | R | 99999999A |
| 11111111 | H | 11111111A |

---

## 4. Anti-bots (honeypot)

### 4.1 Verificar que el script se cargó

```js
document.querySelectorAll('script[src*="anti-bots"]').forEach(function(s) { console.log('Anti-bots cargado:', s.src); });
```

### 4.2 Verificar que el honeypot está inyectado

**Importante:** si el formulario es un popup, primero ábrelo (haz clic en el botón que lo muestra). Luego ejecuta:

```js
document.querySelectorAll('input[name="website"], input[name="url"], input[name="company_url"], input[name="homepage"], input[name="site_url"]').forEach(function(el) {
  console.log('Honeypot encontrado:', el.name, '| valor:', JSON.stringify(el.value), '| visible:', el.offsetParent !== null);
});
```

**Esperado:** una línea como `Honeypot encontrado: url | valor: "" | visible: false`. Si no aparece nada, el honeypot no se inyectó (ver sección de diagnóstico abajo).

### 4.3 Prueba completa — simular un bot

#### Paso 1: Rellenar el honeypot (como haría un bot)

```js
var hp = document.querySelector('input[name="website"], input[name="url"], input[name="company_url"], input[name="homepage"], input[name="site_url"]');
if (hp) {
  hp.value = 'http://spam.com';
  hp.dispatchEvent(new Event('input', {bubbles: true}));
  console.log('Honeypot rellenado con:', hp.value);
} else {
  console.log('ERROR: no se encontró el honeypot');
}
```

#### Paso 2: Rellenar el formulario normalmente

Escribe datos de prueba en los campos visibles (nombre, email, etc.).

#### Paso 3: Pulsar el botón de envío

Haz clic en "Confirmar Registro" / "Reservar Plaza" / el botón que sea.

**Esperado:** no pasa nada. El formulario no se envía. No hay redirect, no hay mensaje de éxito, no hay animación de carga. Silencio total.

#### Paso 4: Verificar en Network

Abre la pestaña **Network** en DevTools **antes** de pulsar el botón. Después de pulsar, no debería aparecer ninguna petición POST nueva a `forms.leadconnectorhq.com` ni similar.

#### Paso 5: Verificar el flag "touched" (protección anti-limpieza)

Incluso si limpias el honeypot antes de enviar, debería seguir bloqueado:

```js
// Limpiar el valor (como haría un bot avanzado)
var hp = document.querySelector('input[name="website"], input[name="url"], input[name="company_url"], input[name="homepage"], input[name="site_url"]');
hp.value = '';
console.log('Honeypot limpiado. Pero el flag "touched" sigue activo.');
```

Pulsa enviar de nuevo → sigue bloqueado. Esto es correcto: el flag `wasTouched` se activó cuando el campo recibió input y no se puede desactivar.

### 4.4 Prueba completa — verificar que usuarios reales NO se ven afectados

#### Paso 1: Recargar la página

`Ctrl+Shift+R` (hard refresh) para empezar con una sesión limpia.

#### Paso 2: Si el formulario es un popup, abrirlo

Haz clic en el botón que abre el popup del formulario.

#### Paso 3: Rellenar el formulario normalmente

**No tocar el honeypot.** Escribe datos de prueba solo en los campos visibles.

#### Paso 4: Pulsar el botón de envío

**Esperado:** el formulario se envía normalmente. Redirect a la página de gracias (o mensaje de éxito, según configuración).

#### Paso 5: Verificar en el CRM

Busca el contacto de prueba en GHL. Debería existir con los datos que escribiste.

### 4.5 Diagnóstico — el honeypot no se inyecta

Si el paso 4.2 no encuentra el honeypot, ejecuta este diagnóstico completo:

```js
console.log('=== Diagnóstico anti-bots ===');

// ¿Se cargó el script?
var scripts = document.querySelectorAll('script[src*="anti-bots"]');
console.log('1. Scripts anti-bots cargados:', scripts.length);

// ¿Hay <form> en la página?
var forms = document.querySelectorAll('form');
console.log('2. Tags <form>:', forms.length);

// ¿Hay popups de GHL?
var popups = document.querySelectorAll('.hl_main_popup, [class*="popup-body"]');
console.log('3. Popups GHL (.hl_main_popup):', popups.length);

// ¿Hay inputs de email/tel?
var inputs = document.querySelectorAll('input[type="email"], input[type="tel"], input[type="text"]');
console.log('4. Inputs en la página:', inputs.length);

// ¿El popup está abierto?
popups.forEach(function(p, i) {
  var style = window.getComputedStyle(p);
  console.log('   Popup', i, '- display:', style.display, '- visibility:', style.visibility);
});

// ¿Errores en consola?
console.log('5. Busca errores rojos arriba en la consola que mencionen "anti-bots"');
```

**Causas comunes:**
- El popup aún no se abrió (los inputs no existen en el DOM)
- El script se cargó antes de que GHL renderizara el formulario (el MutationObserver debería cubrirlo, pero algunos popups de GHL se renderizan en un timing especial)
- El formulario está en un iframe (los scripts del Tracking Code del embudo no pueden acceder al iframe)

---

## 5. Prueba integral — todas las herramientas a la vez

Para verificar que las 4 herramientas funcionan correctamente juntas sin interferencias:

### Paso 1: Recargar la página en incógnito

`Ctrl+Shift+N` → navegar a la URL de la landing → `Ctrl+Shift+R`

### Paso 2: Verificar que todos los scripts se cargaron

```js
['email-typo-checker', 'validador-telefono', 'validador-nif', 'anti-bots'].forEach(function(name) {
  var found = document.querySelectorAll('script[src*="' + name + '"]').length;
  console.log(name + ':', found > 0 ? 'CARGADO' : 'NO ENCONTRADO');
});
```

### Paso 3: Abrir el formulario (si es popup)

### Paso 4: Verificar el honeypot

```js
document.querySelectorAll('input[name="website"], input[name="url"], input[name="company_url"], input[name="homepage"], input[name="site_url"]').forEach(function(el) {
  console.log('Honeypot:', el.name, '| valor:', JSON.stringify(el.value));
});
```

### Paso 5: Probar el email

Escribe `test@hormail.com` y espera 1 segundo → debe aparecer sugerencia.

### Paso 6: Probar el teléfono

Escribe `655 38` y sal del campo → debe aparecer "Parece que faltan dígitos".

### Paso 7: Probar el NIF (si hay campo)

Escribe `12345678A` y sal del campo → debe aparecer aviso.

### Paso 8: Enviar el formulario

Corrige los datos de prueba a valores válidos y pulsa enviar.

**Esperado:** el formulario se envía normalmente (el honeypot está vacío, los datos están corregidos).

### Paso 9: Verificar en el CRM

El contacto debe existir con:
- Email corregido (si escribiste un typo)
- Teléfono limpio (sin espacios)
- NIF en formato correcto (si aplica)

---

## 6. Checklist rápido de deployment

Antes de publicar un embudo con las herramientas, verifica:

- [ ] Scripts pegados en **Código de seguimiento del cuerpo** (no del encabezado)
- [ ] Variante correcta: `light` para fondos oscuros, `dark` para fondos claros
- [ ] Email checker: probar con `test@hormail.com` → aparece sugerencia
- [ ] Teléfono: probar con número corto → aparece aviso
- [ ] Anti-bots: buscar honeypot en consola → encontrado con valor vacío
- [ ] Envío normal funciona sin problemas (sin tocar el honeypot)
- [ ] Si el formulario es popup: verificar que el honeypot se inyecta al abrirlo

---

Última actualización: abril 2026
