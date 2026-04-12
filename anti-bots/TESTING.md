# Guía de testing — Anti-bots (honeypot)

Esta guía explica cómo comprobar que el sistema anti-bots funciona correctamente en tu landing page. Está escrita para alguien que nunca ha abierto las herramientas de desarrollador del navegador. No necesitas saber programar: solo seguir los pasos exactamente como se describen.

---

## ¿Qué es el sistema anti-bots y cómo funciona?

Antes de empezar las pruebas, es útil entender brevemente qué hace esta herramienta.

Los bots (programas automáticos maliciosos) intentan rellenar y enviar formularios de forma masiva para registrar emails falsos o hacer spam. El script anti-bots usa una técnica llamada **honeypot** (en inglés, "tarro de miel"): añade un campo invisible al formulario que ningún humano ve ni rellena. Sin embargo, los bots sí lo ven (porque leen el código de la página) y lo rellenan automáticamente. Cuando el sistema detecta que ese campo oculto tiene contenido, sabe que es un bot y bloquea el envío silenciosamente.

Los usuarios reales nunca ven ese campo oculto, por lo que no se ven afectados en absoluto.

---

## Antes de empezar

### ¿Qué necesitas?

- El navegador **Google Chrome** o **Microsoft Edge** (no Firefox ni Safari para estas pruebas)
- La URL de tu landing page con el script ya instalado
- Unos 30 minutos para hacer todas las pruebas con atención

### Formularios en popup vs formularios en línea (inline)

Esta distinción es muy importante para las pruebas:

- **Formulario en popup:** el formulario está oculto y aparece cuando el usuario hace clic en un botón (por ejemplo, "Reservar mi plaza"). El formulario se carga en ese momento. Si el popup está cerrado, el formulario no existe aún en la página y el honeypot no se puede verificar.
- **Formulario en línea (inline):** el formulario está siempre visible en la página, sin necesidad de hacer clic en ningún botón para mostrarlo.

**Regla clave para las pruebas:** si tu formulario es un popup, siempre debes abrirlo primero (haciendo clic en el botón que lo muestra) antes de ejecutar cualquier comando de verificación en la consola. Si el popup está cerrado, los comandos no encontrarán nada y parecerá que el honeypot no existe cuando en realidad es que el formulario todavía no está cargado.

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

**¿Qué es DevTools?** Es un panel oculto dentro del navegador que permite ver el "interior" de una página web: sus errores, su código, y ejecutar pequeños programas de prueba. Los desarrolladores lo usan constantemente; nosotros lo usaremos para verificar que el script funciona.

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

Esta primera prueba confirma que el script anti-bots está presente en tu página. Si el script no está instalado, ninguna de las pruebas siguientes funcionará.

### Pasos:

1. Con DevTools abierto y en la pestaña Console, haz clic en el área de escritura (donde está el `>`)
2. Copia y pega el siguiente código exactamente como aparece:

```js
document.querySelectorAll('script[src*="anti-bots"]').forEach(function(s) { console.log('Anti-bots cargado:', s.src); });
```

3. Pulsa **Enter**

### ¿Qué deberías ver?

**Resultado correcto:** Aparece una línea de texto con la dirección web (URL) del script, algo parecido a:
`Anti-bots cargado: https://cdn.tudominio.com/.../anti-bots.min.js`

**Resultado incorrecto:** No aparece nada después de pulsar Enter (la consola queda en silencio). Esto significa que el script no está instalado en el Tracking Code de la página. Contacta con quien instaló el script para que lo añada al Código de seguimiento del cuerpo (Footer) del embudo en GHL.

---

## Prueba 2 — Verificar que el campo honeypot se inyectó correctamente

Esta prueba confirma que el script añadió el campo invisible (honeypot) al formulario. Sin este campo, el sistema anti-bots no puede funcionar.

### Pasos — formulario en popup:

Si tu formulario aparece al hacer clic en un botón, debes abrirlo primero:

1. Haz clic en el botón que abre el formulario (puede llamarse "Reservar mi plaza", "Apuntarme", "Quiero más información", etc.)
2. Espera a que el popup se abra completamente y veas el formulario
3. Ahora abre DevTools si no está abierto (F12) y ve a Console

