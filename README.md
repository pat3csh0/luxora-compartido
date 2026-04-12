# luxora-compartido

Recursos, snippets y utilidades de uso libre para usuarios de **Luxora Digital** (white-label de GoHighLevel / GHL).

Pensado para que cualquier usuario de Luxora pueda copiar el código de este repo y pegarlo en su landing, funnel o formulario sin necesidad de saber programar.

## Herramientas disponibles

| Carpeta | Qué hace | Instalación |
|---|---|---|
| [`verificador-email/`](verificador-email/) | Detecta y corrige typos en el dominio del email (`hormail.com`, `gmail.con`, `yahoo.esr`, etc.) | [Ver README](verificador-email/README.md) |
| [`validador-telefono/`](validador-telefono/) | Limpia formato de teléfonos y avisa si faltan/sobran dígitos. Compatible con selector de países de GHL | [Ver README](validador-telefono/README.md) |
| [`validador-nif/`](validador-nif/) | Valida DNI, NIE y CIF españoles. Detecta automáticamente el campo por el label | [Ver README](validador-nif/README.md) |
| [`anti-bots/`](anti-bots/) | Honeypot invisible que bloquea bots de spam sin afectar a usuarios reales | [Ver README](anti-bots/README.md) |

## Instalación rápida

Cada herramienta se instala pegando **una sola línea** en *Settings → Tracking Code → Footer* de tu landing o funnel de Luxora/GHL:

```html
<!-- Verificador de email (elige light O dark según tu fondo) -->
<script src="https://pat3csh0.github.io/luxora-compartido/verificador-email/email-typo-checker-light.js"></script>
<script src="https://pat3csh0.github.io/luxora-compartido/verificador-email/email-typo-checker-dark.js"></script>

<!-- Validador de teléfono (elige light O dark según tu fondo) -->
<script src="https://pat3csh0.github.io/luxora-compartido/validador-telefono/validador-telefono-light.js"></script>
<script src="https://pat3csh0.github.io/luxora-compartido/validador-telefono/validador-telefono-dark.js"></script>

<!-- Validador NIF/CIF/NIE (elige light O dark según tu fondo) -->
<script src="https://pat3csh0.github.io/luxora-compartido/validador-nif/validador-nif-light.js"></script>
<script src="https://pat3csh0.github.io/luxora-compartido/validador-nif/validador-nif-dark.js"></script>

<!-- Anti-bots -->
<script src="https://pat3csh0.github.io/luxora-compartido/anti-bots/anti-bots.js"></script>
```

Puedes usar una, varias o todas a la vez. Son independientes y no interfieren entre sí.

## Changelog

Historial completo de cambios: [CHANGELOG.md](CHANGELOG.md)

## Cómo usar este repo

1. Entra en la carpeta de la herramienta que te interesa
2. Lee el `README.md` de esa carpeta (cada una tiene instrucciones específicas)
3. Copia la línea `<script src="...">` y pégala en tu Tracking Code

No necesitas clonar el repo ni saber Git. Todo está pensado para copiar/pegar.

## Licencia

Uso libre, sin garantías. Si encuentras un bug, [abre un Issue](https://github.com/pat3csh0/luxora-compartido/issues/new).
