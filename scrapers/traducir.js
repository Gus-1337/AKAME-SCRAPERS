/**
 * .traducir [idioma] <texto> — traduce texto (o una respuesta) sin API key.
 * Autor: Gus · Licencia MIT
 * Canal: https://whatsapp.com/channel/0029VbDPchgEAKWO4mMYtC1Q
 */

const API = 'https://api.mymemory.translated.net/get';

const IDIOMAS = {
    es: 'español', en: 'inglés', pt: 'portugués', fr: 'francés', de: 'alemán',
    it: 'italiano', ja: 'japonés', zh: 'chino', ru: 'ruso', ar: 'árabe', hi: 'hindi',
    tr: 'turco', id: 'indonesio', ko: 'coreano'
};

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
    if (!res.ok) throw new Error('el traductor respondió ' + res.status);
    return res.json();
};

/** Texto citado, si el comando se usa respondiendo a un mensaje. */
const citado = (msg) => {
    const c = msg?.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    return c?.conversation || c?.extendedTextMessage?.text || c?.imageMessage?.caption || '';
};

module.exports = {
    command: ['traducir', 'translate', 'tr'],
    description: 'Traduce texto sin API key',
    category: 'scrapers',

    run: async (ctx) => {
        const { sock, chat, msg, args, usedPrefix } = ctx;
        const p = usedPrefix || '.';
        const responder = (texto) => sock.sendMessage(chat, { text: texto }, { quoted: msg });

        const partes = [...(args || [])].map(String);
        let destino = 'es';
        if (partes[0] && IDIOMAS[partes[0].toLowerCase()]) destino = partes.shift().toLowerCase();

        let texto = partes.join(' ').trim();
        if (!texto) texto = String(citado(msg) || '').trim();

        if (!texto) {
            return responder(caja('TRADUCIR', [
                `*Uso* › ${p}traducir [idioma] <texto>`,
                `*Ejemplo* › ${p}traducir en hola mundo`,
                `*Idiomas* › ${Object.keys(IDIOMAS).join(', ')}`,
                '> O respondé un mensaje con ' + p + 'traducir en ♡'
            ]));
        }

        try {
            const url = API + '?q=' + encodeURIComponent(texto.slice(0, 480)) + '&langpair=autodetect|' + destino;
            const r = await pedir(url);
            const traducido = String(r?.responseData?.translatedText || '').trim();
            if (!traducido || /MYMEMORY WARNING|QUERY LENGTH LIMIT/i.test(traducido)) {
                throw new Error('el traductor no devolvió texto (¿texto muy largo?)');
            }
            const origen = r?.responseData?.detectedLanguage || 'auto';

            return responder(caja('TRADUCCIÓN', [
                '*' + (IDIOMAS[origen] || origen) + '* → *' + (IDIOMAS[destino] || destino) + '*',
                '',
                traducido,
                '',
                '> MyMemory · sin API key ♡'
            ]));
        } catch (e) {
            return responder(caja('NO PUDE', [ e?.message || 'algo salió mal', '> Probá de nuevo ♡' ]));
        }
    }
};
