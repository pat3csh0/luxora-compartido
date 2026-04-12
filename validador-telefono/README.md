# Validador de teléfono para Luxora / GoHighLevel

Los contactos llegan al CRM con teléfonos en todo tipo de formatos: `655 38 34 94`, `0034655383494`, `(655) 383-494`, o directamente con dígitos de más o de menos. Cuando el closer llama, el número no funciona o no sabe si es español o internacional.

Este script limpia el formato automáticamente y avisa si el número parece incorrecto (dígitos de más, de menos, o formato irreconocible). Funciona con o sin el selector de países de GHL.

**No bloquea el envío.** Solo limpia y avisa.

## Qué hace exactamente

### Limpieza silenciosa (sin aviso)

El script normaliza el formato del número automáticamente al salir del campo:

| El usuario escribe | Se limpia a | Aviso |
|---|---|---|
| 655 38 34 94 | 655383494 | Ninguno |
| +34 655 383 494 | +34655383494 | Ninguno |
| (655) 383-494 | 655383494 | Ninguno |
| 655.383.494 | 655383494 | Ninguno |
| 0034655383494 | +34655383494 | Ninguno |
| 34655383494 | +34655383494 | Ninguno |
| +54 9 11 4946 5484 | +5491149465484 | Ninguno |
| +33 6 12 34 56 78 | +33612345678 | Ninguno |

### Avisos (sin bloquear)

Solo avisa cuando detecta un problema real:

| Situación | Aviso |
|---|---|
| Menos de 9 dígitos sin prefijo | "Parece que faltan dígitos" |
| Más de 9 dígitos sin prefijo internacional | "Si es un número internacional, añade + al principio" |
| Número español con dígitos de más | "Este número tiene dígitos de más (se esperan 9 para España)" |
| Número español con dígitos de menos | "Parece que faltan dígitos (se esperan 9 para España)" |
| Número demasiado corto (< 6 dígitos) | "Este número parece demasiado corto" |

### Qué NO toca (nunca avisa)

| Número | Por qué no avisa |
|---|---|
| 655383494 | 9 dígitos, empieza por 6 — móvil español válido |
| 912345678 | 9 dígitos, empieza por 9 — fijo español válido |
| +34655383494 | Prefijo +34 + 9 dígitos — correcto |
| +33612345678 | Prefijo +33 + 9 dígitos — francés válido |
| +5491149465484 | Prefijo +54 + 11 dígitos — argentino válido |
| +376613001 | Prefijo +376 + 6 dígitos — andorrano válido |

## Países soportados

Validación de longitud específica para 30+ países: España, Francia, Italia, Alemania, Reino Unido, Portugal, Países Bajos, Bélgica, Suiza, Austria, EEUU/Canadá, México, Argentina, Brasil, Chile, Colombia, Perú, Ecuador, Venezuela, Uruguay, Paraguay, Bolivia, Andorra, Gibraltar, Marruecos, Rumanía, Polonia, Ucrania, Rusia.

Para países no listados: acepta el número sin avisar (no queremos falsos positivos con formatos que no conocemos).

## Compatible con el selector de países de GHL

Si el formulario tiene activado el selector de países (intl-tel-input), el script lo detecta automáticamente y:

- No modifica el formato (intl-tel-input ya lo gestiona)
- Solo valida la longitud del número según el país seleccionado

Si el selector no está activo (campo de texto libre), el script hace la limpieza completa.

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
<script src="https://pat3csh0.github.io/luxora-compartido/validador-telefono/validador-telefono-light.js"></script>
```

**Si tu landing tiene fondo CLARO:**

```html
<script src="https://pat3csh0.github.io/luxora-compartido/validador-telefono/validador-telefono-dark.js"></script>
```

## Cómo probar que funciona

Escribe un número con espacios (ej: `655 38 34 94`) y sal del campo. El número debe limpiarse automáticamente a `655383494`. Escribe un número demasiado corto (ej: `65538`) y verás el aviso "Parece que faltan dígitos".

## Formularios en iframe

Si tu formulario se carga dentro de un **iframe** (habitual al embeber formularios de GHL en WordPress, Wix u otras webs externas), este script no puede acceder al contenido del iframe por restricciones del navegador (CORS).

**Solución:** en vez de pegar el script en la web que embebe el iframe, pégalo en el **Tracking Code del funnel que genera el formulario** (dentro de GHL: *Sites → tu funnel → Settings → Tracking Code → Footer*). Así el script se ejecuta dentro del propio iframe y tiene acceso al formulario.

## Limitaciones

- No valida que el número exista realmente (eso requeriría un servicio HLR externo)
- Para países no listados, acepta cualquier longitud (mejor no avisar que dar un falso positivo)
- En formularios con iframe externo, no puede acceder al campo del iframe

---

Mantenido por **JLM** — v1.0 · abril 2026

Uso libre. Si lo modificas y mejoras, comparte la mejora.