### Pasos — formulario en línea (inline):

Si el formulario está siempre visible en la página, no necesitas hacer nada especial — simplemente abre DevTools.

### Comando de verificación (para todos los casos):

Copia y pega este código en la consola y pulsa **Enter**:

```js
document.querySelectorAll('input[name="website"], input[name="url"], input[name="company_url"], input[name="homepage"], input[name="site_url"]').forEach(function(el) {
  console.log('Honeypot encontrado:', el.name, '| valor:', JSON.stringify(el.value), '| visible:', el.offsetParent !== null);
});
```

### ¿Qué deberías ver?

**Resultado correcto:** Aparece una línea de texto como esta:
`Honeypot encontrado: url | valor: "" | visible: false`

Esto confirma que:
- El campo honeypot existe en el formulario (con nombre `url`, `website` o similar)
- Su valor está vacío (`""`) — correcto, nadie lo ha tocado
- No es visible (`false`) — correcto, está oculto para los humanos

**Resultado incorrecto:** No aparece nada en la consola. El honeypot no se inyectó. Las causas más comunes:
- El formulario es un popup y todavía no está abierto — abre el popup y vuelve a ejecutar el comando
- El script no se cargó correctamente — repite la Prueba 1
- Hay un timing especial en el popup de GHL — ve a la sección de diagnóstico al final de este documento

---

## Prueba 3 — Simular un bot: verificar que el envío se bloquea

Esta es la prueba principal. Vamos a simular exactamente lo que haría un bot: rellenar el campo oculto (que un humano no vería ni tocaría), rellenar el resto del formulario y pulsar enviar. El sistema debe bloquearlo silenciosamente.

**Importante:** esta prueba usa comandos de consola para rellenar el honeypot, porque ese campo es invisible en la página — no puedes hacer clic en él manualmente.

### Paso 1 — Abre el formulario (si es popup)

Si el formulario es un popup, haz clic en el botón que lo abre. Espera a que el popup esté completamente visible antes de continuar.

### Paso 2 — Rellena el honeypot desde la consola (simulando un bot)

En la pestaña Console de DevTools, copia y pega el siguiente código y pulsa **Enter**:

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

**¿Qué deberías ver en la consola?**
`Honeypot rellenado con: http://spam.com`

Si ves el mensaje de ERROR, el popup puede que no esté abierto. Abre el popup y vuelve a ejecutar este código.

### Paso 3 — Rellena el formulario normalmente (como lo haría el bot también)

Escribe datos de prueba en los campos visibles del formulario:
- En el campo de nombre: escribe algo como `Test Bot`
- En el campo de email: escribe algo como `test-bot@prueba.com`
- En el campo de teléfono (si hay): escribe `600000000`
- Cualquier otro campo obligatorio que requiera el formulario

### Paso 4 — Haz clic en el botón de envío

Haz clic en el botón de envío del formulario (puede llamarse "Confirmar Registro", "Reservar Plaza", "Enviar", etc.)

### ¿Qué deberías ver?

**Resultado correcto:** No pasa absolutamente nada. El formulario no se envía. No aparece ningún mensaje de error, no aparece ninguna página de "gracias", no hay ninguna animación de carga. La pantalla queda exactamente igual que antes de hacer clic. Esto es lo correcto — el bloqueo es silencioso para no dar pistas al bot sobre por qué falló.

**Resultado incorrecto:** El formulario se envía y aparece la página de "gracias" o un mensaje de confirmación. El sistema anti-bots no está bloqueando el envío.

### Paso 5 — Verificar también en la pestaña Network (opcional pero recomendable)

Para confirmar que no se envió ningún dato, puedes revisar la pestaña Network de DevTools:

1. Antes de repetir la prueba, haz clic en la pestaña **Network** en DevTools (está al lado de Console)
2. Haz clic en el botón de envío del formulario de nuevo
3. En la pestaña Network verás una lista de peticiones de red. Busca si aparece alguna petición a `forms.leadconnectorhq.com` o similar. Si no aparece ninguna petición nueva, confirma que el envío fue bloqueado.

---

## Prueba 4 — El flag "touched" protege aunque el bot limpie el honeypot

