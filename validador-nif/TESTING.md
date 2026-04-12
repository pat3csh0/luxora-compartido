# Guía de testing — Validador de NIF/CIF/NIE

Esta guía explica cómo comprobar que el validador de documentos de identidad españoles (DNI, NIE, CIF) funciona correctamente en tu landing page. Está escrita para alguien que nunca ha abierto las herramientas de desarrollador del navegador. No necesitas saber programar: solo seguir los pasos exactamente como se describen.

---

## Antes de empezar

### ¿Qué necesitas?

- El navegador **Google Chrome** o **Microsoft Edge** (no Firefox ni Safari para estas pruebas)
- La URL de tu landing page con el script ya instalado
- Un formulario con un campo de NIF/DNI/CIF/NIE correctamente etiquetado (ver requisito previo más abajo)
- Unos 25 minutos para hacer todas las pruebas

### Requisito previo muy importante: la etiqueta del campo

El validador de NIF solo funciona si el campo tiene una etiqueta (un `label`, o texto asociado) que contenga alguna de estas palabras:

`nif`, `cif`, `dni`, `nie`, `documento`, `fiscal`, `identificación`

Si el campo de NIF en tu formulario tiene una etiqueta diferente (por ejemplo, solo dice "ID" o "Número"), el script no lo reconocerá y no activará la validación.

**¿Cómo comprobarlo?** Mira el texto que aparece encima o al lado del campo en el formulario. Debe contener alguna de las palabras de la lista. Si no la contiene, pide al técnico que instaló el script que cambie la etiqueta del campo en GHL.

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

Esta primera prueba confirma que el script del validador de NIF está presente en tu página. Si el script no está instalado, ninguna de las pruebas siguientes funcionará.

### Pasos:

1. Con DevTools abierto y en la pestaña Console, haz clic en el área de escritura (donde está el `>`)
2. Copia y pega el siguiente código exactamente como aparece:

```js
document.querySelectorAll('script[src*="validador-nif"]').forEach(function(s) { console.log('Validador NIF cargado:', s.src); });
```

3. Pulsa **Enter**

### ¿Qué deberías ver?

**Resultado correcto:** Aparece una línea de texto con la dirección web (URL) del script, algo parecido a:
`Validador NIF cargado: https://cdn.tudominio.com/.../validador-nif.min.js`

**Resultado incorrecto:** No aparece nada después de pulsar Enter (la consola queda en silencio). Esto significa que el script no está instalado en el Tracking Code de la página. Contacta con quien instaló el script para que lo añada al Código de seguimiento del cuerpo (Footer) del embudo en GHL.

**Recuerda también:** Asegúrate de que el campo NIF en el formulario tiene una etiqueta con una de las palabras clave (nif, dni, cif, nie, documento, fiscal, identificación). De lo contrario el script no lo detectará aunque esté cargado.

---

## Prueba 2 — Limpieza de formato: puntos, guiones y mayúsculas

Esta prueba verifica que si alguien escribe el DNI con el formato que a veces aparece en documentos oficiales (con puntos separando los grupos de números y un guión antes de la letra), el script lo limpia automáticamente al formato estándar: solo números y la letra en mayúscula, sin separadores.

### Pasos:

1. Ve al formulario de tu landing page
2. Haz clic en el campo de NIF/DNI
3. Escribe exactamente: `12.345.678-z`
   - Observa: tiene dos puntos (uno después del `12` y otro después del `345`) y un guión antes de la `z` minúscula
   - Escríbelo tal cual, con los puntos, el guión y la z minúscula
4. Sal del campo pulsando la tecla **Tab** o haciendo clic en otro lugar del formulario

### ¿Qué deberías ver?

**Resultado correcto:** En cuanto el foco sale del campo, el contenido cambia automáticamente de `12.345.678-z` a `12345678Z`:
- Se eliminan los puntos
- Se elimina el guión
- La `z` minúscula se convierte en `Z` mayúscula

No aparece ningún aviso ni mensaje. La limpieza es silenciosa.

**Resultado incorrecto:** El campo mantiene los puntos y el guión. El script de limpieza no está funcionando.

---

## Prueba 3 — DNI válido no genera ningún aviso

Esta prueba verifica que un DNI matemáticamente correcto (donde la letra corresponde exactamente con los números) no genera ningún aviso. Es importante que los usuarios con DNI válido puedan rellenar el formulario sin obstáculos.

**Nota sobre la letra del DNI:** La letra del DNI no es aleatoria. Se calcula dividiendo el número entre 23 y usando el resto para obtener la letra de una tabla fija. Por eso hay una única letra correcta para cada número.

### Pasos:

1. Haz clic en el campo de NIF/DNI
2. Borra lo que hubiera (selecciona todo con **Ctrl + A** y pulsa **Supr** o **Retroceso**)
3. Escribe exactamente: `12345678Z`
   - La `Z` es la letra correcta matemáticamente para el número `12345678`
4. Sal del campo pulsando **Tab** o haciendo clic en otro lugar

### ¿Qué deberías ver?

**Resultado correcto:** No aparece ningún aviso debajo del campo. El campo mantiene el contenido `12345678Z` sin cambios ni mensajes.

**Resultado incorrecto:** Aparece un aviso de error para un DNI perfectamente válido. Esto sería un falso positivo grave que impediría a usuarios reales enviar el formulario.

