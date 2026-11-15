/**
 * .serie <nombre> — ficha de una serie (TVMaze).
 *
 * Sin API key, sin registro, sin límite práctico. Cero dependencias.
 *
 * Uso:  .serie breaking bad
 *       .serie the last of us
 *
 * Autor: AKAME-SCRAPERS · Licencia MIT
 */

const API = 'https://api.tvmaze.com/search/shows';

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
    if (!res.ok) throw new Error('TVMaze respondió ' + res.status);
    return res.json();
};

/** Saca las etiquetas HTML que trae la sinopsis. */
const limpiar = (html) => String(html || '').replace(/<[^>]+>/g, '').replace(/&[a-z]+;/gi, ' ').replace(/\s+/g, ' ').trim();
const recortar = (texto, max = 700) => {
    const t = limpiar(texto);
    return t.length <= max ? t : t.slice(0, t.lastIndexOf(' ', max)) + '…';
};

module.exports = {
    command: ['serie', 'tv', 'tvshow'],
    description: 'Ficha de series (TVMaze) sin API key',
    category: 'scrapers',

    run: async (ctx) => {
        const { sock, chat, msg, args, usedPrefix } = ctx;
        const p = usedPrefix || '.';
        const responder = (texto) => sock.sendMessage(chat, { text: texto }, { quoted: msg });

        const consulta = String(args?.join(' ') || '').trim();
        if (!consulta) {
            return responder(caja('SERIES', [
                `*Uso* › ${p}serie <nombre>`,
                `*Ejemplo* › ${p}serie breaking bad`,
                '> Datos de TVMaze · sin API key ♡'
            ]));
        }

        try {
            const r = await pedir(API + '?q=' + encodeURIComponent(consulta));
            const s = r?.[0]?.show;
            if (!s) {
                return responder(caja('SIN RESULTADOS', [ 'No encontré › *' + consulta + '*' ]));
            }

            const dias = (s.schedule?.days || []).join(', ');
            const caption = caja('SERIE', [
                '*' + s.name + '*',
                '',
                s.rating?.average ? '⭐ Puntaje › ' + s.rating.average + '/10' : '⭐ Puntaje › sin votos',
                '📺 Estado › ' + (s.status || '—'),
                s.premiered ? '🗓️ Estreno › ' + s.premiered : '',
                dias ? '📅 Emite › ' + dias + (s.schedule?.time ? ' · ' + s.schedule.time : '') : '',
                '🎬 Géneros › ' + ((s.genres || []).join(', ') || '—'),
                '🌐 Red › ' + (s.network?.name || s.webChannel?.name || '—'),
                '',
                recortar(s.summary),
                '',
                '*Link* › ' + (s.url || '—')
            ]);

            if (s.image?.medium) {
                try {
                    return await sock.sendMessage(chat, { image: { url: s.image.medium }, caption }, { quoted: msg });
                } catch {
                    /* sin imagen, texto */
                }
            }
            return responder(caption);
        } catch (e) {
            return responder(caja('NO PUDE', [ e?.message || 'algo salió mal', '> Probá de nuevo ♡' ]));
        }
    }
};
