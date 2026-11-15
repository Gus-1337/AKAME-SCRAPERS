/**
 * _plantilla.js — molde para un scraper nuevo.
 *
 * Copiá este archivo, cambiale el nombre y completá `run()`.
 * Reglas de la casa:
 *   1. Cero dependencias (fetch nativo de Node 18+).
 *   2. Sin API key ni registro: si pide key, no va.
 *   3. Un `try/catch` que devuelva un mensaje claro, nunca una excepción.
 *   4. Agregalo a test/todos.mjs para que quede probado.
 *
 * Autor: AKAME-SCRAPERS · Licencia MIT
 */

const caja = (titulo, lineas, pie = 'AKAME-SCRAPERS') =>
    '╭┈──◯◝ ⬢ *' + titulo + '*\n' +
    lineas.filter(Boolean).map((l) => (l.startsWith('>') ? l : '┆ ❀ ' + l)).join('\n') + '\n' +
    '╰┈──◯◞ ✿ ' + pie;

const pedir = async (url) => {
    const res = await fetch(url, {
        headers: {
            'User-Agent': 'AKAME-SCRAPERS/1.0 (+https://github.com/Gus-1337/AKAME-SCRAPERS)',
            Accept: 'application/json'
        },
        signal: AbortSignal.timeout(12000)
    });
    if (!res.ok) throw new Error('la fuente respondió ' + res.status);
    return res.json();
};

module.exports = {
    command: ['ejemplo', 'demo'],
    description: 'Qué hace, en una línea',
    category: 'scrapers',

    run: async (ctx) => {
        const { sock, chat, msg, args, usedPrefix } = ctx;
        const p = usedPrefix || '.';
        const responder = (texto) => sock.sendMessage(chat, { text: texto }, { quoted: msg });

        const consulta = String(args?.join(' ') || '').trim();
        if (!consulta) {
            return responder(caja('EJEMPLO', [
                `*Uso* › ${p}ejemplo <algo>`,
                `*Ejemplo* › ${p}ejemplo hola`,
                '> Sin API key ♡'
            ]));
        }

        try {
            // acá va el pedido de verdad
            const datos = await pedir('https://api-publica.example/buscar?q=' + encodeURIComponent(consulta));
            return responder(caja('EJEMPLO', [
                '*' + consulta + '*',
                String(datos?.resultado || 'sin datos'),
                '',
                '> Fuente › example.com ♡'
            ]));
        } catch (e) {
            return responder(caja('NO PUDE', [ e?.message || 'algo salió mal', '> Probá de nuevo ♡' ]));
        }
    }
};
