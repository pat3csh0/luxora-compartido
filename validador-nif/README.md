# Validador de NIF/CIF/NIE para Luxora / GoHighLevel

Si en tu embudo pides DNI, NIF, CIF o NIE (para presupuestos, altas de cliente, facturación), los usuarios escriben en formatos imposibles: sin letra, con espacios, con guiones, con O en vez de 0, o directamente un número inventado. El dato llega mal al CRM y no puedes facturar sin verificarlo manualmente.

Este script valida el documento **en el formulario**, antes de que llegue al CRM. Limpia el formato automáticamente y avisa si el documento no es correcto.

**No bloquea el envío.** Solo limpia y avisa. **No sugiere la letra correcta** (no podemos saber qué número quiso escribir el usuario, solo que el actual no cuadra).

## Qué hace exactamente

### Limpieza silenciosa (sin aviso)

Al salir del campo, el script normaliza el formato automáticamente:

| El usuario escribe | Se limpia a |
|---|---|
| 12.345.678-z | 12345678Z |
| 12 345 678 Z | 12345678Z |
| x-1234567-l | X1234567L |
| b/86561412 | B86561412 |
| 12345678z | 12345678Z |

### Aviso cuando el documento no es correcto

Si la letra de control no coincide con el algoritmo oficial, muestra un aviso genérico:

> "Revisa tu DNI — el formato no parece correcto"

No dice cuál debería ser la letra correcta (porque si el usuario se equivocó en un dígito, la letra correcta sería diferente y la sugerencia sería errónea).

### Tipos de documento soportados

| Tipo | Formato | Ejemplo | Validación |
|---|---|---|---|
| **DNI** | 8 dígitos + letra | 12345678Z | Letra = número mod 23 → tabla TRWAGMYFPDXBNJZSQVHLCKE |
| **NIE** | X/Y/Z + 7 dígitos + letra | X1234567L | Convierte X=0, Y=1, Z=2, luego mismo algoritmo que DNI |
| **CIF** | Letra + 7 dígitos + control | B86561412 | Algoritmo de suma pares/impares con control dígito o letra según tipo de sociedad |

### Detección automática del campo

El script encuentra automáticamente el campo de NIF en tu formulario buscando en el texto del label. No necesitas configurar nada. Busca estas palabras:

`nif`, `cif`, `dni`, `nie`, `documento`, `fiscal`, `identificación`, `tax id`, `vat`

Si el label de tu campo personalizado contiene alguna de estas palabras, el validador se engancha automáticamente.

Si prefieres marcar el campo manualmente, añade `data-nif="true"` al input.

## Qué NO valida

| Situación | Qué pasa |
|---|---|
| Documento extranjero (pasaporte, etc.) | No avisa — no es un documento español |
| Campo vacío | No avisa — el campo no es obligatorio para el validador |
| Texto muy corto (< 7 caracteres) | No avisa — podría ser otra cosa que no sea un documento |

## Variantes disponibles

Hay dos variantes, elige la que se adapte al color de fondo de tu landing:

| Variante | Color del texto de aviso | Cuándo usarla |
|---|---|---|
| **light** | Texto claro (ámbar claro) | Landings con fondo **oscuro** |
| **dark** | Texto oscuro (ámbar oscuro) | Landings con fondo **claro** |

## Instalación

Pega **una** de las dos líneas en *Settings → Tracking Code → Footer* de tu landing o funnel:

**Si tu landing tiene fondo OSCURO:**

```html
<script src="https://pat3csh0.github.io/luxora-compartido/validador-nif/validador-nif-light.js"></script>
```

**Si tu landing tiene fondo CLARO:**

```html
<script src="https://pat3csh0.github.io/luxora-compartido/validador-nif/validador-nif-dark.js"></script>
```

## Cómo probar que funciona

1. Crea un campo personalizado en tu formulario de GHL con un label que contenga "DNI", "NIF" o similar
2. Escribe un DNI con formato sucio (ej: `12.345.678-z`) → se limpia automáticamente a `12345678Z`
3. Escribe un DNI con letra incorrecta (ej: `12345678A`) → aparece el aviso "Revisa tu DNI — el formato no parece correcto"
4. Escribe un DNI correcto (ej: `12345678Z`) → no aparece ningún aviso

Para verificar que un DNI es correcto: divide los 8 dígitos entre 23 y busca el resto en la tabla `TRWAGMYFPDXBNJZSQVHLCKE`. Posición 0=T, 1=R, 2=W...

## Formularios en iframe

Si tu formulario se carga dentro de un **iframe** (habitual al embeber formularios de GHL en WordPress, Wix u otras webs externas), este script no puede acceder al contenido del iframe por restricciones del navegador (CORS).

**Solución:** en vez de pegar el script en la web que embebe el iframe, pégalo en el **Tracking Code del funnel que genera el formulario** (dentro de GHL: *Sites → tu funnel → Settings → Tracking Code → Footer*). Así el script se ejecuta dentro del propio iframe y tiene acceso al formulario.

## Limitaciones

- **Solo documentos españoles:** DNI, NIE y CIF. No valida pasaportes, documentos de otros países ni otros formatos
- **No verifica contra bases de datos oficiales:** solo comprueba que el formato y la letra de control sean correctos matemáticamente
- **El campo debe tener un label identificable:** si el label no contiene ninguna de las keywords buscadas, el validador no se engancha
- No funciona con formularios en iframe externo

---

Mantenido por **JLM** — v1.0 · abril 2026

Uso libre. Si lo modificas y mejoras, comparte la mejora.
