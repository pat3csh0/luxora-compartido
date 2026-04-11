# Verificador de email para Luxora / GoHighLevel

Snippet HTML/JavaScript que detecta errores tipográficos comunes en el dominio del email cuando un usuario rellena un formulario, y le muestra una sugerencia clicable bajo el campo.

**No bloquea el envío** del formulario, solo informa, para reducir contactos inválidos en tu CRM sin añadir fricción.

## Variantes disponibles

| Archivo | Color del texto | Cuándo usarla |
|---|---|---|
| [`email-typo-checker-light.html`](email-typo-checker-light.html) | Texto **oscuro** (#1f2937) | Landings con fondo claro (blanco, beige, gris claro) |
| [`email-typo-checker-dark.html`](email-typo-checker-dark.html) | Texto **claro** (#f9fafb) | Landings con fondo oscuro (negro, gris oscuro, azul marino) |

Las dos variantes son funcionalmente idénticas, solo cambian los colores del mensaje.

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

> Tu formulario debe estar **insertado como bloque** dentro de la landing (no como iframe externo). Si está como bloque, este método funciona sin tocar nada del propio formulario.

### Paso a paso

1. Entra en *Sites → Funnels (o Sites) → tu funnel → tu landing*.
2. Pulsa el icono **⚙ Settings** (rueda dentada) arriba a la derecha.
3. Busca la sección **Tracking Code** (o "Custom Code", según versión).
4. Localiza el campo **Footer** (no Header).
5. Abre el archivo `.html` que corresponda a tu landing (light o dark).
6. **Copia el contenido entero**, incluyendo las etiquetas `<script>` y `</script>`.
7. Pégalo en el campo Footer.
8. Guarda y publica la landing.
9. Pruébalo con un email roto a propósito (ej: `test@hormail.com`) y verifica que aparece la sugerencia debajo del campo.

### Si quieres aplicarlo a TODO el funnel de una vez

En *Funnel Settings* (no en la landing individual) hay un Tracking Code global que se aplica a todas las páginas del funnel. Pega ahí el script y funcionará en todas las landings, opt-ins, thank-you pages, etc., sin tener que repetirlo.

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