Un bot avanzado podría intentar rellenar el honeypot y luego borrarlo justo antes de enviar, esperando así pasar la verificación. El script anti-bots tiene una protección contra esto: una vez que el campo honeypot recibe cualquier valor, se activa internamente un indicador ("flag") que marca la sesión como sospechosa. Ese indicador no desaparece aunque luego el campo se vacíe.

Esta prueba verifica esa protección.

### Pasos (continúa después de la Prueba 3):

El honeypot ya fue rellenado en la prueba anterior. Ahora vamos a limpiarlo y verificar que el bloqueo sigue activo.

### Paso 1 — Limpia el valor del honeypot desde la consola

En la consola, copia y pega este código y pulsa **Enter**:

```js
var hp = document.querySelector('input[name="website"], input[name="url"], input[name="company_url"], input[name="homepage"], input[name="site_url"]');
hp.value = '';
console.log('Honeypot limpiado. El valor ahora es: "' + hp.value + '"');
console.log('Pero el flag interno "wasTouched" sigue activo — el bloqueo persiste.');
```

### ¿Qué deberías ver en la consola?

Dos líneas:
```
Honeypot limpiado. El valor ahora es: ""
Pero el flag interno "wasTouched" sigue activo — el bloqueo persiste.
```

### Paso 2 — Intenta enviar el formulario de nuevo

Haz clic en el botón de envío del formulario.

### ¿Qué deberías ver?

**Resultado correcto:** El formulario sigue sin enviarse. Aunque el campo honeypot ahora está vacío, el sistema recuerda que fue tocado y mantiene el bloqueo.

**Resultado incorrecto:** El formulario se envía al limpiar el honeypot. La protección del flag no está funcionando.

---

## Prueba 5 — Un usuario real puede enviar el formulario sin problemas

Esta es la prueba más importante de todas: verificar que el sistema anti-bots no afecta a los usuarios reales. Un usuario humano nunca ve ni toca el campo honeypot, por lo que el formulario debe enviarse con total normalidad.

### Paso 1 — Recarga la página completamente

Es fundamental empezar desde cero para esta prueba. Pulsa las teclas **Ctrl + Shift + R** al mismo tiempo. Esto hace un "hard refresh" que borra la caché y reinicia completamente la página.

Espera a que la página cargue completamente.

### Paso 2 — Si el formulario es un popup, ábrelo

Haz clic en el botón que abre el formulario popup. Espera a que el popup esté completamente visible.

### Paso 3 — Rellena el formulario como lo haría un usuario real

Rellena los campos visibles del formulario con datos de prueba reales:
- En el campo de nombre: escribe algo como `Usuario Real`
- En el campo de email: escribe tu email real o uno de prueba que puedas verificar después
- En el campo de teléfono (si hay): escribe `655383494`
- Cualquier otro campo obligatorio

**Muy importante: NO toques el honeypot.** No ejecutes ningún código de consola que rellene el honeypot. Simplemente rellena los campos que ves en pantalla, como lo haría cualquier persona normal.

### Paso 4 — Haz clic en el botón de envío

Haz clic en el botón de envío del formulario.

### ¿Qué deberías ver?

**Resultado correcto:** El formulario se envía normalmente. Aparece la página de "gracias" (o el mensaje de confirmación, según la configuración de tu embudo). No hay ningún bloqueo, ningún error, ningún obstáculo.

**Resultado incorrecto:** El formulario no se envía y no aparece ningún mensaje de confirmación, igual que si fuera un bot. Esto indicaría un error grave en la lógica del script que estaría bloqueando a usuarios reales.

### Paso 5 — Verifica el contacto en el CRM de GHL

1. Entra en tu subcuenta de GHL (Luxora)
2. Ve a Contactos
3. Busca el email que escribiste en el formulario
4. Debe aparecer el contacto con los datos que escribiste

**Resultado correcto:** El contacto existe con todos los datos correctos.

**Resultado incorrecto:** El contacto no existe o faltan datos. El formulario pareció enviarse pero los datos no llegaron al CRM.

---

## Diagnóstico — el honeypot no se inyecta

Si la Prueba 2 no encontró ningún honeypot, ejecuta este diagnóstico completo. Te dará información detallada para identificar el problema.

