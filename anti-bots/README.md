# Anti-bots para Luxora / GoHighLevel

Los bots de spam rellenan formularios automáticamente y crean contactos basura en tu CRM: nombres como "Hjkvd", "Ssdd", emails como `hbb@hjk.com`, `dfg@gmail.com`. Cada uno ocupa espacio, distorsiona métricas y recibe emails que dañan tu reputación de envío.

Este script protege tus formularios con un **honeypot invisible**: un campo oculto que los humanos no ven y no rellenan, pero los bots sí rellenan automáticamente. Si el campo tiene valor al enviar, el script cancela el envío silenciosamente. GHL no recibe nada, no se crea contacto.

**No afecta a usuarios reales.** Es físicamente imposible que un humano rellene un campo invisible. No hay captcha, no hay preguntas, no hay fricción.

## Cómo funciona

El anti-bot tiene **dos capas de detección**, ambas silenciosas y sin fricción para humanos reales:

### Capa 1 · Honeypot invisible

1. Inyecta un campo de texto en cada formulario con geometría real (200×40 px) pero clip-eado por un ancestro con `height:0; overflow:hidden`
2. El bot ve un input "visible" (`getBoundingClientRect` devuelve rectángulo no-cero, `offsetParent` no es null) y lo rellena automáticamente
3. El humano no lo ve porque está clip-eado fuera del flujo visible
4. Si el campo tiene valor al enviar (o fue rellenado antes y luego limpiado), se cancela el envío silenciosamente

### Capa 2 · Interacción humana requerida

1. El script escucha los primeros eventos de interacción real en la página: `pointerdown`, `touchstart`, `keydown`, `mousemove`, `focusin`
2. Cualquier usuario humano dispara al menos uno antes de enviar (mover el ratón, tocar la pantalla, pulsar una tecla, o que el navegador haga focus por autofill)
3. Los bots que hacen `form.submit()` o `fetch()` programáticamente sin simular interacción no disparan ninguno
4. Si el submit ocurre sin interacción previa, se cancela silenciosamente. Hay un *grace period* de 50ms para cubrir races con autofill

El bot no recibe ningún mensaje de error. GHL no recibe datos. No hay workflow ejecutado.

## Técnicas anti-detección

| Técnica | Qué hace |
|---|---|
| Honeypot con geometría real (v1.1) | Input 200×40 px clip-eado por ancestro. `getBoundingClientRect` devuelve tamaño no-cero → bots que chequean visibilidad por geometría piensan que es visible y lo rellenan |
| No usa `display:none` | Los bots más listos ignoran campos con `display:none` |
| Nombres de campo realistas | El campo se llama `website`, `url`, `company_url`, `homepage` o `site_url` (elegido aleatoriamente). Parecen campos reales |
| Flag `wasTouched` irrevocable | Si un bot rellena el campo y luego lo limpia antes de enviar, el script sigue bloqueando. El flag se activa al primer `input`/`change` y no se puede desactivar |
| Detección de interacción humana (v1.1) | Submit requiere al menos un evento `pointerdown`/`touchstart`/`keydown`/`mousemove`/`focusin` previo. Bots puramente programáticos fallan aquí |
| Grace period 50ms (v1.1) | Cubre race conditions con autofill y focus automático del navegador: si la interacción llega 50ms tarde, el submit se re-dispara automáticamente |
| `tabIndex=-1` | El campo no es accesible por teclado (Tab), así que un humano con discapacidad visual que navega con teclado tampoco lo rellena |
| `autocomplete=off` | Evita que el autocompletado del navegador lo rellene |
| `aria-hidden=true` | Los lectores de pantalla lo ignoran |
| `pointer-events:none` | Si un humano hiciera clic donde está el campo clip-eado, no lo activaría |
| Intercepta submit + click | Cubre tanto el evento `submit` del formulario como el `click` del botón (GHL a veces no usa `<form>` estándar) |

## Qué bots NO bloquea

Este honeypot bloquea bots que **ejecutan JavaScript** y rellenan campos del DOM (headless Chrome, Selenium, Puppeteer, etc.).

No bloquea bots que envían peticiones HTTP directas (POST) sin cargar la página. Contra esos, GHL ya tiene protección server-side (validación de sesión, reCAPTCHA interno). El honeypot cubre la otra mitad del problema.

Para un desglose detallado con porcentajes estimados por tipo de bot y cuándo
conviene añadir capas extra (Turnstile, reCAPTCHA), lee [EFFECTIVENESS.md](EFFECTIVENESS.md).

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

## Formularios en iframe

Si tu formulario se carga dentro de un **iframe** (habitual al embeber formularios de GHL en WordPress, Wix u otras webs externas), este script no puede acceder al contenido del iframe por restricciones del navegador (CORS).

**Solución:** en vez de pegar el script en la web que embebe el iframe, pégalo en el **Tracking Code del funnel que genera el formulario** (dentro de GHL: *Sites → tu funnel → Settings → Tracking Code → Footer*). Así el script se ejecuta dentro del propio iframe y tiene acceso al formulario.

## Limitaciones

- **Solo formularios en la misma página:** si el formulario está en un iframe externo, el script no puede inyectar el honeypot dentro del iframe
- **No bloquea bots HTTP directos:** solo bots que cargan JavaScript (la mayoría de los bots de spam modernos)
- **Usuarios con autocompletado agresivo:** el campo tiene `autocomplete=off`, pero algunos navegadores lo ignoran. Si el navegador autocompletara el campo honeypot, bloquearía al usuario legítimo. En la práctica esto no ocurre porque el campo está fuera de pantalla y el navegador no lo incluye en el autocompletado

---

Mantenido por **JLM** — v1.0 · abril 2026

Uso libre. Si lo modificas y mejoras, comparte la mejora.
