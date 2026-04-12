# Guía de testing — Validador de teléfono

Esta guía explica cómo comprobar que el validador de teléfono funciona correctamente en tu landing page. Está escrita para alguien que nunca ha abierto las herramientas de desarrollador del navegador. No necesitas saber programar: solo seguir los pasos exactamente como se describen.

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

Esta primera prueba confirma que el script del validador de teléfono está presente en tu página. Si el script no está instalado, ninguna de las pruebas siguientes funcionará.

### Pasos:

1. Con DevTools abierto y en la pestaña Console, haz clic en el área de escritura (donde está el `>`)
2. Copia y pega el siguiente código exactamente como aparece:

```js
document.querySelectorAll('script[src*="validador-telefono"]').forEach(function(s) { console.log('Validador teléfono cargado:', s.src); });
```

3. Pulsa **Enter**

### ¿Qué deberías ver?

**Resultado correcto:** Aparece una línea de texto con la dirección web (URL) del script, algo parecido a:
`Validador teléfono cargado: https://cdn.tudominio.com/.../validador-telefono.min.js`

**Resultado incorrecto:** No aparece nada después de pulsar Enter (la consola queda en silencio). Esto significa que el script no está instalado en el Tracking Code de la página. Contacta con quien instaló el script para que lo añada al Código de seguimiento del cuerpo (Footer) del embudo en GHL.

---

## Prueba 2 — Limpieza silenciosa de espacios en el número

Esta prueba verifica que si alguien escribe el teléfono con espacios entre los grupos de números (como se hace habitualmente en España: `655 38 34 94`), el script elimina los espacios automáticamente cuando el usuario sale del campo. El usuario no ve ningún aviso — simplemente el número queda limpio.

Esta limpieza es importante porque algunos sistemas esperan el número sin espacios para procesarlo correctamente.

### Pasos:

1. Ve al formulario de tu landing page
2. Haz clic en el campo de teléfono (el recuadro donde se escribe el número de teléfono)
3. Escribe exactamente: `655 38 34 94`
   - Hay un espacio después del `655`, otro después del `38` y otro después del `34`
   - Escríbelo tal cual, con todos los espacios
4. Ahora sal del campo pulsando la tecla **Tab** (la tecla con dos flechas, normalmente a la izquierda del teclado, sobre Bloq Mayús)
   - También puedes hacer clic en cualquier otro campo del formulario o en un área vacía

### ¿Qué deberías ver?

**Resultado correcto:** En cuanto el foco sale del campo de teléfono, el número cambia automáticamente de `655 38 34 94` a `655383494` — sin espacios. No aparece ningún aviso ni mensaje. El cambio es silencioso e instantáneo.

**Resultado incorrecto:** El campo mantiene los espacios. El script de limpieza no está funcionando.

---

## Prueba 3 — Normalización del prefijo internacional

Esta prueba verifica que si alguien escribe el prefijo de España de forma antigua (`0034` en lugar de `+34`), el script lo convierte al formato internacional estándar con el símbolo más (`+34`).

Muchas personas mayores o que llaman desde ciertos sistemas escriben `0034` antes del número. El validador lo convierte al formato correcto automáticamente.

### Pasos:

1. Haz clic en el campo de teléfono
2. Borra lo que hubiera (selecciona todo con **Ctrl + A** y luego pulsa la tecla **Supr** o **Retroceso**)
3. Escribe exactamente: `0034655383494`
   - Empieza con `0034` (cero, cero, tres, cuatro) seguido del número sin espacios
4. Sal del campo pulsando **Tab** o haciendo clic en otro lugar

### ¿Qué deberías ver?

**Resultado correcto:** El campo cambia automáticamente de `0034655383494` a `+34655383494`. El `0034` se convierte en `+34`. No aparece ningún aviso.

**Resultado incorrecto:** El campo mantiene el `0034` sin convertirlo. El script de normalización no está funcionando.

---

## Prueba 4 — Aviso cuando faltan dígitos

Esta prueba verifica que si alguien escribe un número de teléfono incompleto (muy corto), el script muestra un aviso amigable informando de que parece que faltan dígitos. Así el usuario puede corregirlo antes de enviar el formulario.

### Pasos:

1. Haz clic en el campo de teléfono
2. Borra lo que hubiera (Ctrl + A y Supr)
3. Escribe exactamente: `65538`
   - Son solo 5 dígitos — claramente un número incompleto
4. Sal del campo pulsando **Tab** o haciendo clic en otro lugar

### ¿Qué deberías ver?

**Resultado correcto:** Aparece un texto pequeño debajo del campo de teléfono que dice algo como:
`"Parece que faltan dígitos"`

El texto aparece en un color llamativo (puede ser naranja, rojo o el color de error de tu diseño) para que el usuario lo note.

**Resultado incorrecto:** No aparece ningún aviso. El script no está detectando el número incompleto.

---

