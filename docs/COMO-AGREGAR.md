# Cómo agregar un scraper

🌸 Canal: https://whatsapp.com/channel/0029VbDPchgEAKWO4mMYtC1Q · por Gus

## 1. Elegí una fuente que no pida nada

Antes de escribir código, comprobá que se pueda:

```bash
curl -s "https://la-api.com/endpoint?q=algo" | head -c 400
```

Bien ✅
- Devuelve JSON o HTML público y no pide `api_key`.
- No requiere login ni captcha.
- No está prohibido en sus términos de uso.

No va ❌
- Pide registro o key.
- Es contenido con copyright para redistribuir (películas, música, libros).
- Es un endpoint privado de la app móvil con credenciales fijas.

## 2. Copiá la plantilla

```bash
cp scrapers/_plantilla.js scrapers/miscraper.js
```

Cambiá `command`, `description` y el cuerpo de `run()`.

## 3. Reglas de la casa

1. **Cero dependencias.** `fetch` nativo. Si de verdad hace falta parsear HTML complicado, se hace con regex antes que agregar `cheerio`.
2. **Un `try/catch` siempre.** Nunca dejar que una excepción llegue al handler del bot.
3. **Timeout.** Todas las llamadas con `AbortSignal.timeout(12000)`.
4. **Mensaje de uso.** Si faltan argumentos, responder cómo se usa.
5. **Caja AKAME.** Para que todos los comandos se vean iguales.
6. **Sin secrets.** Nada de cookies ni tokens personales en el archivo.

## 4. Probarlo en vivo

```bash
node -e "
const s = require('./scrapers/miscraper.js');
s.run({
  sock: { sendMessage: async (c, p) => console.log(p.text || p.caption) },
  chat: 'x', msg: {}, args: ['prueba'], usedPrefix: '.'
});
"
```

## 5. Sumarlo al test general

En `test/todos.mjs`, agregá una línea a `PRUEBAS`:

```js
['miscraper', ['prueba']]
```

Y corré todo:

```bash
node test/todos.mjs
```

Tiene que dar `10/10 andando` (o el número que corresponda).

## 6. Publicarlo

```
git add scrapers/miscraper.js test/todos.mjs README.md
git commit -m "feat: .miscraper (fuente, sin api key)"
git push
```

Y en el canal:

> 🕷️ **Nuevo scraper: .miscraper**
> Qué hace, en una línea. Sin API key.
> 📄 Raw: https://raw.githubusercontent.com/Gus-1337/AKAME-SCRAPERS/main/scrapers/miscraper.js

## 7. Mantenerlo vivo

- Si una fuente cambia, el test lo va a marcar en rojo: **arreglar el archivo, no el test**.
- Si la fuente murió del todo, se borra el scraper y se avisa en el canal.
- Anotá en el README la fecha de la última verificación cuando toques algo.
