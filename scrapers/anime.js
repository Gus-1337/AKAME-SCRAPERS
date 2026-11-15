/**
 * .anime <nombre> — ficha de un anime (AniList).
 *
 * Sin API key: AniList es GraphQL público y no pide registro (90 pedidos por
 * minuto). Cero dependencias.
 *
 * Uso:  .anime one piece
 *       .anime frieren
 *
 * Autor: AKAME-SCRAPERS · Licencia MIT
 */

const API = 'https://graphql.anilist.co';

const CONSULTA = `query ($s: String) {
  Media(search: $s, type: ANIME) {
    id
    title { romaji english native }
    description(asHtml: false)
    episodes
    status
    format
    seasonYear
    averageScore
    popularity
    genres
    siteUrl
    coverImage { large }
  }
}`;

const caja = (titulo, lineas, pie = 'AKAME-SCRAPERS') =>
    '╭┈──◯◝ ⬢ *' + titulo + '*\n' +
    lineas.filter(Boolean).map((l) => (l.startsWith('>') ? l : '┆ ❀ ' + l)).join('\n') + '\n' +
    '╰┈──◯◞ ✿ ' + pie;

const consultar = async (busqueda) => {
    const res = await fetch(API, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'User-Agent': 'AKAME-SCRAPERS/1.0 (+https://github.com/Gus-1337/AKAME-SCRAPERS)'
        },
        body: JSON.stringify({ query: CONSULTA, variables: { s: busqueda } }),
        signal: AbortSignal.timeout(15000)
    });
    if (!res.ok) throw new Error('AniList respondió ' + res.status);
    const json = await res.json();
    if (json?.errors?.length) throw new Error(json.errors[0].message);
    return json?.data?.Media;
};

/** AniList manda la sinopsis con <br> y entidades HTML. */
const limpiar = (html) =>
    String(html || '')
        .replace(/<br\s*\/?>/gi, ' ')
        .replace(/<[^>]+>/g, '')
        .replace(/&quot;/g, '"').replace(/&#039;|&apos;/g, "'")
        .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
        .replace(/\s+/g, ' ')
        .trim();

const recortar = (texto, max = 700) => {
    const t = limpiar(texto);
    return t.length <= max ? t : t.slice(0, t.lastIndexOf(' ', max)) + '…';
};

const ESTADO = { FINISHED: 'Terminado', RELEASING: 'En emisión', NOT_YET_RELEASED: 'Sin estrenar', CANCELLED: 'Cancelado', HIATUS: 'En pausa' };

module.exports = {
    command: ['anime', 'animeinfo'],
    description: 'Ficha de anime (AniList) sin API key',
    category: 'scrapers',

    run: async (ctx) => {
        const { sock, chat, msg, args, usedPrefix } = ctx;
        const p = usedPrefix || '.';
        const responder = (texto) => sock.sendMessage(chat, { text: texto }, { quoted: msg });

        const consulta = String(args?.join(' ') || '').trim();
        if (!consulta) {
            return responder(caja('ANIME', [
                `*Uso* › ${p}anime <nombre>`,
                `*Ejemplo* › ${p}anime one piece`,
                '> Datos de AniList · sin API key ♡'
            ]));
        }

        try {
            const a = await consultar(consulta);
            if (!a) {
                return responder(caja('SIN RESULTADOS', [ 'No encontré › *' + consulta + '*' ]));
            }

            const titulo = a.title?.romaji || a.title?.english || a.title?.native || consulta;
            const caption = caja('ANIME', [
                '*' + titulo + '*',
                a.title?.native && a.title.native !== titulo ? '_' + a.title.native + '_' : '',
                '',
                a.averageScore ? '⭐ Puntaje › ' + a.averageScore + '/100' : '⭐ Puntaje › sin votos',
                '❤️ Popularidad › ' + (a.popularity || 0).toLocaleString('es-PE'),
                '📺 Episodios › ' + (a.episodes || '—') + ' · ' + (ESTADO[a.status] || a.status || '—'),
                '🎬 Formato › ' + (a.format || '—') + (a.seasonYear ? ' · ' + a.seasonYear : ''),
                '🏷️ Géneros › ' + ((a.genres || []).join(', ') || '—'),
                '',
                recortar(a.description),
                '',
                '*Link* › ' + (a.siteUrl || 'https://anilist.co/anime/' + a.id)
            ]);

            if (a.coverImage?.large) {
                try {
                    return await sock.sendMessage(chat, { image: { url: a.coverImage.large }, caption }, { quoted: msg });
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
