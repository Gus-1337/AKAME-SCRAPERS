# 🕷️ AKAME-SCRAPERS

**Scrapers listos para bots de WhatsApp (Baileys). Sin API key. Sin registro. Sin servicios externos que después te cobren.**

Cada archivo de `scrapers/` es **uno solo**, autocontenido, sin dependencias (`fetch` nativo de Node 18+). Lo copiás a tu bot y anda.

```bash
# probá los 9 contra internet, ahora mismo
node test/todos.mjs
```

---

## 📦 Qué hay

| Comando | Qué hace | Fuente | Key |
|---|---|---|---|
| `.wiki <término>` | Resumen de Wikipedia con foto | es.wikipedia.org | ❌ |
| `.clima <ciudad>` | Clima actual + 3 días | Open-Meteo | ❌ |
| `.cripto [moneda]` | Precio de cripto o top 10 | CoinGecko | ❌ |
| `.cambio [monto] <de> <a>` | Divisas al día | open.er-api.com | ❌ |
| `.anime <nombre>` | Ficha de anime | AniList | ❌ |
| `.serie <nombre>` | Ficha de series | TVMaze | ❌ |
| `.letra <artista> - <tema>` | Letra de canción | lyrics.ovh | ❌ |
| `.noticias [fuente]` | Titulares por RSS | BBC, Clarín, Infobae, La Nación, Perú21, El Comercio | ❌ |
| `.traducir [idioma] <texto>` | Traducción | MyMemory | ❌ |

**Sin `npm install`. Sin `process.env`. Sin cuenta en ningún lado.**

---

## 🚀 Instalación (2 minutos)

1. Copiá el archivo del scraper a tu carpeta de comandos:

```
tu-bot/
└── commands/
    └── wiki.js        ← el archivo tal cual, no hay que tocarlo
```

2. Importalo como cualquier otro comando.

**Bot en CommonJS** (`require`):

```js
const wiki = require('./commands/wiki');
// o si tu cargador escanea la carpeta, ya está: exporta { command, run }
```

**Bot en ESM / TypeScript**:

```ts
import wiki from './commands/wiki.js';   // Node toma el module.exports como default
```

3. Listo. El comando aparece con sus alias.

### Formato de contexto que espera

Los scrapers llaman a `ctx.sock.sendMessage(chat, payload, { quoted: msg })` — igual que Baileys. Si tu bot usa otros nombres, hay un solo bloque al principio de cada `run()`:

```js
const { sock, chat, msg, args, usedPrefix } = ctx;
```

Renombralo y listo (`client`, `m`, `text`, etc.). Nada más que adaptar.

---

## 👀 Cómo se ve

```
╭┈──◯◝ ⬢ *CLIMA · IQUITOS*
┆ ❀ *Iquitos, Departamento de Loreto, Perú*
┆ ❀ 🌤️ *33°C* — Mayormente despejado
┆ ❀ 🌡️ Sensación › 42°C
┆ ❀ 💧 Humedad › 58%
┆ ❀ 🌦️ *Dom 15* › 34° / 25° · 💧55%
╰┈──◯◞ ✿ AKAME-SCRAPERS
```

```
╭┈──◯◝ ⬢ *CRIPTO · BTC*
┆ ❀ *Bitcoin*
┆ ❀ 💵 *$64,647*
┆ ❀ 📈 24h › 🔴 -1.01%
┆ ❀ 🏦 Cap. › $1.30T
╰┈──◯◞ ✿ AKAME-SCRAPERS
```

---

## 🧪 Probarlos todos

```bash
node test/todos.mjs
```

Salida:

```
✔ wiki        290ms  ╭┈──◯◝ ⬢ *WIKIPEDIA* …
✔ clima       711ms  ╭┈──◯◝ ⬢ *CLIMA · IQUITOS* …
…
RESULTADO · 9/9 andando
```

El script usa un **contexto falso** (no necesita WhatsApp) y falla con código 1 si alguno se rompió → se puede correr en un cron y avisar al canal cuando algo muere.

---

## 🧩 Agregar un scraper nuevo

Hay una plantilla en [`scrapers/_plantilla.js`](scrapers/_plantilla.js). Lo mínimo:

```js
module.exports = {
    command: ['micomando', 'alias'],
    description: 'Qué hace, en una línea',
    category: 'scrapers',
    run: async (ctx) => {
        const { sock, chat, msg, args } = ctx;
        const res = await fetch('https://api-publica...' + encodeURIComponent(args.join(' ')));
        const datos = await res.json();
        await sock.sendMessage(chat, { text: 'Resultado: ' + datos.algo }, { quoted: msg });
    }
};
```

Después: agregalo a `test/todos.mjs` para que quede verificado siempre. Más detalles en [`docs/COMO-AGREGAR.md`](docs/COMO-AGREGAR.md).

---

## ⚖️ Reglas del repo

- **Solo datos públicos** y APIs que no pidan cuenta. Nada de muros de pago, cuentas ajenas ni datos personales.
- **Respetá los sitios**: caché y límites por defecto; un scraper sin freno te quema la IP y te banean el bot.
- **Contenido con copyright** no se redistribuye. Se enlaza a la fuente, no se rehostea.
- Si una fuente se cae o cambia, se abre un issue y se arregla el archivo.

---

## 📄 Licencia

MIT — hacé lo que quieras, solo mantené el crédito y no lo vendas como si fuera tuyo.

Hecho con cariño para la comunidad de bots de WhatsApp · **AKAME** ♡
