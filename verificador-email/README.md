# Verificador de email para Luxora / GoHighLevel

Cuando alguien rellena un formulario en tu landing y escribe mal su email (por ejemplo `gmail.con` en vez de `gmail.com`), ese contacto llega a tu CRM como inválido: no puedes enviarle emails, tu tasa de rebote sube y tu dominio pierde reputación.

Este verificador detecta esos errores **en el momento**, antes de que el usuario envíe el formulario, y le muestra un aviso clicable para corregirlo en un solo toque. Sin códigos de verificación, sin pasos extra, sin fricción.

**No bloquea el envío.** Solo informa. Si el usuario ignora la sugerencia, el formulario se envía igualmente. Pero en la práctica, la mayoría acepta la corrección.

## Qué errores detecta

El verificador cubre **5 tipos de errores** que se producen en formularios reales:

### 1. Errores al escribir el nombre del proveedor

El usuario teclea rápido y se equivoca en alguna letra del dominio:

| El usuario escribe | Se sugiere | Error |
|---|---|---|
| juan@hormail.com | juan@hotmail.com | hormail → hotmail |
| juan@gmial.com | juan@gmail.com | gmial → gmail |
| juan@yaho.es | juan@yahoo.es | yaho → yahoo |
| juan@outloo.com | juan@outlook.com | outloo → outlook |
| juan@iclaud.com | juan@icloud.com | iclaud → icloud |
| juan@hotmeil.com | juan@hotmail.com | hotmeil → hotmail |
| juan@gnail.com | juan@gmail.com | gnail → gmail |
| juan@hitmail.com | juan@hotmail.com | hitmail → hotmail |
| juan@gamil.com | juan@gmail.com | gamil → gmail |
| juan@gemail.com | juan@gmail.com | gemail → gmail |

Cubre **+180 variantes** reales de Hotmail, Gmail, Yahoo, Outlook, iCloud, Live, Proton, AOL, Movistar, Orange, Vodafone, Telefónica y más.

### 2. Errores en la terminación (.com, .es, .net)

El usuario pulsa una tecla de más, de menos, o en el orden incorrecto:

| El usuario escribe | Se sugiere | Error |
|---|---|---|
| juan@gmail.con | juan@gmail.com | .con → .com |
| juan@yahoo.esr | juan@yahoo.es | .esr → .es |
| juan@hotmail.coom | juan@hotmail.com | .coom → .com |
| juan@gmail.cm | juan@gmail.com | .cm → .com |
| juan@gmail.cpm | juan@gmail.com | .cpm → .com |
| juan@outlook.como | juan@outlook.com | .como → .com |
| juan@telefonica.nte | juan@telefonica.net | .nte → .net |

### 3. Texto sobrante pegado detrás del dominio

El usuario copia y pega mal, o el teclado del móvil autocompleta añadiendo caracteres de más:

| El usuario escribe | Se sugiere | Sobrante |
|---|---|---|
| juan@gmail.commeil.com | juan@gmail.com | meil.com |
| juan@hotmail.comyquyzqz | juan@hotmail.com | yquyzqz |
| juan@gmail.com.com | juan@gmail.com | .com |
| juan@gmail.comr | juan@gmail.com | r |
| juan@hotmail.cominievrd | juan@hotmail.com | inievrd |

### 4. Errores compuestos (nombre mal + terminación mal a la vez)

El usuario comete dos errores en el mismo dominio. El verificador los resuelve en cascada:

| El usuario escribe | Se sugiere | Errores |
|---|---|---|
| juan@gmail.con.com | juan@gmail.com | .con + .com sobrante |
| juan@hotmail.con.com | juan@hotmail.com | .con + .com sobrante |
| juan@gemail.con | juan@gmail.com | gemail + .con |
| juan@hormail.con | juan@hotmail.com | hormail + .con |
| juan@gnail.con | juan@gmail.com | gnail + .con |
| juan@hormail.org | juan@hotmail.com | hormail + .org incorrecto |

