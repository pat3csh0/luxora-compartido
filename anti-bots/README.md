# Anti-bots para Luxora / GoHighLevel

Los bots de spam rellenan formularios automáticamente y crean contactos basura en tu CRM: nombres como "Hjkvd", "Ssdd", emails como `hbb@hjk.com`, `dfg@gmail.com`. Cada uno ocupa espacio, distorsiona métricas y recibe emails que dañan tu reputación de envío.

Este script protege tus formularios con un **honeypot invisible**: un campo oculto que los humanos no ven y no rellenan, pero los bots sí rellenan automáticamente. Si el campo tiene valor al enviar, el script cancela el envío silenciosamente. GHL no recibe nada, no se crea contacto.

**No afecta a usuarios reales.** Es físicamente imposible que un humano rellene un campo invisible. No hay captcha, no hay preguntas, no hay fricción.

## Cómo funciona

1. El script inyecta un campo de texto invisible dentro de cada formulario de la página
2. El campo está oculto con CSS (posición fuera de pantalla, sin opacidad, sin tamaño) pero sigue presente en el DOM
3. Los bots lo detectan como un campo normal y lo rellenan automáticamente
4. Al enviar el formulario, el script comprueba si el campo tiene valor:
   - **Vacío** (humano) → el formulario se envía normalmente
   - **Con valor** (bot) → se cancela el envío. GHL no recibe nada

El bot no recibe ningún mensaje de error (para no darle pistas de que fue detectado).

## Técnicas anti-detección

Los bots más avanzados intentan detectar y evitar honeypots. Este script usa varias técnicas para dificultarlo:

| Técnica | Qué hace |
|---|---|
| No usa `display:none` | Los bots más listos ignoran campos con `display:none`. En su lugar, el campo se oculta con `position:absolute` + `left:-9999px` + `opacity:0` + `overflow:hidden` |
| Nombres de campo realistas | El campo se llama `website`, `url`, `company_url`, `homepage` o `site_url` (elegido aleatoriamente). Parecen campos reales |
| `tabIndex=-1` | El campo no es accesible por teclado (Tab), así que un humano con discapacidad visual que navega con teclado tampoco lo rellena |
| `autocomplete=off` | Evita que el autocompletado del navegador lo rellene |
| `aria-hidden=true` | Los lectores de pantalla lo ignoran |
| Intercepta submit + click | Cubre tanto el evento `submit` del formulario como el `click` del botón (GHL a veces no usa `<form>` estándar) |

## Qué bots NO bloquea

Este honeypot bloquea bots que **ejecutan JavaScript** y rellenan campos del DOM (headless Chrome, Selenium, Puppeteer, etc.).

No bloquea bots que envían peticiones HTTP directas (POST) sin cargar la página. Contra esos, GHL ya tiene protección server-side (validación de sesión, reCAPTCHA interno). El honeypot cubre la otra mitad del problema.

## Instalación

Pega esta línea en *Settings → Tracking Code → Footer* de tu landing o funnel:

```html
<script src="https://pat3csh0.github.io/luxora-compartido/anti-bots/anti-bots.js"></script>
```

Funciona en todas las páginas del funnel si lo pegas en *Funnel Settings* en lugar de la landing individual.

## Cómo probar que funciona

1. Abre las herramientas de desarrollador del navegador (F12)
2. En la pestaña "Elements", busca un `<input>` con name `website` (o similar) dentro de un `<div>` con `position:absolute; left:-9999px`
3. Escribe algo manualmente en ese campo oculto (desde la consola: `document.querySelector('#hp_website').value = 'test'`)
4. Intenta enviar el formulario — no debe enviarse

## Limitaciones

- **Solo formularios en la misma página:** si el formulario está en un iframe externo, el script no puede inyectar el honeypot dentro del iframe
- **No bloquea bots HTTP directos:** solo bots que cargan JavaScript (la mayoría de los bots de spam modernos)
- **Usuarios con autocompletado agresivo:** el campo tiene `autocomplete=off`, pero algunos navegadores lo ignoran. Si el navegador autocompletara el campo honeypot, bloquearía al usuario legítimo. En la práctica esto no ocurre porque el campo está fuera de pantalla y el navegador no lo incluye en el autocompletado

---

Mantenido por **JLM** — v1.0 · abril 2026

Uso libre. Si lo modificas y mejoras, comparte la mejora.
