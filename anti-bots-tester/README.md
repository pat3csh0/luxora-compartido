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

## Modo debug del anti-bot (opcional pero recomendado)

Para leer el flag interno `wasTouched` en vivo desde el panel, añade el
atributo `data-antibot-debug` al script del anti-bot:

```html
<script src="https://pat3csh0.github.io/luxora-compartido/anti-bots/anti-bots.js"
        data-antibot-debug></script>
```

Esto expone `window.__antiBotDebug` con una API read-only:

```js
window.__antiBotDebug.version        // "1.0"
window.__antiBotDebug.listForms()    // Array<HTMLElement>
window.__antiBotDebug.getState(form) // { fieldName, value, wasTouched, guarded }
window.__antiBotDebug.isBotDetected(form) // boolean
```

Sin el atributo, el tester sigue funcionando pero el campo `wasTouched` aparece
como *desconocido* (no afecta a la funcionalidad, solo al reporte visual).

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