### 5. Dominios de país donde no existen

Gmail, por ejemplo, solo usa `gmail.com`. No existe `gmail.es`, `gmail.com.mx` ni `gmail.com.ar`:

| El usuario escribe | Se sugiere | Motivo |
|---|---|---|
| juan@gmail.com.mx | juan@gmail.com | Gmail no usa .com.mx |
| juan@gmail.com.ar | juan@gmail.com | Gmail no usa .com.ar |
| juan@gmail.es | juan@gmail.com | Gmail no usa .es |

## Proveedores cubiertos

Gmail, Hotmail, Yahoo, Outlook, iCloud, Live, MSN, Proton, AOL, Telefónica, Movistar, Orange, Vodafone, Jazztel, Terra, Wanadoo, GMX, Yandex, Zoho, y los principales ISP de España, Europa y Latinoamérica.

En total: **~80 dominios válidos** reconocidos + **+180 errores exactos** mapeados + detección automática de errores no listados mediante algoritmos de similitud.

## Variantes disponibles

Hay dos variantes, elige la que se adapte al **color de fondo** de tu landing:

| Variante | Color del texto de aviso | Cuándo usarla |
|---|---|---|
| **light** | Texto claro (blanco) | Landings con fondo **oscuro** |
| **dark** | Texto oscuro (casi negro) | Landings con fondo **claro** |

Las dos detectan exactamente lo mismo, solo cambia el color del mensaje.

## Cómo instalarlo (2 minutos)

> Tu formulario debe estar **insertado como bloque** dentro de la landing (no como iframe). Si está como bloque (lo habitual en Luxora), esto funciona sin tocar nada del formulario.

### La forma más rápida: una sola línea (recomendada)

Pega **una única línea** en *Settings → Tracking Code → Footer* de tu landing o funnel:

**Si tu landing tiene fondo OSCURO:**

```html
<script src="https://cdn.jsdelivr.net/gh/pat3csh0/luxora-compartido@v4.0.0/verificador-email/email-typo-checker-light.js"></script>
```

**Si tu landing tiene fondo CLARO:**

```html
<script src="https://cdn.jsdelivr.net/gh/pat3csh0/luxora-compartido@v4.0.0/verificador-email/email-typo-checker-dark.js"></script>
```

> Si quieres que funcione en **todas las páginas del funnel** de una vez (opt-ins, thank-you pages, etc.), pégalo en *Funnel Settings → Tracking Code → Footer* en lugar de en la landing individual.

### Paso a paso detallado

1. Entra en *Sites → Funnels (o Sites) → tu funnel → tu landing*.
2. Pulsa el icono **Settings** (rueda dentada) arriba a la derecha.
3. Busca la sección **Tracking Code** (o "Custom Code").
4. Localiza el campo **Footer** (no Header).
5. Pega la línea `<script src="...">` que corresponda a tu landing.
6. Guarda y publica.

### Cómo probar que funciona

Abre tu landing publicada, ve al formulario y escribe un email roto a propósito (por ejemplo `test@hormail.com`). Al salir del campo (`Tab` o clic fuera) debe aparecer debajo:

> ¿Quisiste decir **test@hotmail.com**? (haz clic para corregir)

Si pulsas la sugerencia, el campo se autocompleta con la versión correcta.

## Versiones

| Versión | Qué usar en la URL | Comportamiento |
|---|---|---|
| `@v4.0.0` | Versión fija, nunca cambia | Recomendada si quieres control total |
| `@main` | Siempre la última publicada | Recibes mejoras automáticas sin tocar nada |

Las versiones fijas (`@v4.0.0`, `@v3.0.0`, etc.) siguen funcionando indefinidamente. Cuando salga una nueva, se publicará aquí y podrás actualizar cambiando solo el número de versión en tu Tracking Code.

Todas las versiones: https://github.com/pat3csh0/luxora-compartido/tags

