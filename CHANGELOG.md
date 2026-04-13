# Changelog

Todos los cambios relevantes de este proyecto se documentan aquí.

Formato basado en [Keep a Changelog](https://keepachangelog.com/es/1.0.0/).

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
