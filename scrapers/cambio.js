/**
 * .cambio <monto> <de> <a> — conversión de divisas al día.
 * Autor: Gus · Licencia MIT
 * Canal: https://whatsapp.com/channel/0029VbDPchgEAKWO4mMYtC1Q
 */

const API = 'https://open.er-api.com/v6/latest/';

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
        signal: AbortSignal.timeout(12000)
    });
    if (!res.ok) throw new Error('er-api respondió ' + res.status);
    return res.json();
};

const POPULARES = ['PEN', 'ARS', 'MXN', 'COP', 'CLP', 'BRL', 'BOB', 'EUR'];

const numero = (n) => n.toLocaleString('es-419', { maximumFractionDigits: 2 });

module.exports = {
    command: ['cambio', 'divisa', 'dolar', 'conversor'],
    description: 'Conversión de divisas sin API key',
    category: 'scrapers',

    run: async (ctx) => {
        const { sock, chat, msg, args, usedPrefix } = ctx;
        const p = usedPrefix || '.';
        const responder = (texto) => sock.sendMessage(chat, { text: texto }, { quoted: msg });

        const partes = (args || []).map((x) => String(x).toLowerCase());
        const monto = Number(String(partes[0] || '').replace(',', '.')) || 0;

        try {
            // .cambio            → tabla rápida contra el dólar
            if (!partes.length) {
                const d = await pedir(API + 'USD');
                if (d?.result !== 'success') throw new Error('la API no devolvió datos');
                const lineas = POPULARES.filter((m) => d.rates[m]).map(
                    (m) => '💵 1 USD › *' + numero(d.rates[m]) + ' ' + m + '*'
                );
                return responder(caja('DÓLAR HOY', [
                    ...lineas,
                    '',
                    '> Actualizado › ' + String(d.time_last_update_utc || '').slice(0, 16),
                    '> open.er-api.com · sin API key ♡'
                ]));
            }

            const de = (partes[1] || 'usd').toUpperCase().slice(0, 3);
            const a = (partes[2] || 'pen').toUpperCase().slice(0, 3);
            if (!monto) {
                return responder(caja('CAMBIO', [
                    `*Uso* › ${p}cambio <monto> <de> <a>`,
                    `*Ejemplo* › ${p}cambio 100 usd pen`,
                    '> Códigos ISO: USD, PEN, ARS, MXN, EUR… ♡'
                ]));
            }

            const d = await pedir(API + de);
            if (d?.result !== 'success') {
                return responder(caja('MONEDA RARA', [ 'No conozco › *' + de + '*' ]));
            }
            const tasa = d.rates?.[a];
            if (!tasa) {
                return responder(caja('MONEDA RARA', [ 'No conozco › *' + a + '*' ]));
            }

            return responder(caja('CAMBIO', [
                '*' + numero(monto) + ' ' + de + '*  →  *' + numero(monto * tasa) + ' ' + a + '*',
                '',
                '📊 1 ' + de + ' › ' + numero(tasa) + ' ' + a,
                '🗓️ Actualizado › ' + String(d.time_last_update_utc || '').slice(0, 16),
                '',
                '> open.er-api.com · sin API key ♡'
            ]));
        } catch (e) {
            return responder(caja('NO PUDE', [ e?.message || 'algo salió mal', '> Probá de nuevo ♡' ]));
        }
    }
};
