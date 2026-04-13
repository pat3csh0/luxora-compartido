# Changelog

Todos los cambios relevantes de este proyecto se documentan aquí.

Formato basado en [Keep a Changelog](https://keepachangelog.com/es/1.0.0/).

---

## [v4.4.0] — 2026-04-13

### Anti-bots v1.1 — defensas contra bots con check de visibilidad real
- **Honeypot con geometría visible pero clip-eado**: cambio de `position:absolute; left:-9999px` (geometría 0×0, fácil de detectar) a wrapper `height:0; overflow:hidden` con input dentro `width:200px; height:40px`. `getBoundingClientRect()` devuelve rectángulo no-cero, engañando a bots que chequean visibilidad por geometría. Humanos no lo ven porque el ancestro lo clip-ea.
- **Detección de interacción humana**: el submit solo se permite si hubo al menos un evento `pointerdown`, `touchstart`, `keydown`, `mousemove` o `focusin` previo. Bloquea bots que llaman `form.submit()` o `fetch()` programáticamente sin simular interacción.
- **Grace period 50ms**: si el submit llega antes que la interacción (race con autofill/focus automático), espera 50ms y reintenta. Cubre casos extremos sin afectar la UX humana.
- Click handler también checkea interacción (sin grace, los clics humanos vienen siempre precedidos de pointerdown).
- `guardForm` refactorizado para detectar botones renderizados tardíamente por el builder GHL.

### Anti-bots-tester v0.3
- Compatible con anti-bots v1.1: dispara un `pointerdown` sintético antes de cada intento de submit para que el QA no falle por el nuevo check de interacción.

### EFFECTIVENESS.md actualizado
- Estimación de bloqueo sube de ~85-95% (v1.0) a ~90-98% (v1.1).
- Tabla de mejoras frente a Niveles 2-3 ahora bloqueados parcialmente por la nueva capa.

---

## [v4.3.1] — 2026-04-13

### Anti-bots: quitar API de debug por seguridad
- **Breaking para tester**: se elimina `window.__antiBotDebug` y el atributo `data-antibot-debug`. Exponer el estado interno creaba un oráculo que un atacante podría usar para probar bypasses en bucle. Ahora el anti-bot no expone ningún API externo.
- Si tenías `data-antibot-debug` en tu Tracking Code, quítalo. No es necesario y ya no hace nada.

### Anti-bots-tester (v0.2)
- Refactor a **observación conductual**: el tester ya no interroga al anti-bot, observa el comportamiento externo del submit.
- Trackea localmente qué forms rellenó (WeakMap interno) para mostrar "Rellenado en sesión: sí/no" en lugar del antiguo `wasTouched`.
- El flujo QA y los botones son idénticos; solo cambia que la info aparece tras "Intentar enviar" en vez de en una columna live.

### Nuevo documento
- `anti-bots/EFFECTIVENESS.md`: estimaciones empíricas de % de bots bloqueados por categoría, cuándo escalar a Turnstile/reCAPTCHA, tabla coste/valor de capas adicionales.

---

## [v4.3.0] — 2026-04-13

### Nueva herramienta: Anti-bots Tester (v0.1)
- Bookmarklet que inyecta un panel flotante en cualquier landing para verificar visualmente que el anti-bot está funcionando
- Detecta el campo honeypot, permite rellenarlo, limpiarlo e intentar envíos simulados sin tocar consola
- Soporta formularios nativos, contenedores builder GHL y popups (selector dinámico)
- Atajos de teclado (D/R/L/Esc), historial de acciones, panel arrastrable y minimizable
- Accesibilidad WCAG 2.1 AA (navegación por teclado, ARIA, contraste, no-color-only)
- Persistencia en sessionStorage para sobrevivir al reload y completar el flujo end-to-end

### Anti-bots (v1.0 → v1.0 + debug API)
- **Nuevo:** atributo `data-antibot-debug` en el `<script>` expone `window.__antiBotDebug` (read-only) con `listForms()`, `getState()` e `isBotDetected()`. Permite al tester leer el flag `wasTouched` en vivo. Sin el atributo, el tester funciona igual pero sin visibilidad del flag interno.

---

## [v4.2.0] — 2026-04-12

### Verificador de email
- **Nuevo:** sanitización silenciosa de emails — quita espacios, caracteres invisibles (zero-width space, non-breaking space, tabs) y convierte a minúsculas automáticamente antes de validar
- La sanitización se aplica tanto en tiempo real (capa 1) como al pulsar el botón de envío (capa 2)
- Emails como `  Juan@Gmail.COM  ` o `juan @ gmail.com` se limpian automáticamente sin aviso

### Nuevas herramientas

#### Anti-bots (v1.0)
- Honeypot invisible que bloquea bots de spam sin afectar a usuarios reales
- Campo oculto con técnicas anti-detección (no usa `display:none`, usa combinación de `position`, `overflow`, `opacity`, `z-index`)
- Nombres de campo aleatorios entre 5 variantes para evitar blacklisting
- Intercepta `submit` + `click` con `useCapture=true`

#### Validador de teléfono (v1.0)
- Limpieza silenciosa de formato: espacios, guiones, paréntesis, puntos
- Normalización automática: `0034` → `+34`, `34xxx` → `+34xxx`
- Validación de longitud por país (30+ países con reglas específicas)
- Compatible con el selector de países de GHL (intl-tel-input)
- Solo avisa cuando faltan/sobran dígitos, nunca con números válidos

#### Validador NIF/CIF/NIE (v1.0)
- Valida DNI (8 dígitos + letra de control mod 23)
- Valida NIE (X/Y/Z + 7 dígitos + letra)
- Valida CIF (letra + 7 dígitos + control dígito/letra)
- Detección automática del campo por keywords del label
- Limpieza silenciosa: quita puntos, guiones, espacios; convierte a mayúsculas
- Aviso genérico sin sugerir la letra correcta

---

## [v4.1.0] — 2026-04-12

### Verificador de email
- **Nuevo:** sugerencia en tiempo real mientras el usuario escribe (debounce 400ms)
- **Nuevo:** autocorrección silenciosa al pulsar el botón de envío (antes de que GHL procese el formulario)
- Solo activa la sugerencia en tiempo real cuando hay 2+ caracteres tras el último punto (evita sugerencias prematuras con `.co`)
- El submit guard se engancha con `useCapture=true` y reintenta 3 veces (0ms, 500ms, 1500ms) para cubrir el renderizado asíncrono de GHL

---

## [v4.0.0] — 2026-04-12

### Verificador de email
- **Nuevo:** algoritmo Sift3 reemplaza Levenshtein (O(n), mejor con transposiciones)
- **Nuevo:** SLD+TLD split matching inspirado en Mailcheck.js — detecta errores compuestos como `hormail.org`
- **Nuevo:** multi-segment strip — detecta `gmail.con.com`, `hotmail.con.com`
- TYPO_MAP completado: añadidas variantes `.comm` para todos los proveedores
- Garbage tail ahora actúa sobre dominio post-TLD-fix además de raw

---

## [v3.0.0] — 2026-04-12

### Verificador de email
- Primera release pública
- ~180 typos exactos extraídos de CSVs reales de contactos inválidos de Luxora
- Garbage tail stripping: detecta dominios con basura tras un root conocido
- Reparación de TLDs rotos (.con→.com, .esr→.es, .nett→.net, .ogr→.org)
- Distancia Levenshtein como red de seguridad contra ~80 dominios conocidos
- Dos variantes de color: light (texto claro) y dark (texto oscuro)
- Servido vía GitHub Pages con auto-actualización