---

## Prueba 4 — DNI con letra incorrecta genera aviso

Esta prueba verifica que cuando alguien escribe un DNI con una letra que no corresponde matemáticamente a los números, el script muestra un aviso amigable. Esto puede pasar por un error al teclear o porque alguien intentó poner un DNI inventado.

### Pasos:

1. Haz clic en el campo de NIF/DNI
2. Borra lo que hubiera (Ctrl + A y Supr)
3. Escribe exactamente: `12345678A`
   - El número es el mismo de la prueba anterior (`12345678`), pero ahora usamos la letra `A` que es incorrecta — la letra correcta sería `Z`
4. Sal del campo pulsando **Tab** o haciendo clic en otro lugar

### ¿Qué deberías ver?

**Resultado correcto:** Aparece un texto debajo del campo que dice algo como:
`"Revisa tu DNI — el formato no parece correcto"`

El mensaje aparece en un color de aviso (puede ser naranja, rojo o el color de error del diseño de tu landing). Esto alerta al usuario de que puede haber cometido un error al teclear.

**Resultado incorrecto:** No aparece ningún aviso. El validador no está comprobando la letra del DNI.

---

## Prueba 5 — NIE válido no genera ningún aviso

Esta prueba verifica que el script acepta correctamente un NIE (Número de Identidad de Extranjero). Los NIE son para personas de otros países residentes en España. Empiezan siempre por las letras `X`, `Y` o `Z`.

### Pasos:

1. Haz clic en el campo de NIF/DNI
2. Borra lo que hubiera (Ctrl + A y Supr)
3. Escribe exactamente: `X0000000T`
   - Comienza por la letra `X`, luego 7 ceros, y termina en `T`
   - Esta es la letra correcta para este NIE específico
4. Sal del campo pulsando **Tab** o haciendo clic en otro lugar

### ¿Qué deberías ver?

**Resultado correcto:** No aparece ningún aviso. El campo mantiene `X0000000T` sin cambios ni mensajes. El script reconoce que es un NIE válido.

**Resultado incorrecto:** Aparece un aviso de error. El script no está manejando correctamente los NIE.

---

## Prueba 6 — CIF válido no genera ningún aviso

Esta prueba verifica que el script acepta correctamente un CIF (Código de Identificación Fiscal), que es el equivalente del DNI pero para empresas. Los CIF empiezan siempre por una letra mayúscula (A, B, C, D, E, F, G, H, J, N, P, Q, R, S, U, V, W).

### Pasos:

1. Haz clic en el campo de NIF/DNI (o el campo etiquetado como CIF/NIF de empresa)
2. Borra lo que hubiera (Ctrl + A y Supr)
3. Escribe exactamente: `A58818501`
   - Empieza por la letra `A` (sociedad anónima), seguida de 8 dígitos
   - Este es un CIF de ejemplo matemáticamente válido
4. Sal del campo pulsando **Tab** o haciendo clic en otro lugar

### ¿Qué deberías ver?

**Resultado correcto:** No aparece ningún aviso. El campo mantiene `A58818501` sin cambios ni mensajes. El script reconoce que es un CIF válido.

**Resultado incorrecto:** Aparece un aviso de error. El script no está manejando correctamente los CIF.

---

## Tabla de DNIs de prueba

Aquí tienes una tabla con números de DNI y sus letras correctas e incorrectas, por si quieres hacer más pruebas o verificar distintos casos:

| Número del DNI | Letra correcta | Para probar el aviso de error usa |
|---|---|---|
| `12345678` | `Z` | `12345678A` |
| `00000000` | `T` | `00000000A` |
| `99999999` | `R` | `99999999A` |
| `11111111` | `H` | `11111111A` |

**Cómo usar la tabla:**
- Para probar que un DNI válido NO genera aviso: usa el número con su letra correcta. Por ejemplo, escribe `00000000T`
- Para probar que un DNI inválido SÍ genera aviso: usa el número con la letra incorrecta. Por ejemplo, escribe `00000000A`

**Explicación:** La letra del DNI se calcula dividiendo el número entre 23. El resto de esa división determina la letra según una tabla fija. Por eso no puedes elegir la letra libremente — matemáticamente solo hay una letra válida por cada número.

---

## Checklist rápido

Marca cada prueba al completarla:

- [ ] **Requisito previo:** El campo NIF del formulario tiene una etiqueta que contiene nif, dni, cif, nie, documento, fiscal o identificación
- [ ] **Prueba 1:** La consola muestra la URL del script al ejecutar la verificación de carga
- [ ] **Prueba 2:** Al escribir `12.345.678-z` y salir del campo, se limpia automáticamente a `12345678Z`
- [ ] **Prueba 3:** Al escribir `12345678Z` y salir del campo, no aparece ningún aviso
- [ ] **Prueba 4:** Al escribir `12345678A` y salir del campo, aparece el aviso de formato incorrecto
- [ ] **Prueba 5:** Al escribir `X0000000T` y salir del campo, no aparece ningún aviso
- [ ] **Prueba 6:** Al escribir `A58818501` y salir del campo, no aparece ningún aviso

Si todas las casillas están marcadas, el validador de NIF/CIF/NIE funciona correctamente.

---

*Última actualización: abril 2026*