## Prueba 5 — Aviso cuando el número español empieza por un dígito no válido

Esta prueba verifica que si alguien escribe un número de 9 dígitos que empieza por `3` (o cualquier dígito que no sea 6, 7, 8 o 9), el script muestra un aviso. En España, los teléfonos móviles y muchos fijos empiezan por 6, 7, 8 o 9 — empezar por 3 sería inválido para el contexto español.

### Pasos:

1. Haz clic en el campo de teléfono
2. Borra lo que hubiera (Ctrl + A y Supr)
3. Escribe exactamente: `312345678`
   - Son 9 dígitos, que es la longitud correcta de un teléfono español, pero empieza por `3`
4. Sal del campo pulsando **Tab** o haciendo clic en otro lugar

### ¿Qué deberías ver?

**Resultado correcto:** Aparece un texto debajo del campo que dice algo como:
`"Los números españoles empiezan por 6, 7, 8 o 9"`

Esto ayuda al usuario a darse cuenta del error antes de enviar el formulario.

**Resultado incorrecto:** No aparece ningún aviso. El validador no está comprobando el dígito inicial.

---

## Prueba 6 — Número internacional válido no genera ningún aviso

Esta prueba verifica que el script no molesta a usuarios que escriben un número de teléfono extranjero perfectamente válido. Si alguien de Francia escribe su número con el prefijo `+33`, el script debe aceptarlo sin generar ningún aviso.

### Pasos:

1. Haz clic en el campo de teléfono
2. Borra lo que hubiera (Ctrl + A y Supr)
3. Escribe exactamente: `+33612345678`
   - Es el prefijo de Francia (`+33`) seguido de un número de 9 dígitos
   - Para escribir el símbolo `+`, mantén pulsada la tecla **Mayúsculas** y pulsa el `+` de tu teclado (puede estar en diferentes lugares según el teclado)
4. Sal del campo pulsando **Tab** o haciendo clic en otro lugar

### ¿Qué deberías ver?

**Resultado correcto:** No aparece ningún aviso debajo del campo. El número se mantiene exactamente como lo escribiste: `+33612345678`. El validador reconoce que es un número internacional con prefijo y no intenta validarlo con las reglas españolas.

**Resultado incorrecto:** Aparece un aviso de error para un número perfectamente válido. Esto sería un falso positivo que puede frustrar a usuarios de otros países.

---

## Prueba 7 — Número español válido no genera ningún aviso

Esta prueba verifica que un número de teléfono español completamente correcto no genera ningún aviso ni modificación inesperada.

### Pasos:

1. Haz clic en el campo de teléfono
2. Borra lo que hubiera (Ctrl + A y Supr)
3. Escribe exactamente: `655383494`
   - Son 9 dígitos, empieza por 6 — un móvil español perfectamente válido
4. Sal del campo pulsando **Tab** o haciendo clic en otro lugar

### ¿Qué deberías ver?

**Resultado correcto:** No aparece ningún aviso. El campo mantiene el número `655383494` tal como se escribió. Sin mensajes, sin cambios inesperados.

**Resultado incorrecto:** Aparece algún aviso o el número cambia de forma inesperada. Si ocurre esto, hay un problema con la lógica del validador.

---

## Resumen de comportamientos esperados

Esta tabla resume de un vistazo lo que debería pasar en cada caso:

| Qué escribes en el campo | Qué ocurre al salir del campo | ¿Aparece aviso? |
|---|---|---|
| `655 38 34 94` (con espacios) | Se convierte en `655383494` | No |
| `0034655383494` (prefijo antiguo) | Se convierte en `+34655383494` | No |
| `65538` (número corto) | No cambia | Sí: "Parece que faltan dígitos" |
| `312345678` (empieza por 3) | No cambia | Sí: "Los números españoles empiezan por 6, 7, 8 o 9" |
| `+33612345678` (número francés) | No cambia | No |
| `655383494` (móvil español válido) | No cambia | No |

---

## Checklist rápido

Marca cada prueba al completarla:

- [ ] **Prueba 1:** La consola muestra la URL del script al ejecutar la verificación de carga
- [ ] **Prueba 2:** Al escribir `655 38 34 94` y salir del campo, el número se limpia a `655383494` sin aviso
- [ ] **Prueba 3:** Al escribir `0034655383494` y salir del campo, se convierte a `+34655383494` sin aviso
- [ ] **Prueba 4:** Al escribir `65538` y salir del campo, aparece el aviso "Parece que faltan dígitos"
- [ ] **Prueba 5:** Al escribir `312345678` y salir del campo, aparece el aviso sobre el dígito inicial
- [ ] **Prueba 6:** Al escribir `+33612345678` y salir del campo, no aparece ningún aviso
- [ ] **Prueba 7:** Al escribir `655383494` y salir del campo, no aparece ningún aviso

Si todas las casillas están marcadas, el validador de teléfono funciona correctamente.

---

*Última actualización: abril 2026*
