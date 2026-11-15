/**
 * .wiki <término> — resumen de Wikipedia en español.
 *
 * Sin API key, sin registro, sin límites raros: usa la API pública de
 * es.wikipedia.org. Cero dependencias (fetch nativo de Node 18+).
 *
 * Uso:  .wiki imperio inca
 *       .wiki python    (busca y trae el primer resultado)
 *
 * Autor: AKAME-SCRAPERS · Licencia MIT
 */

const BUSCAR = 'https://es.wikipedia.org/w/api.php';
const RESUMEN = 'https://es.wikipedia.org/api/rest_v1/page/summary/';

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
    if (!res.ok) throw new Error('Wikipedia respondió ' + res.status);
    return res.json();
};

/** Recorta el texto sin cortar una palabra al medio. */
const recortar = (texto, max = 900) => {
    const t = String(texto || '').replace(/\s+/g, ' ').trim();
    if (t.length <= max) return t;
    return t.slice(0, t.lastIndexOf(' ', max)) + '…';
};

module.exports = {
    command: ['wiki', 'wikipedia', 'wsp'],
    description: 'Resumen de Wikipedia en español',
    category: 'scrapers',

    run: async (ctx) => {
        const { sock, chat, msg, args, usedPrefix } = ctx;
        const p = usedPrefix || '.';
        const responder = (texto) => sock.sendMessage(chat, { text: texto }, { quoted: msg });

        const consulta = String(args?.join(' ') || '').trim();
        if (!consulta) {
            return responder(caja('WIKIPEDIA', [
                `*Uso* › ${p}wiki <término>`,
                `*Ejemplo* › ${p}wiki Machu Picchu`,
                '> Sin API, sin key, sin registro ♡'
            ]));
        }

        try {
            // 1) buscar: así "machu pichu" también encuentra "Machu Picchu"
            const busqueda = await pedir(
                BUSCAR + '?action=query&format=json&list=search&srlimit=1&srsearch=' + encodeURIComponent(consulta)
            );
            const titulo = busqueda?.query?.search?.[0]?.title;
            if (!titulo) {
                return responder(caja('SIN RESULTADOS', [ 'No encontré nada con › *' + consulta + '*' ]));
            }

            // 2) resumen + foto
            const info = await pedir(RESUMEN + encodeURIComponent(titulo.replace(/ /g, '_')));
            const texto = recortar(info?.extract || '');
            const link = info?.content_urls?.desktop?.page || 'https://es.wikipedia.org/wiki/' + encodeURIComponent(titulo);
            const foto = info?.thumbnail?.source;

            const caption = caja('WIKIPEDIA', [
                '*' + (info?.title || titulo) + '*',
                info?.description ? '_' + info.description + '_' : '',
                '',
                texto || 'Sin resumen disponible.',
                '',
                '*Link* › ' + link
            ]);

            if (foto) {
                try {
                    return await sock.sendMessage(chat, { image: { url: foto }, caption }, { quoted: msg });
                } catch {
                    /* si la foto no carga, mandamos solo texto */
                }
            }
            return responder(caption);
        } catch (e) {
            return responder(caja('NO PUDE', [
                e?.message || 'algo salió mal',
                '> Probá de nuevo en un rato ♡'
            ]));
        }
    }
};
