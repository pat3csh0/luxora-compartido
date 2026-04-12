# Guía de testing — Verificador de email

Esta guía explica cómo comprobar que el verificador de email funciona correctamente en tu landing page. Está escrita para alguien que nunca ha abierto las herramientas de desarrollador del navegador. No necesitas saber programar: solo seguir los pasos exactamente como se describen.

---

## Antes de empezar

### ¿Qué necesitas?

- El navegador **Google Chrome** o **Microsoft Edge** (no Firefox ni Safari para estas pruebas)
- La URL de tu landing page con el script ya instalado
- Unos 20 minutos para hacer todas las pruebas

### Abre la landing en modo Incógnito

El modo Incógnito garantiza que no hay datos guardados de sesiones anteriores que puedan interferir con las pruebas. Es como abrir la página por primera vez, desde cero.

1. Abre Chrome o Edge
2. Pulsa las teclas **Ctrl + Shift + N** al mismo tiempo
3. Se abrirá una ventana nueva, más oscura, con un icono de espía o sombrilla — eso es el modo Incógnito
4. En la barra de direcciones (arriba, donde pone la URL), escribe o pega la URL de tu landing page
5. Pulsa **Enter**
6. Espera a que la página cargue completamente

---

## Cómo abrir DevTools (herramientas de desarrollador)

**¿Qué es DevTools?** Es un panel oculto dentro del navegador que permite ver el "interior" de una página web: sus errores, su código, y ejecutar pequeños programas de prueba. Los desarrolladores lo usan constantemente; nosotros lo usaremos solo para verificar que el script funciona.

### Para abrirlo:

1. Con la página cargada, pulsa la tecla **F12** en tu teclado
   - Si F12 no funciona, prueba con **Ctrl + Shift + I** (la letra i, de inspector)
   - En algunos portátiles necesitas pulsar **Fn + F12**
2. Se abrirá un panel en la parte inferior o lateral de la pantalla, con muchas pestañas y texto técnico
3. Ese panel es DevTools — no cierres ni toques nada todavía

**Lo que verás en pantalla:** El panel de DevTools tiene varias pestañas en la parte superior: Elements, Console, Sources, Network, etc. Son como carpetas distintas dentro de la herramienta.

---

## Cómo ir a la pestaña Console

La pestaña **Console** (Consola) es donde puedes escribir o pegar pequeños programas de prueba y ver los resultados. Es la que más usaremos.

1. En el panel de DevTools, busca la pestaña que pone **Console** (puede estar en inglés aunque tengas el navegador en español)
2. Haz clic en ella
3. Verás una pantalla en su mayoría vacía, con un símbolo `>` o `>>` parpadeando abajo — eso es donde puedes escribir

**Lo que significan los colores en la consola:**
- **Texto negro o blanco:** mensajes normales de información
- **Texto verde o con fondo verde:** todo correcto, prueba pasada
- **Texto rojo o naranja:** algo fue mal, hay un error o la prueba falló
- **Texto azul:** un enlace a una línea de código, puedes ignorarlo

---

## Cómo pegar código en la consola

En las pruebas a continuación te pediremos que pegues bloques de código en la consola. Así es como se hace:

1. Selecciona todo el código del bloque que te indicamos (desde la primera hasta la última letra)
2. Cópialo: **Ctrl + C**
3. Haz clic en el área de la consola (donde está el símbolo `>`)
4. Pega: **Ctrl + V**

**Importante — advertencia "Allow pasting" en Chrome:**
La primera vez que pegues algo en la consola de Chrome, puede aparecer un aviso que dice algo como "Allow pasting" o "Permitir pegado" y te pide que escribas la palabra `allow`. Esto es una medida de seguridad de Chrome. Haz lo siguiente:

1. Escribe la palabra `allow` con el teclado (no la pegues, escríbela letra a letra)
2. Pulsa **Enter**
3. Ahora vuelve a intentar pegar el código — esta vez sí funcionará

5. Después de pegar, pulsa **Enter** para ejecutarlo
6. Los resultados aparecerán inmediatamente debajo

---

## Prueba 1 — Verificar que el script se cargó correctamente

Esta primera prueba confirma que el script del verificador de email está presente en tu página. Si el script no está instalado, ninguna de las pruebas siguientes funcionará.

### Pasos:

1. Con DevTools abierto y en la pestaña Console, haz clic en el área de escritura (donde está el `>`)
2. Copia y pega el siguiente código exactamente como aparece:

```js
document.querySelectorAll('script[src*="email-typo-checker"]').forEach(function(s) { console.log('Email checker cargado:', s.src); });
```

