import path from 'path'
import process from 'process'
import Module from 'module'
import https from 'https'
import os from 'os'
import fs from 'fs'

const __tmpdir = os.tmpdir();

function rand(){
    return Math.random().toString(36).substring(2, 15)
}

function httpsDownload(url, file){
    return new Promise((resolve, reject) => {
        const fws = fs.createWriteStream(file);
        https.get(url, response => {
            response.pipe(fws);
            fws.on('finish', () => fws.close(resolve))
        }).on('error', err => {
            fs.unlink(file);
            reject(err)
        })
    })
}

// will contain module file url and real url pairs
const httpsModuleLinksStore = {};

async function httpsDownloadModule(url){
    const modulePath = path.resolve(__tmpdir, rand() + '.mjs');
    await httpsDownload(url, modulePath);
    httpsModuleLinksStore[new URL(`${modulePath}`, 'file://').href] = url;
    return modulePath
}

const builtins = Module.builtinModules;

const baseURL = new URL(`${process.cwd()}/`, 'file://').href;

export function getFormat(specifier, opts, defaultGetFormat){
    if(specifier.startsWith('https://')) return { format: 'dynamic' };
    else return defaultGetFormat(specifier, opts, defaultGetFormat)
}

export function resolve(specifier, { parentURL: parentModuleURL } = { parentURL: baseURL }, defaultResolve){
    if (builtins.includes(specifier)) return {
        url: 'nodejs:' + specifier,
        format: 'builtin'
    }

    if(specifier.startsWith('https://') || (
        parentModuleURL in httpsModuleLinksStore &&
        /^\.\.?/.test(specifier)
    )){
        return {
            url: new URL(specifier, httpsModuleLinksStore[parentModuleURL]).href,
            format: 'dynamic',
        }
    }

    if (/^\.{0,2}[/]/.test(specifier) !== true && !specifier.startsWith('file:')) throw new Error(`imports must begin with '/', './', or '../'; '${specifier}' does not`);

    const resolved = new URL(specifier, parentModuleURL);
    const ext = path.extname(resolved.pathname).slice(1);

    if(ext === 'mjs') return {
        url: resolved.href,
        format: 'module'
    }

    if(ext === 'json') return {
        url: resolved.href,
        format: 'json'
    }

    if(ext === 'wasm') return {
        url: resolved.href,
        format: 'wasm'
    }

    if(ext === 'js') return {
        url: resolved.href,
        format: 'commonjs'
    }

    throw new Error('Unknown file ext provided: ' + ext)
}

export async function dynamicInstantiate(url){
    const fname = await httpsDownloadModule(url);
    const exp = await import(fname);
    fs.unlink(fname, () => {});
    const exports = Object.getOwnPropertyNames(exp);
    return {
        exports,
        execute: (exportObj) => {
            exports.forEach(name => {
                exportObj[name].set(exp[name])
            })
        }
    }
}
