# 🕷️ AKAME-SCRAPERS

### 🌸 Seguí el canal: [AKAME-MD en WhatsApp](https://whatsapp.com/channel/0029VbDPchgEAKWO4mMYtC1Q)

**Scrapers listos para bots de WhatsApp (Baileys). Sin API key. Sin registro. Sin servicios externos que después te cobren.**

Cada archivo de `scrapers/` es **uno solo**, autocontenido, sin dependencias (`fetch` nativo de Node 18+). Lo copiás a tu bot y anda.

```bash
# probá los 12 contra internet, ahora mismo
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
| `.noticias [fuente]` | Titulares por RSS | BBC Mundo, El País, Clarín, La Nación, Infobae | ❌ |
| `.traducir [idioma] <texto>` | Traducción | MyMemory | ❌ |
| `.play <link o nombre>` | Busca y manda el audio con la ficha | YouTube | ❌ |
| `.ytmp3 <link o nombre>` | Sólo el audio (m4a) | YouTube | ❌ |
| `.ytmp4 <link o nombre>` | Video mp4 360p con audio | YouTube | ❌ |

**Sin `npm install`. Sin `process.env`. Sin cuenta en ningún lado.**

### ⚠️ Los tres de YouTube (`.play`, `.ytmp3`, `.ytmp4`)

Bajan directo de YouTube, sin pasar por servicios de terceros. Dos cosas que tenés que saber:

1. **YouTube decide por IP.** Si tu servidor es un VPS/datacenter, YouTube puede contestar "iniciá sesión para confirmar que no sos un bot" y el comando devuelve ese aviso. Desde una conexión normal (tu casa, un host con IP limpia) anda. No es magia: es la política anti-bot de ellos.
2. **El `.ytmp4` sale en 360p** porque es la única calidad que YouTube entrega con video y audio en el mismo archivo. Las demás vienen separadas y unirlas necesita `ffmpeg` — este repo no lleva dependencias.

Si querés respaldo para cuando YouTube bloquee, se le puede enganchar tu propia API en tres líneas: hay un solo `if` en `resolver()`.

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
╭┈──◯◝ ⬢ *CLIMA · BUENOS AIRES*
┆ ❀ *Buenos Aires, Argentina*
┆ ❀ ☀️ *25°C* — Despejado
┆ ❀ 🌡️ Sensación › 27°C
┆ ❀ 💧 Humedad › 60%
┆ ❀ ☁️ *Dom 15* › 25° / 18° · 💧10%
> Fuente: Open-Meteo ♡
╰┈──◯◞ ✿ Gus
> 🌸 Sigue el canal › https://whatsapp.com/channel/0029VbDPchgEAKWO4mMYtC1Q
```

```
╭┈──◯◝ ⬢ *CRIPTO · BTC*
┆ ❀ *Bitcoin*
┆ ❀ 💵 *$64,726*
┆ ❀ 📈 24h › 🔴 -0.71%
┆ ❀ 🏦 Cap. › $1.29T
> Fuente: CoinGecko ♡
╰┈──◯◞ ✿ Gus
> 🌸 Sigue el canal › https://whatsapp.com/channel/0029VbDPchgEAKWO4mMYtC1Q
```

---

## 🧪 Probarlos todos

```bash
node test/todos.mjs
```

Salida:

```
✔ wiki        290ms  ╭┈──◯◝ ⬢ *WIKIPEDIA* …
✔ clima       711ms  ╭┈──◯◝ ⬢ *CLIMA · BUENOS AIRES* …
…
RESULTADO · 12/12 andando
```

Los tres de YouTube corren en modo test (resuelven el video y eligen el formato, sin bajar el archivo) para no gastar datos en cada corrida.

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

## 📄 Licencia y créditos

MIT © **Gus** — usalo, modificalo, compartilo; solo mantené el crédito y no lo vendas como si fuera tuyo.
Ver [LICENSE](LICENSE).

Hecho por **Gus** para la comunidad de bots de WhatsApp.
🌸 Canal: [AKAME-MD](https://whatsapp.com/channel/0029VbDPchgEAKWO4mMYtC1Q)
