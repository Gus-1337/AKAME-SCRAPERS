/**
 * .noticias [fuente] — últimos títulos de un diario (RSS).
 *
 * Sin API key: se lee el RSS del medio y se parsea con regex, sin cheerio ni
 * nada extra. Cero dependencias.
 *
 * Uso:  .noticias            (BBC Mundo)
 *       .noticias clarin
 *       .noticias infobae
 *       .noticias fuentes     (lista de fuentes)
 *
 * Autor: AKAME-SCRAPERS · Licencia MIT
 */

const FUENTES = {
    bbc: { nombre: 'BBC Mundo', url: 'https://feeds.bbci.co.uk/mundo/rss.xml' },
    clarin: { nombre: 'Clarín', url: 'https://www.clarin.com/rss/lo-ultimo/' },
    infobae: { nombre: 'Infobae', url: 'https://www.infobae.com/feeds/rss/' },
    nacion: { nombre: 'La Nación', url: 'https://www.lanacion.com.ar/arc/outboundfeeds/rss/' },
    peru21: { nombre: 'Perú21', url: 'https://peru21.pe/arc/outboundfeeds/rss/' },
    elcomercio: { nombre: 'El Comercio', url: 'https://elcomercio.pe/arc/outboundfeeds/rss/' }
};

const caja = (titulo, lineas, pie = 'AKAME-SCRAPERS') =>
    '╭┈──◯◝ ⬢ *' + titulo + '*\n' +
    lineas.filter(Boolean).map((l) => (l.startsWith('>') ? l : '┆ ❀ ' + l)).join('\n') + '\n' +
    '╰┈──◯◞ ✿ ' + pie;

const pedirTexto = async (url) => {
    const res = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; AKAME-SCRAPERS/1.0; +https://github.com/Gus-1337/AKAME-SCRAPERS)',
            Accept: 'application/rss+xml, application/xml, text/xml, */*'
        },
        signal: AbortSignal.timeout(15000)
    });
    if (!res.ok) throw new Error('el RSS respondió ' + res.status);
    return res.text();
};

const limpio = (s) =>
    String(s || '')
        .replace(/<!\[CDATA\[|\]\]>/g, '')
        .replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
        .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

/** Saca los primeros N ítems del RSS. */
const items = (xml, max) => {
    const salida = [];
    const bloques = String(xml).split(/<item[\s>]/i).slice(1);
    for (const b of bloques) {
        const titulo = b.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
        const link = b.match(/<link[^>]*>([\s\S]*?)<\/link>/i)?.[1];
        const fecha = b.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i)?.[1];
        if (!titulo) continue;
        // los RSS dejan basura de campaña en el link: at_medium, utm_*…
        const url = limpio(link)
            .replace(/([?&])(at_[a-z_]+|utm_[a-z]+)=[^&]*/gi, '$1')
            .replace(/[?&]+$/, '');
        salida.push({ titulo: limpio(titulo), link: url, fecha: limpio(fecha) });
        if (salida.length >= max) break;
    }
    return salida;
};

module.exports = {
    command: ['noticias', 'news', 'titulares'],
    description: 'Titulares por RSS, sin API key',
    category: 'scrapers',

    run: async (ctx) => {
        const { sock, chat, msg, args, usedPrefix } = ctx;
        const p = usedPrefix || '.';
        const responder = (texto) => sock.sendMessage(chat, { text: texto }, { quoted: msg });

        const clave = String(args?.[0] || 'bbc').toLowerCase();

        if (/^(fuentes|lista|sources)$/i.test(clave)) {
            return responder(caja('FUENTES DISPONIBLES', [
                ...Object.entries(FUENTES).map(([k, f]) => '*' + k + '* › ' + f.nombre),
                '',
                `*Uso* › ${p}noticias <fuente>`,
                '> Todas por RSS público · sin API key ♡'
            ]));
        }

        const fuente = FUENTES[clave];
        if (!fuente) {
            return responder(caja('FUENTE DESCONOCIDA', [
                'No tengo › *' + clave + '*',
                `*Ver fuentes* › ${p}noticias fuentes`
            ]));
        }

        try {
            const xml = await pedirTexto(fuente.url);
            const titulares = items(xml, 8);
            if (!titulares.length) {
                throw new Error('el RSS vino vacío o cambió de formato');
            }
            return responder(caja('NOTICIAS · ' + fuente.nombre.toUpperCase(), [
                ...titulares.map((t, i) => '*' + (i + 1) + '.* ' + t.titulo + '\n' + (t.link ? '> ' + t.link : '')),
                '',
                '> Fuente › ' + fuente.nombre + ' (RSS) ♡'
            ]));
        } catch (e) {
            return responder(caja('NO PUDE', [
                e?.message || 'algo salió mal',
                '> Puede que el medio haya cambiado el RSS ♡'
            ]));
        }
    }
};
