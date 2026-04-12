# URLs del verificador de email — v3.0.0

Copia la línea que corresponda y pégala en **Settings → Tracking Code → Footer** de tu landing o funnel de Luxora / GHL.

---

## Texto CLARO (para landings con fondo oscuro)

Auto-actualizable (recomendada):
```html
<script src="https://cdn.jsdelivr.net/gh/pat3csh0/luxora-compartido@main/verificador-email/email-typo-checker-light.js"></script>
```

Auto-actualizable minificada (~40% más ligera):
```html
<script src="https://cdn.jsdelivr.net/gh/pat3csh0/luxora-compartido@main/verificador-email/email-typo-checker-light.min.js"></script>
```

Versión fija v3.0.0 (no recibe mejoras, no cambia nunca):
```html
<script src="https://cdn.jsdelivr.net/gh/pat3csh0/luxora-compartido@v3.0.0/verificador-email/email-typo-checker-light.js"></script>
```

---

## Texto OSCURO (para landings con fondo claro)

Auto-actualizable (recomendada):
```html
<script src="https://cdn.jsdelivr.net/gh/pat3csh0/luxora-compartido@main/verificador-email/email-typo-checker-dark.js"></script>
```

Auto-actualizable minificada (~40% más ligera):
```html
<script src="https://cdn.jsdelivr.net/gh/pat3csh0/luxora-compartido@main/verificador-email/email-typo-checker-dark.min.js"></script>
```

Versión fija v3.0.0 (no recibe mejoras, no cambia nunca):
```html
<script src="https://cdn.jsdelivr.net/gh/pat3csh0/luxora-compartido@v3.0.0/verificador-email/email-typo-checker-dark.js"></script>
```

---

## ¿Cuál elegir?

| URL con... | Recibe mejoras automáticas | Cambia alguna vez |
|---|---|---|
| `@main` | Sí — cuando añadamos más typos al diccionario, tus landings los detectan sin tocar nada | Sí (para mejor) |
| `@v3.0.0` | No — siempre la misma versión exacta | Nunca |

**Para la mayoría de usuarios:** usa `@main`. Es la recomendada.

**Usa `@v3.0.0`** solo si necesitas que el comportamiento no cambie nunca (ej: auditorías, tests, entornos regulados).

---

## Otras URLs útiles

| Qué | URL |
|---|---|
| Repo en GitHub | https://github.com/pat3csh0/luxora-compartido |
| Release v3.0.0 | https://github.com/pat3csh0/luxora-compartido/releases/tag/v3.0.0 |
| Todas las versiones | https://github.com/pat3csh0/luxora-compartido/tags |
| Reportar typo no detectado | https://github.com/pat3csh0/luxora-compartido/issues/new |