3. Pulsa **Enter**

### ¿Qué deberías ver?

**Resultado correcto:** Aparece una línea de texto con la dirección web (URL) del script, algo parecido a:
`Email checker cargado: https://cdn.tudominio.com/.../email-typo-checker.min.js`

**Resultado incorrecto:** No aparece nada después de pulsar Enter (la consola queda en silencio). Esto significa que el script no está instalado en el Tracking Code de la página. Contacta con quien instaló el script para que lo añada al Código de seguimiento del cuerpo (Footer) del embudo en GHL.

---

## Prueba 2 — Sugerencia en tiempo real al escribir un email con error tipográfico

Esta prueba verifica que cuando alguien escribe un email con un error común (como `hormail` en lugar de `hotmail`), el verificador muestra una sugerencia amigable para corregirlo.

### Pasos:

1. Cierra o minimiza DevTools por un momento (puedes volver a abrirlo con F12 cuando lo necesites)
2. Ve al formulario de tu landing page
3. Haz clic en el campo de email (el recuadro donde se escribe el email)
4. Escribe exactamente esto, letra por letra: `test@hormail.com`
   - Asegúrate de escribir `hormail` y no `hotmail` — el error es intencionado
5. Ahora **no toques nada**. Espera aproximadamente 1 segundo sin hacer clic ni pulsar teclas

### ¿Qué deberías ver?

**Resultado correcto:** Aparece un texto pequeño debajo del campo de email que dice algo como:
`"¿Quisiste decir test@hotmail.com? (haz clic para corregir)"`

El texto puede aparecer en gris o con un estilo sutil — está ahí para ayudar al usuario sin molestarle.

**Resultado incorrecto:** No aparece ningún texto debajo del campo. Espera 2-3 segundos más. Si sigue sin aparecer, verifica la Prueba 1 para asegurarte de que el script está cargado.

---

## Prueba 3 — Aceptar la sugerencia haciendo clic en ella

Esta prueba verifica que al hacer clic en la sugerencia, el campo se rellena automáticamente con el email corregido y la sugerencia desaparece.

### Pasos (continúa desde la Prueba 2):

1. Con la sugerencia visible debajo del campo de email (que dice "¿Quisiste decir test@hotmail.com?")
2. Haz clic directamente sobre ese texto de sugerencia

### ¿Qué deberías ver?

**Resultado correcto:**
- El campo de email cambia automáticamente de `test@hormail.com` a `test@hotmail.com`
- La sugerencia desaparece
- El campo queda limpio con el email corregido listo para enviarse

**Resultado incorrecto:** El campo no cambia o la sugerencia no desaparece. Esto podría indicar un problema con el script. Abre DevTools (F12), ve a Console y busca mensajes en rojo que aparecieron al hacer clic.

---

## Prueba 4 — Autocorrección silenciosa al enviar el formulario

Esta prueba verifica que si alguien escribe un email con error tipográfico y pulsa "enviar" sin esperar la sugerencia, el script corrige el email automáticamente antes de enviarlo. El usuario no se da cuenta de nada — el proceso es silencioso.

### Pasos:

1. Haz clic en el campo de email del formulario
2. Borra lo que hubiera antes (selecciona todo con **Ctrl + A** y luego pulsa **Supr** o **Retroceso**)
3. Escribe exactamente: `test@gmail.con`
   - Fíjate: es `.con` en lugar de `.com` — el error es intencionado
4. **Inmediatamente**, sin esperar, haz clic en el botón de envío del formulario (puede llamarse "Reservar Plaza", "Confirmar", "Enviar", etc.)
   - La clave es no esperar — simula a alguien que escribe rápido y da clic sin revisar

### ¿Qué deberías ver?

**Resultado correcto:** El formulario se envía (aparece la página de "gracias" o un mensaje de confirmación). Cuando busques este contacto de prueba en el CRM de GHL, el email guardado debe ser `test@gmail.com` (con `.com` correcto), no `test@gmail.con`.

**Cómo verificar en GHL:**
1. Entra en tu subcuenta de GHL (Luxora)
2. Ve a Contactos
3. Busca el email `test@gmail.com`
4. Si aparece el contacto, la autocorrección funcionó correctamente

**Resultado incorrecto:** El formulario guarda el contacto con el email `test@gmail.con` (sin corregir). Esto indica que la autocorrección silenciosa no está funcionando.

---

## Prueba 5 — Sanitización silenciosa: espacios y mayúsculas