### Pasos:

1. Si el formulario es un popup, asegúrate de haberlo abierto primero
2. En la consola, copia y pega el siguiente código completo y pulsa **Enter**:

```js
console.log('=== Diagnóstico anti-bots ===');

var scripts = document.querySelectorAll('script[src*="anti-bots"]');
console.log('1. Scripts anti-bots cargados:', scripts.length);

var forms = document.querySelectorAll('form');
console.log('2. Tags <form> en la página:', forms.length);

var popups = document.querySelectorAll('.hl_main_popup, [class*="popup-body"]');
console.log('3. Popups GHL detectados:', popups.length);

var inputs = document.querySelectorAll('input[type="email"], input[type="tel"], input[type="text"]');
console.log('4. Inputs visibles en la página:', inputs.length);

popups.forEach(function(p, i) {
  var style = window.getComputedStyle(p);
  console.log('   Popup', i, '— display:', style.display, '— visibility:', style.visibility);
});

console.log('5. Si ves errores rojos arriba en la consola que mencionan "anti-bots", cópialos y compártelos con soporte.');
```

### ¿Cómo interpretar los resultados?

Lee cada línea que aparece en la consola:

**Línea 1 — Scripts anti-bots cargados:**
- Si dice `0`: el script no está instalado. Revisa el Tracking Code del embudo en GHL.
- Si dice `1` o más: el script sí está cargado, el problema está en otro lado.

**Línea 2 — Tags `<form>` en la página:**
- Si dice `0`: no hay ningún formulario cargado. Si es un popup, probablemente no está abierto todavía. Abre el popup y vuelve a ejecutar el diagnóstico.
- Si dice `1` o más: el formulario está en la página.

**Línea 3 — Popups GHL detectados:**
- Si dice `0` y el formulario es un popup: el popup usa una estructura diferente a la estándar de GHL. Informa a soporte.
- Si dice `1` o más: el popup está en la página.

**Línea 4 — Inputs visibles en la página:**
- Si dice `0`: no hay campos de formulario cargados. El formulario popup puede no estar abierto.
- Si dice un número positivo: los campos están ahí.

**Información sobre los popups (si aparecen):**
- `display: none` o `visibility: hidden`: el popup existe en la página pero está oculto. Ábrelo primero haciendo clic en el botón correspondiente.
- `display: block` o `display: flex`: el popup está visible. El honeypot debería haberse inyectado.

### Causas comunes y soluciones:

| Síntoma | Causa probable | Solución |
|---|---|---|
| El diagnóstico no encuentra el formulario | El popup no está abierto | Abre el popup y vuelve a ejecutar |
| El script está cargado pero no hay honeypot | Timing de renderizado de GHL | Informa a soporte técnico |
| El formulario está en un iframe | Los scripts del embudo no pueden acceder a iframes | Contacta a soporte — requiere solución especial |
| Hay errores rojos en la consola | Error en el script | Copia el error exacto y envíalo a soporte |

---

## Checklist rápido

Marca cada prueba al completarla:

- [ ] **Prueba 1:** La consola muestra la URL del script al ejecutar la verificación de carga
- [ ] **Prueba 2:** Al ejecutar la verificación del honeypot (con el popup abierto si aplica), aparece una línea "Honeypot encontrado" con valor vacío y visible: false
- [ ] **Prueba 3 — Paso 2:** La consola confirma "Honeypot rellenado con: http://spam.com"
- [ ] **Prueba 3 — Paso 4:** Al hacer clic en enviar con el honeypot relleno, el formulario NO se envía (silencio total, sin página de gracias)
- [ ] **Prueba 4:** Al limpiar el honeypot y volver a hacer clic en enviar, el formulario sigue sin enviarse
- [ ] **Prueba 5 — Paso 4:** Al rellenar el formulario normalmente SIN tocar el honeypot, el formulario SÍ se envía y aparece la página de gracias
- [ ] **Prueba 5 — Paso 5:** El contacto de prueba aparece en el CRM de GHL con los datos correctos

Si todas las casillas están marcadas, el sistema anti-bots funciona correctamente: bloquea a los bots y deja pasar a los usuarios reales.

---

*Última actualización: abril 2026*
