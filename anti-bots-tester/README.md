# anti-bots-tester

Tester visual (bookmarklet + panel flotante) para verificar que el script
[anti-bots.js](../anti-bots/anti-bots.js) está correctamente instalado en una
landing de GHL y bloquea envíos automáticos.

Sin consola, sin instalación, sin backend. Todo sucede en el navegador del usuario.

## Estructura

```
anti-bots-tester/
  index.html          # Landing publica con el bookmarklet arrastrable
  tester.js           # Core del panel flotante (CSS inline)
  bookmarklet.js      # Version legible del loader del bookmarklet
  test-fixtures.html  # Pagina local con 3 patrones GHL para QA
  README.md
```

## Publicación

Se sirve desde GitHub Pages, igual que el resto de `luxora-compartido`:

- Landing: `https://pat3csh0.github.io/luxora-compartido/anti-bots-tester/`
- Core: `https://pat3csh0.github.io/luxora-compartido/anti-bots-tester/tester.js`

El `href` del bookmarklet en `index.html` se construye en tiempo de ejecución a
partir del `window.location.origin` de la página — así también funciona si el
repo se sirve desde otro host (por ejemplo un mirror o un preview).

## Uso

1. Entrar en la landing.
2. Arrastrar el botón *Tester anti-bot* a la barra de marcadores.
3. Navegar a la landing GHL a verificar (con `anti-bots.js` ya instalado).
4. Clicar el marcador → aparece el panel.
5. Flujo de verificación sugerido:
   - **Detectar** → confirma que el honeypot existe.
   - **Rellenar** → simula un bot.
   - **Intentar enviar** → debe quedar BLOQUEADO.
   - **Recargar** → reset de `wasTouched`.
   - **Intentar enviar** sin rellenar → debe quedar PERMITIDO.

## Cómo lee el estado

El tester **no interroga al anti-bot** — observa el comportamiento externo:

- Lee del DOM: el nombre del campo honeypot (`data-honeypot-field`), su valor
  actual, y si el form está guardado (`data-honeypot-guarded`).
- Trackea localmente qué forms fueron rellenados por el propio tester en esta
  sesión. Cuando informa *"Rellenado en sesión: sí"*, es porque tú lo hiciste
  desde aquí, no porque lo haya consultado al anti-bot.
- Para saber si un submit sería bloqueado: dispara un intento de submit real
  y mira si el evento sobrevive al guard del anti-bot. Si no sobrevive → fue
  bloqueado. Si sobrevive → fue permitido.

Esta aproximación conductual es intencional: el anti-bot **no expone ningún
API interno de debug** (decisión de seguridad). Si lo expusiera, un atacante
podría usar ese API como oráculo para probar técnicas de bypass en bucle.

## QA local

Abrir `test-fixtures.html` directamente con un servidor estático (los MutationObservers
pueden comportarse raro con `file://`):

```bash
npx serve .
# o
python -m http.server 8000
```

Contiene los tres patrones que soporta el anti-bot:

1. `<form>` nativo.
2. Contenedor builder GHL (`.ghl-form-wrap` sin `<form>`).
3. Popup (`.hl_main_popup` + `.popup-body`).

El tester se carga automáticamente en esta página para facilitar el ciclo de pruebas.

## Seguridad

- El tester **no envía datos** a ningún servidor. Todo el DOM manipulation ocurre
  en el navegador del usuario.
- El toggle *"Permitir submit real"* está **apagado por defecto**. Los intentos
  de envío se interceptan en fase bubble y se cancelan antes de que el formulario
  alcance el endpoint real.
- El HTML que se renderiza en el panel (nombres de campo, valores, labels) pasa
  por `esc()` para evitar XSS si una página maliciosa maquilla atributos.
- CSS aislado con `all:initial` en el contenedor raíz y prefijos `.abt-*` para
  resistir estilos del host.

## Accesibilidad

- Navegable por teclado: `Tab` para recorrer controles, atajos `D` / `R` / `L`
  / `Enter`, `Esc` cierra el panel.
- Roles ARIA: `role="dialog"` en el panel, `aria-live="polite"` en estado e
  historial, `aria-label` en todos los controles sin texto visible.
- No usa solo color para transmitir estado (iconos ✓ / ✗ / ⚠ + texto).
- Respeta `prefers-reduced-motion`.
- Contraste AA en tema oscuro del panel.

## Versión

v0.1 — 2026-04-13 · JLM