Esta prueba verifica que si alguien escribe un email con espacios al principio o al final, o con letras en mayúscula, el script lo limpia automáticamente en cuanto el usuario sale del campo (por ejemplo, pulsando Tab o haciendo clic en otro lugar).

### Pasos:

1. Haz clic en el campo de email
2. Borra lo que hubiera (Ctrl + A y luego Supr)
3. Escribe exactamente: `  Test@Gmail.COM  `
   - Hay **dos espacios** antes de `Test` y **dos espacios** después del último punto y las letras M mayúsculas
   - Para escribir espacios al principio, pulsa la barra espaciadora dos veces antes de escribir la T
4. Ahora sal del campo pulsando la tecla **Tab** (la tecla con dos flechas, normalmente a la izquierda del teclado, sobre Bloq Mayús)
   - También puedes hacer clic en cualquier otro campo del formulario

### ¿Qué deberías ver?

**Resultado correcto:** Cuando el foco sale del campo de email, el texto cambia automáticamente de `  Test@Gmail.COM  ` a `test@gmail.com` — sin espacios, todo en minúsculas. No aparece ningún aviso ni mensaje. La limpieza es silenciosa.

**Resultado incorrecto:** El campo mantiene los espacios o las mayúsculas. El script de sanitización no está funcionando.

---

## Prueba 6 — Sin falsos positivos con dominios desconocidos

Esta prueba verifica que el script no sugiere correcciones para emails que son perfectamente válidos aunque el dominio no sea uno de los más conocidos (como hotmail, gmail, etc.). Un negocio puede tener su propio dominio de email como `@empresa.es`.

### Pasos:

1. Haz clic en el campo de email
2. Borra lo que hubiera (Ctrl + A y Supr)
3. Escribe exactamente: `usuario@empresa.es`
4. Espera 2 segundos sin hacer nada

### ¿Qué deberías ver?

**Resultado correcto:** No aparece ninguna sugerencia de corrección. El campo queda tal y como lo escribiste, sin ningún texto debajo. Esto es correcto: el script solo sugiere correcciones cuando el dominio se parece a uno conocido con un error tipográfico.

**Resultado incorrecto:** Aparece una sugerencia de corrección para `empresa.es`. Esto sería un falso positivo y podría confundir a usuarios con dominios de empresa legítimos.

---

## Prueba 7 — Prueba múltiple por consola

Esta prueba avanzada ejecuta automáticamente varios casos de prueba y muestra un informe en la consola. Útil para verificar de un vistazo que toda la lógica interna funciona correctamente.

### Pasos:

1. Abre DevTools (F12) y ve a la pestaña Console
2. Copia y pega el siguiente bloque de código completo:

```js
fetch(document.querySelector('script[src*="email-typo-checker"]').src)
  .then(function(r) { return r.text(); })
  .then(function(code) {
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

3. Pulsa **Enter**
4. Espera 1-2 segundos mientras el script se descarga y ejecuta

### ¿Qué deberías ver?

**Resultado correcto:** Aparecen 5 líneas, todas comenzando con `OK`:
```
OK: test@hormail.com → test@hotmail.com
OK: test@gmail.con → test@gmail.com
OK: test@gmail.con.com → test@gmail.com
OK: test@gmail.com → null
OK: test@hotmail.es → null
```

**Resultado incorrecto:** Una o más líneas comienzan con `FAIL`. Eso indica qué caso específico no está funcionando correctamente.

**¿Qué significa `null`?** Significa que para ese email, el script no sugiere ninguna corrección. Es el comportamiento correcto para emails válidos.

---

## Checklist rápido

Marca cada prueba al completarla:

- [ ] **Prueba 1:** La consola muestra la URL del script al ejecutar la verificación de carga
- [ ] **Prueba 2:** Al escribir `test@hormail.com` y esperar 1 segundo, aparece la sugerencia "¿Quisiste decir test@hotmail.com?"
- [ ] **Prueba 3:** Al hacer clic en la sugerencia, el campo se rellena con `test@hotmail.com` y la sugerencia desaparece
- [ ] **Prueba 4:** Al escribir `test@gmail.con` y enviar de inmediato, el CRM guarda el contacto con `test@gmail.com`
- [ ] **Prueba 5:** Al escribir `  Test@Gmail.COM  ` y salir del campo, el contenido se limpia a `test@gmail.com`
- [ ] **Prueba 6:** Al escribir `usuario@empresa.es` no aparece ninguna sugerencia
- [ ] **Prueba 7:** La prueba múltiple por consola muestra 5 líneas `OK`

Si todas las casillas están marcadas, el verificador de email funciona correctamente.

---

*Última actualización: abril 2026*
