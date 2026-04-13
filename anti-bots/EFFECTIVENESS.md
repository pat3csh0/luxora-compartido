# Anti-bots: efectividad real y cuándo escalar

Esta nota responde tres preguntas concretas: *¿qué bots bloquea el honeypot?*,
*¿qué bots se le escapan?*, y *¿cuándo tiene sentido añadir capas extra?*.

Los números son estimaciones empíricas basadas en reportes de la industria
(Akismet, Sucuri, Cloudflare, proyectos honeypot open source). No son exactos
— el spam es un blanco móvil. Pero sirven como orden de magnitud para tomar
decisiones de diseño.

---

## Categorías de bots y qué hace cada uno

| Nivel | Descripción | Ejecuta JS | Estrategia |
|---|---|---|---|
| **0** | Scraper HTTP puro | No | POST directo al endpoint sin cargar la página |
| **1** | Automatizador genérico | Sí | Selenium/Puppeteer rellenando todos los `input` por `name` |
| **2** | Automatizador con check básico de visibilidad | Sí | Salta inputs con `display:none` o similar |
| **3** | Bot con check de visibilidad real | Sí | Usa `offsetParent`, `getBoundingClientRect`, `getComputedStyle` para detectar ocultos |
| **4** | Bot honeypot-aware / targeted | Sí | Lee el código del anti-bot y ataca técnicas específicas |

---

## Qué bloquea este honeypot, por categoría

| Nivel | % estimado del tráfico de spam | ¿Lo bloqueamos? |
|---|---|---|
| 0 · Scraper HTTP puro | ~5-10% | No aplica — no carga la página, el honeypot ni existe para él. Defensa → validación server-side del endpoint |
| **1 · Automatizador genérico** | **~70-85%** | **Sí, ~95%.** Es el caso principal. Rellena todo, cae al honeypot |
| 2 · Check básico de visibilidad | ~5-10% | Parcialmente. Nuestro honeypot no usa `display:none` precisamente por esto, así que pasa a veces |
| 3 · Check de visibilidad real | ~5-12% | **No.** Detecta geometría 0x0 y salta |
| 4 · Honeypot-aware / targeted | <1% | **No.** Casi solo en targets de alto valor |

**En landings GHL típicas (marketing funnels, webinars, lead gen) el tráfico
de spam está dominado abrumadoramente por Nivel 1.** Los niveles avanzados
no se molestan en atacar funnels de captación porque el ROI es bajo
comparado con objetivos como banca, credenciales, o crypto.

---

## Cifra práctica

Contra el spam real que llega a una landing GHL típica, este honeypot bloquea
**~85-95% del volumen**. Es la mejor relación coste/valor que puedes tener
con cero fricción para usuarios reales.

Lo que **no bloquea** (ese ~5-15% restante):

- Bots de Nivel 2-3 con check de visibilidad.
- Humanos que rellenan manualmente spam (no son bots).
- Ataques dirigidos específicamente a tu dominio (raro en marketing).
- Scrapers HTTP que atacan el endpoint directamente, saltándose el front.

---

## Cuándo añadir otra capa

Como regla general, **no sobreinviertas** hasta tener señales reales. Si
todos tus clientes reciben spam ocasional que pasa el honeypot, es parte
del background — no vale la pena añadir fricción al 99% de usuarios reales.

Cuándo sí escalar:

- **Cliente concreto recibe >10 leads spam/día tras instalar el honeypot** →
  añadir capa extra en el form de ESE cliente, no globalmente.
- **Spam concentrado desde rangos de IP específicos** → rate limit + IP block
  (puede hacerse con Cloudflare Worker delante del endpoint, o con reglas en GHL).
- **Spam con contenido idéntico repetido** → regla de moderación por texto
  (tag automático en GHL, workflow de descarte).
- **Ataque dirigido confirmado** (volumen alto, técnicas sofisticadas) →
  reCAPTCHA v3 o Cloudflare Turnstile en ese form. Son invisibles, cero
  fricción, y cubren Niveles 2-4 con alta precisión.

### Opciones de refuerzo por orden de fricción vs potencia

| Capa | Fricción usuario | Bloqueo extra estimado |
|---|---|---|
| Honeypot (lo que ya tienes) | Cero | Base: 85-95% |
| Rate limit por IP en el endpoint | Cero | +2-4% |
| Cloudflare Turnstile invisible | Muy baja (imperceptible si pasa sin challenge) | +5-8% |
| reCAPTCHA v3 (scoring) | Muy baja | +5-8% |
| reCAPTCHA v2 checkbox | Media (clic extra) | +7-10% |
| Challenge matemático / pregunta | Alta | +3-5% (mucha fricción para poco más) |

**Recomendación escalonada**: honeypot → si sigue llegando spam al cliente,
añadir Turnstile en ese form concreto. No pongas challenges visibles sin
tener evidencia de que hacen falta — frenan conversión.

---

## Herramienta de verificación

Para comprobar que el honeypot está funcionando en una landing concreta
sin tocar DevTools: usa el bookmarklet [anti-bots-tester](../anti-bots-tester/).

---

## Limitación intrínseca que hay que aceptar

Cualquier defensa puramente client-side (honeypot incluido) puede ser leída
y replicada por un atacante motivado. El código está en el navegador del
visitante. La única defensa que escapa a esto es la validación **server-side**,
y GHL no expone un hook pre-save donde podamos enchufar nuestra lógica.

Por eso la estrategia es: **capturar al 90% fácil con honeypot**, y si el 10%
restante se vuelve problemático en un cliente específico, añadir ahí una
capa que sí haga server-side (Turnstile/reCAPTCHA validan tokens contra los
servidores de Google/Cloudflare, que sí son opacos al atacante).

---

*Actualizado: 2026-04-13*
