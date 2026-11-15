/**
 * .letra <artista> - <canción> — letra de una canción.
 * Autor: Gus · Licencia MIT
 * Canal: https://whatsapp.com/channel/0029VbDPchgEAKWO4mMYtC1Q
 */

const API = 'https://api.lyrics.ovh/v1/';

const CANAL = 'https://whatsapp.com/channel/0029VbDPchgEAKWO4mMYtC1Q';

const caja = (titulo, lineas, pie = 'Gus') =>
    '╭┈──◯◝ ⬢ *' + titulo + '*\n' +
    lineas.filter(Boolean).map((l) => (l.startsWith('>') ? l : '┆ ❀ ' + l)).join('\n') + '\n' +
    '╰┈──◯◞ ✿ ' + pie + '\n' +
    '> 🌸 Sigue el canal › ' + CANAL;

const pedir = async (url) => {
    const res = await fetch(url, {
        headers: {
            'User-Agent': 'AKAME-SCRAPERS/1.0 (+https://github.com/Gus-1337/AKAME-SCRAPERS)',
            Accept: 'application/json'
        },
        signal: AbortSignal.timeout(15000)
    });
    if (!res.ok) throw new Error('lyrics.ovh no tiene esa letra (' + res.status + ')');
    return res.json();
};

module.exports = {
    command: ['letra', 'lyrics'],
    description: 'Letra de una canción sin API key',
    category: 'scrapers',

    run: async (ctx) => {
        const { sock, chat, msg, args, usedPrefix } = ctx;
        const p = usedPrefix || '.';
        const responder = (texto) => sock.sendMessage(chat, { text: texto }, { quoted: msg });

        const crudo = String(args?.join(' ') || '').trim();
        if (!crudo) {
            return responder(caja('LETRA', [
                `*Uso* › ${p}letra <artista> - <canción>`,
                `*Ejemplo* › ${p}letra coldplay - yellow`,
                '> lyrics.ovh · sin API key ♡'
            ]));
        }

        // se acepta "artista - canción" o "artista, canción"
        const partes = crudo.split(/\s+-\s+|,\s*/);
        if (partes.length < 2) {
            return responder(caja('FALTA EL TÍTULO', [
                'Separá artista y canción con un guion',
                `*Ejemplo* › ${p}letra coldplay - yellow`
            ]));
        }
        const artista = partes[0].trim();
        const tema = partes.slice(1).join(' ').trim();

        try {
            const r = await pedir(API + encodeURIComponent(artista) + '/' + encodeURIComponent(tema));
            const letra = String(r?.lyrics || '').replace(/\r/g, '').replace(/\n{3,}/g, '\n\n').trim();
            if (!letra) {
                return responder(caja('SIN LETRA', [ 'No encontré la letra de › *' + tema + '*' ]));
            }

            const encabezado = '🎵 *' + artista + '* — *' + tema + '*\n\n';
            // WhatsApp corta los mensajes larguísimos: si sobra, se avisa
            const tope = 3000;
            if (encabezado.length + letra.length <= tope) {
                return responder(encabezado + letra + '\n\n> lyrics.ovh · sin API key ♡');
            }
            return responder(
                encabezado + letra.slice(0, tope - encabezado.length) +
                '\n\n> _Letra recortada por largo_ ♡'
            );
        } catch (e) {
            return responder(caja('NO PUDE', [
                e?.message || 'algo salió mal',
                '> Revisá que el artista y el título estén bien escritos ♡'
            ]));
        }
    }
};
