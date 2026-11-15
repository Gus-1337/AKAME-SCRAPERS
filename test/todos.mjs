#!/usr/bin/env node
/**
 * Prueba TODOS los scrapers contra internet, en vivo.
 *
 *   node test/todos.mjs
 *
 * Para cada uno llama a `run()` con un contexto falso (como el de un bot de
 * Baileys) y verifica que responda algo con contenido. Si alguno falla, tira
 * el error y sale con código 1 — ideal para correr en un cron y avisar al canal.
 *
 * AKAME-SCRAPERS · Licencia MIT
 */

import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

// Los tres de YouTube bajan el archivo sólo si no está en modo test: así la
// prueba no se lleva 10 MB de datos cada vez. Igual resuelven el video, eligen
// el formato y dicen si YouTube dejó descargarlo desde esta IP.
process.env.AKAME_TEST = '1';
const VIDEO_PRUEBA = 'https://youtu.be/dQw4w9WgXcQ';

const PRUEBAS = [
    ['wiki', ['Python']],
    ['clima', ['Buenos Aires']],
    ['cripto', ['btc']],
    ['cambio', ['100', 'usd', 'pen']],
    ['anime', ['one piece']],
    ['serie', ['breaking bad']],
    ['letra', ['coldplay', '-', 'yellow']],
    ['noticias', []],
    ['traducir', ['en', 'hola mundo']],
    ['play', [VIDEO_PRUEBA]],
    ['ytmp3', [VIDEO_PRUEBA]],
    ['ytmp4', [VIDEO_PRUEBA]]
];

/** Contexto falso: junta lo que el scraper manda por WhatsApp. */
const contexto = (args) => {
    const enviados = [];
    const sock = {
        sendMessage: async (chat, payload) => {
            enviados.push(payload);
            return { key: { id: 'test' } };
        }
    };
    return {
        enviados,
        ctx: { sock, chat: 'test@s.whatsapp.net', msg: { key: { id: 'test' } }, args, usedPrefix: '.', prefix: '.' }
    };
};

const textoDe = (payload) => String(payload?.text || payload?.caption || '');

let ok = 0;
const fallas = [];

for (const [nombre, args] of PRUEBAS) {
    const { enviados, ctx } = contexto(args);
    const t0 = Date.now();
    let error = null;

    try {
        const modulo = require(`../scrapers/${nombre}.js`);
        if (typeof modulo?.run !== 'function') throw new Error('no exporta run()');
        await modulo.run(ctx);
    } catch (e) {
        error = e?.message || String(e);
    }

    const ms = Date.now() - t0;
    const texto = textoDe(enviados[0]);
    const vacio = !texto && !enviados[0]?.image;
    const falloDeclarado = /NO PUDE|SIN RESULTADOS|NO ENCONTRÉ|FUENTE DESCONOCIDA|SIN DATOS/i.test(texto);

    if (error || vacio || falloDeclarado) {
        fallas.push(nombre);
        console.log(`✘ ${nombre.padEnd(9)} ${ms}ms  ${error || texto.split('\n').slice(0, 3).join(' ').slice(0, 120)}`);
    } else {
        ok++;
        const muestra = texto.replace(/\n/g, ' ').slice(0, 70);
        console.log(`✔ ${nombre.padEnd(9)} ${String(ms).padStart(5)}ms  ${muestra}`);
    }
}

console.log('');
console.log(`RESULTADO · ${ok}/${PRUEBAS.length} andando` + (fallas.length ? ' · fallan: ' + fallas.join(', ') : ''));
process.exit(fallas.length ? 1 : 0);
