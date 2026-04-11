# Verificador de email para Luxora / GoHighLevel

Snippet HTML/JavaScript que detecta errores tipográficos comunes en el dominio del email cuando un usuario rellena un formulario, y le muestra una sugerencia clicable bajo el campo.

**No bloquea el envío** del formulario, solo informa, para reducir contactos inválidos en tu CRM sin añadir fricción.

## Variantes disponibles

> **Nomenclatura:** el nombre indica **el color del texto del mensaje**, no el del fondo. Si tu landing tiene fondo oscuro, usa `light` (texto claro). Si tu landing tiene fondo claro, usa `dark` (texto oscuro).

| Archivo | Color del texto | Cuándo usarla |
|---|---|---|
| [`email-typo-checker-light.html`](email-typo-checker-light.html) / [`.js`](email-typo-checker-light.js) | Texto **claro** (#f9fafb) | Landings con fondo **oscuro** (negro, gris oscuro, azul marino) |
| [`email-typo-checker-dark.html`](email-typo-checker-dark.html) / [`.js`](email-typo-checker-dark.js) | Texto **oscuro** (#1f2937) | Landings con fondo **claro** (blanco, beige, gris claro) |

Las dos variantes son funcionalmente idénticas, solo cambian los colores del mensaje.

Cada variante existe en dos formatos: el `.html` (con etiquetas `<script>` listas para pegar) y el `.js` (solo el código, para cargarlo vía CDN — ver la sección "Opción 2" más abajo).

## Qué detecta

Cubre **~180 typos exactos** + reparación de TLDs rotos + distancia Levenshtein contra ~80 dominios conocidos. Algunos ejemplos reales:

| Email rellenado por el usuario | Sugerencia |
|---|---|
| `juan@hormail.com` | `juan@hotmail.com` |
| `juan@gmail.con` | `juan@gmail.com` |
| `juan@yahoo.esr` | `juan@yahoo.es` |
| `juan@gmail.commeil.com` | `juan@gmail.com` |
| `juan@hotmail.cominievrd` | `juan@hotmail.com` |
| `juan@gmail.com.com` | `juan@gmail.com` |
| `juan@hotmeil.com` | `juan@hotmail.com` |
| `juan@iclaud.com` | `juan@icloud.com` |
| `juan@yshoo.es` | `juan@yahoo.es` |
| `juan@gmail.com.mx` | `juan@gmail.com` (Gmail no tiene dominio de país) |

Cubre Hotmail, Gmail, Yahoo, Outlook, iCloud, Live, MSN, Proton, AOL, Telefónica, Movistar, Orange, Vodafone, GMX, Yandex, Zoho y los principales ISP españoles, europeos, americanos y latinoamericanos.

## Cómo instalarlo en una landing de Luxora / GHL

> Tu formulario debe estar **insertado como bloque** dentro de la landing (no como iframe externo). Si está como bloque, cualquiera de las dos opciones de abajo funciona sin tocar nada del propio formulario.

Tienes dos formas de instalarlo. La **Opción 2 (CDN)** es la recomendada porque recibirás mejoras automáticas cuando se actualice el repositorio sin tener que volver a copiar nada.

### Opción 1 — Copiar y pegar el código entero

1. Entra en *Sites → Funnels (o Sites) → tu funnel → tu landing*.
2. Pulsa el icono **⚙ Settings** (rueda dentada) arriba a la derecha.
3. Busca la sección **Tracking Code** (o "Custom Code", según versión).
4. Localiza el campo **Footer** (no Header).
5. Abre el archivo `.html` que corresponda a tu landing (light o dark).
6. Pulsa el botón **Raw** arriba a la derecha del visor de GitHub.
7. Selecciona todo (`Ctrl+A`) y copia (`Ctrl+C`).
8. Pega en el campo Footer de la landing.
9. Guarda y publica.

### Opción 2 — Cargar desde CDN (recomendado, una sola línea)

En lugar de pegar todo el código, pegas **una única línea** que carga el script desde jsDelivr (CDN gratuito que sirve archivos de GitHub).

#### URLs estables (recomendadas)

Estas URLs están **fijadas a una versión concreta** del verificador. Nunca cambian, son inmutables, y los CDNs las cachean indefinidamente sin riesgo de inconsistencias. **Usa estas en producción.**

**Variante LIGHT** — texto claro para landings de fondo oscuro:

```html
<script src="https://cdn.jsdelivr.net/gh/pat3csh0/luxora-compartido@56b5150/verificador-email/email-typo-checker-light.js"></script>
```

**Variante DARK** — texto oscuro para landings de fondo claro:

```html
<script src="https://cdn.jsdelivr.net/gh/pat3csh0/luxora-compartido@56b5150/verificador-email/email-typo-checker-dark.js"></script>
```

Pega solo **una** de las dos líneas (la que coincida con el color de fondo de tu landing) en *Settings → Tracking Code → **Footer*** y guarda.

> Cuando salga una versión nueva del verificador con más typos detectados, se publicará un nuevo permalink en este README. Solo tendrás que actualizar el hash en tu Tracking Code para recibir las mejoras.

#### URLs "siempre la última" (alternativa)

Si prefieres recibir las mejoras automáticamente sin tener que actualizar el hash manualmente, usa `@main` en lugar del hash:

```html
<script src="https://cdn.jsdelivr.net/gh/pat3csh0/luxora-compartido@main/verificador-email/email-typo-checker-light.js"></script>
<script src="https://cdn.jsdelivr.net/gh/pat3csh0/luxora-compartido@main/verificador-email/email-typo-checker-dark.js"></script>
```

⚠️ **Advertencia:** las URLs con `@main` pueden tardar **hasta 12 horas** en reflejar cambios recientes del repositorio porque jsDelivr cachea agresivamente las ramas mutables. Si necesitas que un cambio se vea inmediatamente (por ejemplo después de un fix urgente), usa el permalink fijo de arriba.

### Si quieres aplicarlo a TODO el funnel de una vez

En *Funnel Settings* (no en la landing individual) hay un Tracking Code global que se aplica a todas las páginas del funnel. Pega ahí el `<script src>` y funcionará en todas las landings, opt-ins, thank-you pages, etc., sin tener que repetirlo página a página.

### Cómo probar que funciona

Una vez publicada la landing, abre el formulario y escribe un email roto a propósito (por ejemplo `test@hormail.com`). Al salir del campo (`Tab` o clic fuera) debe aparecer debajo del input una línea que dice:

> ¿Quisiste decir **test@hotmail.com**? (haz clic para corregir)

Si la pulsas, el campo se autocompleta con la versión correcta.

## Limitaciones

- **No funciona con formularios embebidos como iframe en sitios externos** (ej. WordPress que carga el form de GHL via iframe). El JS del sitio anfitrión no puede acceder al iframe por CORS. En ese caso, hay que cambiar el embed a inline o usar el campo Custom JS dentro del propio Form Builder de GHL.
- No valida sintácticamente que el email exista (eso necesitaría un servicio externo tipo ZeroBounce o Abstract API).
- No bloquea el envío. Si el usuario ignora la sugerencia y manda el email roto, llegará igual al CRM (eso es intencional, para no añadir fricción).

## Cómo ampliar el diccionario

Si encuentras nuevos typos en tus contactos inválidos, ábrelo y añade entradas al objeto `TYPO_MAP`:

```js
const TYPO_MAP = {
  'tudominio.malo': 'tudominio.bueno',
  ...
};
```

O añade dominios nuevos al array `KNOWN_DOMAINS` para que la red de seguridad por distancia de edición los reconozca como válidos.

## Licencia

Uso libre. Si lo modificas y mejoras, comparte la mejora.

---

Mantenido por [@JLM](https://github.com/) — última actualización 2026-04-12.
