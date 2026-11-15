/**
 * .cripto <moneda> — precio y variación de criptomonedas.
 *
 * Sin API key: CoinGecko tiene endpoint público (con límite de ~30 pedidos por
 * minuto, de sobra para un bot). Cero dependencias.
 *
 * Uso:  .cripto btc
 *       .cripto ethereum
 *       .cripto          (top 10 por capitalización)
 *
 * Autor: AKAME-SCRAPERS · Licencia MIT
 */

const MERCADOS = 'https://api.coingecko.com/api/v3/coins/markets';
const BUSCAR = 'https://api.coingecko.com/api/v3/search';

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
    if (!res.ok) throw new Error('CoinGecko respondió ' + res.status + ' (probá en 30s)');
    return res.json();
};

const precio = (n) => {
    if (n == null) return '—';
    if (n >= 1000) return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });
    if (n >= 1) return '$' + n.toFixed(2);
    return '$' + n.toFixed(n < 0.01 ? 8 : 4);
};

const capital = (n) => {
    if (!n) return '—';
    if (n >= 1e12) return '$' + (n / 1e12).toFixed(2) + 'T';
    if (n >= 1e9) return '$' + (n / 1e9).toFixed(1) + 'B';
    return '$' + (n / 1e6).toFixed(1) + 'M';
};

const flecha = (v) => (v == null ? '' : (v >= 0 ? '🟢 +' : '🔴 ') + v.toFixed(2) + '%');

module.exports = {
    command: ['cripto', 'crypto', 'btc', 'coin'],
    description: 'Precio de criptomonedas sin API key',
    category: 'scrapers',

    run: async (ctx) => {
        const { sock, chat, msg, args, usedPrefix } = ctx;
        const p = usedPrefix || '.';
        const responder = (texto) => sock.sendMessage(chat, { text: texto }, { quoted: msg });

        const consulta = String(args?.join(' ') || '').trim();

        try {
            // sin argumentos: top 10
            if (!consulta) {
                const top = await pedir(
                    MERCADOS + '?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&price_change_percentage=24h'
                );
                const lineas = top.map((c, i) =>
                    (i + 1) + '. *' + c.symbol.toUpperCase() + '* › ' + precio(c.current_price) + ' · ' + flecha(c.price_change_percentage_24h)
                );
                return responder(caja('TOP 10 CRIPTO', lineas, 'Fuente: CoinGecko ♡'));
            }

            // buscar el id real (btc → bitcoin)
            const buscado = await pedir(BUSCAR + '?query=' + encodeURIComponent(consulta));
            const id = buscado?.coins?.[0]?.id;
            if (!id) {
                return responder(caja('NO ENCONTRÉ ESA MONEDA', [ 'Probá con el nombre completo › *' + consulta + '*' ]));
            }

            const [c] = await pedir(
                MERCADOS + '?vs_currency=usd&ids=' + encodeURIComponent(id) + '&price_change_percentage=24h,7d'
            );
            if (!c) {
                return responder(caja('SIN DATOS', [ 'CoinGecko no devolvió nada para › *' + consulta + '*' ]));
            }

            const caption = caja('CRIPTO · ' + c.symbol.toUpperCase(), [
                '*' + c.name + '*',
                '',
                '💵 *' + precio(c.current_price) + '*',
                '📈 24h › ' + flecha(c.price_change_percentage_24h),
                '📊 7d › ' + flecha(c.price_change_percentage_7d_in_currency),
                '🏦 Cap. › ' + capital(c.market_cap),
                '🥇 Ranking › #' + (c.market_cap_rank || '—'),
                '',
                '> Fuente: CoinGecko ♡'
            ]);

            if (c.image) {
                try {
                    return await sock.sendMessage(chat, { image: { url: c.image }, caption }, { quoted: msg });
                } catch {
                    /* sin imagen, texto */
                }
            }
            return responder(caption);
        } catch (e) {
            return responder(caja('NO PUDE', [ e?.message || 'algo salió mal', '> Probá de nuevo en un rato ♡' ]));
        }
    }
};