## Limitaciones

- **Formularios en iframe:** si el formulario está embebido como iframe en una web externa (ej. WordPress), el script no puede acceder a él (restricción del navegador). Solución: cambiar el embed a inline o usar Custom JS dentro del propio Form Builder de GHL.
- **No valida que el email exista realmente.** Solo comprueba que el dominio esté bien escrito. No hace verificación SMTP ni consulta de servidores MX.
- **No bloquea el envío.** Es intencional: preferimos no añadir fricción. Si el usuario ignora la sugerencia, el contacto llega al CRM tal cual.

## Reportar errores no detectados

Si encuentras un email mal escrito que el verificador no detecta, [abre un issue aquí](https://github.com/pat3csh0/luxora-compartido/issues/new) con el ejemplo concreto. Lo añadiremos a la próxima versión.

---

## Detalles técnicos

> Esta sección es para desarrolladores y curiosos. No necesitas entender nada de esto para usar el verificador.

### Pipeline de detección (6 pasos en cascada)

Cuando el usuario sale del campo de email, el verificador ejecuta esta secuencia sobre el dominio (la parte después de la `@`):

```
1. ¿Es un dominio válido conocido? → No sugerir nada
2. ¿Está en el diccionario de typos exactos (TYPO_MAP)? → Sugerir corrección directa
3. ¿La terminación (.con, .cmo, .esr...) es un TLD roto? → Reparar y re-evaluar
4. ¿Tiene segmentos de más? (gmail.con.com) → Quitar el último y re-evaluar
5. ¿Tiene basura pegada después de un dominio válido? (gmail.commeil.com) → Limpiar
6. ¿El nombre del proveedor y la terminación están mal por separado? → Evaluar cada parte
7. ¿Se parece a algún dominio conocido? → Sugerir el más cercano (Sift3)
```

Cada paso que encuentra solución detiene el pipeline. Si ninguno encuentra nada, no se muestra sugerencia (para evitar falsos positivos con dominios corporativos legítimos).

### Algoritmo de distancia: Sift3

Para el paso 7 (red de seguridad), el verificador usa el algoritmo **Sift3**, el mismo que utiliza [Mailcheck.js](https://github.com/mailcheck/mailcheck) (la librería de referencia del mercado para este tipo de verificación).

Sift3 es una función de distancia entre cadenas de texto que mide cuántas operaciones (insertar, borrar, sustituir letras) se necesitan para convertir una cadena en otra. Funciona de forma similar a Levenshtein (el algoritmo clásico) pero con dos ventajas: es más rápido (O(n) en vez de O(n²)) y detecta mejor las transposiciones de letras (cuando escribes `amil` en vez de `mail`).

Si la distancia entre el dominio escrito y alguno de los ~80 dominios conocidos es menor que 3, se sugiere la corrección.

### SLD+TLD Split Matching

Inspirado en Mailcheck.js. Separa el dominio en dos partes: el **nombre del proveedor** (SLD, ej: `hotmail`) y la **terminación** (TLD, ej: `.com`). Evalúa cada parte por separado contra sus propias listas, y busca la mejor combinación que exista como dominio real.

Esto permite detectar errores compuestos como `hormail.org` (nombre mal + terminación incorrecta para ese proveedor) sin necesitar una entrada en el diccionario para cada combinación posible.

### Sin dependencias externas

Vanilla JavaScript puro, sin librerías, sin APIs externas, sin cookies, sin tracking. Todo se ejecuta en el navegador del usuario. El script pesa ~15KB (o ~9KB minificado vía jsDelivr).

### Compatibilidad

Funciona en todos los navegadores modernos (Chrome, Firefox, Safari, Edge). Usa `MutationObserver` para re-engancharse automáticamente si GHL re-renderiza el formulario.

---

Mantenido por **JLM** — v4.0.0 · abril 2026

Uso libre. Si lo modificas y mejoras, comparte la mejora.
