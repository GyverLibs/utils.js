//#region math
export const random = (min, max) => Math.random() * (max - min) + min;
export const randomInt = (min, max) => Math.floor(random(min, max));
export const radians = (deg) => deg * 0.0174532925;
export const degrees = (rad) => rad * 57.2957795130;
export const constrain = (x, min, max) => x < min ? min : (x > max ? max : x);
export const roundInt = (x) => Math.round(x) << 0;
export const map = (x, in_min, in_max, out_min, out_max) => (in_max == in_min) ? out_min : ((x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min);
export const parseFloatNoNaN = (str) => { let f = parseFloat(str); return isNaN(f) ? 0 : f; }
export const findFloat = (str) => { let res = str.match(/\-?\d*\.?\d*/gm); return res ? res[0] : '0'; }
export const formatToStep = (val, step) => { let d = step.toString().split('.')[1]; return Number(val).toFixed(d ? d.length : 0); }

//#region misc
export const isTouch = () => "ontouchstart" in window.document.documentElement;
export const sleep = (ms) => new Promise(r => setTimeout(r, ms));
export const last = (arr, i = 1) => arr[arr.length - i];
export const clipWrite = (str) => navigator.clipboard.writeText(str);
export const clipRead = () => navigator.clipboard.readText();
export const encodeText = (str) => (new TextEncoder()).encode(str);
export const decodeText = (str) => (new TextDecoder()).decode(str);
export const makeCopy = v => (typeof v === 'object' && v !== null) ? (Array.isArray(v) ? [...v] : { ...v }) : v;

export function shallowEqual(a, b) {
    if (a === b) return true;
    if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;

    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) return false;

    for (let key of keysA) {
        if (a[key] !== b[key]) return false;
    }
    return true;
}

export async function makeDefer() {
    // const df = makeDefer(); await df.wait ..... df.resolve()
    let resolve, reject;
    const wait = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { wait, resolve, reject };
}

export function parseCSV(str) {
    // https://stackoverflow.com/a/14991797
    const arr = [];
    let quote = false;
    for (let row = 0, col = 0, c = 0; c < str.length; c++) {
        let cc = str[c], nc = str[c + 1];
        arr[row] = arr[row] || [];
        arr[row][col] = arr[row][col] || '';
        if (cc == '"' && quote && nc == '"') { arr[row][col] += cc; ++c; continue; }
        if (cc == '"') { quote = !quote; continue; }
        if ((cc == ';' || cc == ',') && !quote) { ++col; continue; }
        if (cc == '\r' && nc == '\n' && !quote) { ++row; col = 0; ++c; continue; }
        if (cc == '\n' && !quote) { ++row; col = 0; continue; }
        if (cc == '\r' && !quote) { ++row; col = 0; continue; }
        arr[row][col] += cc;
    }
    return arr;
}

//#region hash
export function hash(str) {
    let h = new Uint32Array([0]);
    for (let i = 0; i < str.length; i++) {
        h[0] += (h[0] << 5) + str.charCodeAt(i);
    }
    return h[0];
}

export function crc32(data) {
    let crc = new Uint32Array(1);
    crc[0] = 0;
    crc[0] = ~crc[0];
    let str = (typeof (data) === 'string');
    for (let i = 0; i < data.length; i++) {
        crc[0] ^= str ? data[i].charCodeAt(0) : data[i];
        for (let i = 0; i < 8; i++) crc[0] = (crc[0] & 1) ? ((crc[0] / 2) ^ 0x4C11DB7) : (crc[0] / 2);
    }
    crc[0] = ~crc[0];
    return crc[0];
}

//#region elements
export function addStyle(css) {
    if (css) {
        let style = document.createElement('style');
        style.innerText = css;
        document.head.appendChild(style);
    }
    return null;
}
export function clearNode(n) {
    while (n.firstChild) n.removeChild(n.lastChild);
}

//#region time
export const now = () => (new Date()).getTime();
export const localTime = (unix) => new Date(unix - (new Date().getTimezoneOffset()) * 60000);

export class Timer {
    constructor(isTout, cb, time) {
        this.tout = isTout;
        this.cb = cb;
        this.time = time;
    }
    setTime(time) {
        this.time = time;
    }
    onReady(cb) {
        this.cb = cb;
    }
    start() {
        if (this.tmr) return;
        this.tout ? setTimeout(() => { this.tmr = null, this.cb() }, this.time) : setInterval(this.cb, this.time);
    }
    restart() {
        this.stop();
        this.start();
    }
    stop() {
        this.tout ? clearTimeout(this.tmr) : clearInterval(this.tmr);
        this.tmr = null;
    }
    running() {
        return this.tmr != null;
    }
}

export class Interval extends Timer {
    constructor(cb, time) {
        super(false, cb, time);
    }
}

export class Timeout extends Timer {
    constructor(cb, time) {
        super(true, cb, time);
    }
}

//#region render
export const waitFrame = () => new Promise(r => requestAnimationFrame(() => setTimeout(r, 0)));

// Element/Array
export const checkRender = (els) => {
    if (!Array.isArray(els)) return els.clientWidth || els.clientHeight;
    for (let el of els) if (!checkRender(el)) return 0;
    return 1;
}

export async function waitRender(el, cb = null, tries = 10) {
    while (!checkRender(el) && --tries) await waitFrame();
    if (!tries) el = null;
    if (cb) cb(el);
    return el;
}

//#region color
export const intToColor = (int) => "#" + Number(int).toString(16).padStart(6, '0');
export const colorToInt = (col) => {
    let col4 = col => parseInt(col[1] + col[1] + col[2] + col[2] + col[3] + col[3], 16);
    let col7 = col => parseInt(col.slice(1, 7), 16);

    if (col && col[0] == '#') {
        switch (col.length) {
            case 4: return col4(col);
            case 5: return col4(col) | (parseInt(col[4] + col[4], 16) << 24);
            case 7: return col7(col);
            case 9: return col7(col) | (parseInt(col.slice(7, 9), 16) << 24);
        }
    }
    return 0;
}
export const rgbTo24 = (r, g, b) => (r << 16) | (g << 8) | b;
// export const rgbaTo24 = (r, g, b, a) => (rgbTo24(r, g, b) << 8) | a;
export const rgbTo888 = rgbTo24;
export const rgbTo565 = (r, g, b) => ((r & 0b11111000) << 8) | ((g & 0b11111100) << 3) | (b >> 3);
export const rgbTo233 = (r, g, b) => (r & 0b11000000) | ((g & 0b11100000) >> 2) | ((b & 0b11100000) >> 5);
export const HEXtoRGB = (hex) => [(hex >> 16) & 0xff, (hex >> 8) & 0xff, hex & 0xff, (hex >> 24) & 0xff];

// (r, g, b, a: 8bit|float) | (r, g, b) | (rrggbb 24bit) | (#rgb) | (#rgba) | (#rrggbb) | (#rrggbbaa)
export function makeWebColor(col, g, b, a) {
    if (!isNaN(g) && !isNaN(b)) return isNaN(a) ? `rgb(${col},${g},${b})` : `rgba(${col},${g},${b},${Number.isInteger(a) ? a / 255.0 : a})`;

    if (typeof col === 'number') {
        return intToColor(col);
    } else if (typeof col === 'string') {
        if (col.startsWith('#')) {
            switch (col.length) {
                case 4: case 5: return '#' + col[1] + col[1] + col[2] + col[2] + col[3] + col[3] + (col.length == 5 ? (col[4] + col[4]) : '');
                case 7: case 9: return col;
                default: return '#000000';
            }
        } else if (parseInt(col)) {
            return makeWebColor(parseInt(col));
        } else {
            return col;
        }
    }
}

// (0-360, 0-1, 0-1)
export const hsl2rgb = (h, s, l) => {
    h %= 360;
    let a = s * Math.min(l, 1 - l);
    let f = (n, k = (n + h / 30) % 12) => l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return 'rgb(' + Math.round(f(0) * 255) + ',' + Math.round(f(8) * 255) + ',' + Math.round(f(4) * 255) + ')';
}
export const hsl2rgb8 = (h, s, l) => hsl2rgb(h / 255 * 360, s / 255, l / 255);
export const hsv2rgb8 = (h, s, v) => hsl2rgb8(h, s, v / 2);

export const adjustColor = (col24, ratio) => {
    let res = 0;
    for (let i = 0; i < 3; i++) {
        let comp = (col24 & 0xff0000) >> 16;
        comp = Math.min(255, Math.floor((comp + 1) * ratio));
        res <<= 8;
        res |= comp;
        col24 <<= 8;
    }
    return res;
}

export const splitColor = (col) => {
    col = makeWebColor(col);
    if (col.startsWith('#')) {
        return col.slice(1).match(/.{2}/g).map(x => parseInt(x, 16));
    } else if (col.startsWith('rgb')) {
        let res = col.match(/\((.+?)\)/);
        if (res) return res[1].split(',').map(Number);
    }
    return [0, 0, 0];
}

export const midColor = (col) => {
    let mid = 0;
    splitColor(col).forEach((x, i) => (i < 3) && (mid += x));
    return mid / 3;
}

export const deltaColor = (col) => {
    col = splitColor(col);
    return Math.max(...col) - Math.min(...col);
}

export const contrastColor = (col, trsh = 128) => midColor(col) < trsh ? 'white' : 'black';

//#region http
export class DelaySender {
    constructor(send_cb, period) {
        this.send_cb = send_cb;
        this.period = period;
    }

    async send(value, allowRepeat = true) {
        if (!this.sending) {
            this.sending = true;
            await this.send_cb(value);
            await sleep(this.period);
            this.sending = false;
            if (this.cache !== undefined && (allowRepeat || !shallowEqual(this.cache, value))) {
                let t = this.cache;
                this.cache = undefined;
                this.send(t);
            }
        } else {
            this.cache = value;
        }
    }
}

export function download(blob, name) {
    let link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = name;
    link.click();
}

export function httpPost(url, data, progress) {
    return new Promise(res => {
        let xhr = new XMLHttpRequest();
        xhr.onreadystatechange = () => {
            if (xhr.readyState == XMLHttpRequest.DONE) res(xhr.status == 200);
        }
        xhr.upload.onprogress = e => {
            if (e.lengthComputable) progress(parseInt((e.loaded / e.total) * 100));
        }
        xhr.onerror = e => res(false);
        xhr.open('POST', url, true);
        xhr.send(data);
    });
}

// fetch с поддержкой { timeout: N }
export async function fetchT(url, params = {}) {
    let res = null, ctrl, tmr;
    if (params.timeout) {
        ctrl = new AbortController();
        tmr = setTimeout(() => ctrl.abort(), params.timeout);
        params.signal = ctrl.signal;
    }
    try {
        res = await fetch(url, params);
    } catch (e) { }
    clearTimeout(tmr);
    return (res && res.ok) ? res : null;
}

export async function fetchTimeout(url, timeout = 5000) {
    return fetchT(url, { timeout: timeout });
}

export class FetchQueue {
    clear() {
        this._queue.forEach(f => f.res(null));
        this._queue = [];
    }

    async fetch(url, params) {
        return new Promise(res => {
            this._queue.push({ url, params, res });
            if (this._queue.length == 1) this._next();
        });
    }

    async _next() {
        let f = this._queue[0];
        f.res(await fetchT(f.url, f.params));
        this._queue.shift();
        if (this._queue.length) this._next();
    }

    _queue = [];
}

//#region StreamSplitter
export class StreamSplitter {
    ontext = null;

    constructor(eol = /\r?\n/, skipFirst = false) {
        this._eol = eol;
        this._skip = skipFirst;
    }

    reset() {
        this._buf = "";
    }

    write(str) {
        if (!this.ontext) return;

        this._buf += str;
        let t = this._buf.split(this._eol);
        if (t.length == 1) return;

        if (t[t.length - 1].length) this._buf = t.pop();
        else this._buf = "", t.pop();

        if (this._skip) t.shift(), this._skip = false;
        t.forEach(line => this.ontext(line));
    }

    _buf = "";
}

//#region EventEmitter
export class EventEmitter {
    constructor() {
        this.events = {};
    }

    on(event, listener) {
        if (!this.events[event]) this.events[event] = [];
        this.events[event].push(listener);
        return () => this.off(event, listener);
    }

    once(event, listener) {
        const off = this.on(event, (...args) => {
            off();
            listener(...args);
        });
    }

    emit(event, ...args) {
        if (this.events[event]) for (let lisn of this.events[event]) lisn(...args);
    }

    off(event, listener) {
        if (this.events[event]) this.events[event] = this.events[event].filter(lisn => lisn !== listener);
    }

    offAll(event) {
        delete this.events[event];
    }
}

//#region LS
export class LS {
    static has(key) {
        return localStorage.hasOwnProperty(key);
    }
    static get(key) {
        return JSON.parse(localStorage.getItem(key));
    }
    static remove(key) {
        localStorage.removeItem(key);
    }
    static set(key, val) {
        try {
            localStorage.setItem(key, JSON.stringify(val));
        } catch (e) {
            console.error(e);
        }
    }
    static init(key, val) {
        if (!LS.has(key)) LS.set(key, val);
    }
}

//#region md
export function parseMD(md, depth = 0) {
    if (depth > 10) return md;

    function parseLists(md) {
        const lines = md.split('\n');
        let result = '';
        let stack = []; //  {type, level}

        for (let line of lines) {
            const match = /^(\s*)([-]|\d+\.)\s+(.*)$/.exec(line);
            if (match) {
                const indent = match[1].length;
                const type = match[2].match(/^\d/) ? 'ol' : 'ul';
                const content = match[3];
                const level = Math.floor(indent / 2);

                if (!stack.length) {
                    result += `<${type}><li>${content}`;
                    stack.push({ type, level });
                    continue;
                }

                const prev = stack[stack.length - 1];

                if (level > prev.level) {
                    result += `<${type}><li>${content}`;
                    stack.push({ type, level });
                } else if (level === prev.level) {
                    result += `</li><li>${content}`;
                } else {
                    while (stack.length && stack[stack.length - 1].level >= level) {
                        result += `</li></${stack.pop().type}>`;
                    }
                    if (!stack.length || stack[stack.length - 1].type !== type) {
                        result += `<${type}><li>${content}`;
                        stack.push({ type, level });
                    } else {
                        result += `<li>${content}`;
                    }
                }
            } else {
                while (stack.length) {
                    result += `</li></${stack.pop().type}>`;
                }
                result += line + '\n';
            }
        }
        while (stack.length) {
            result += `</li></${stack.pop().type}>`;
        }

        return result;
    }

    const codeBlocks = [];
    md = md.replace(/```([\s\S]*?)```/g, (m, code) => {
        const id = codeBlocks.length;
        codeBlocks.push(`<pre><code>${code.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]))}</code></pre>`);
        return `§CODEBLOCK${id}§`;
    });

    return parseLists(md)
        .replace(/^---$/gm, '<hr>')
        .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">')
        .replace(/^###### (.*)$/gm, '<h6>$1</h6>')
        .replace(/^##### (.*)$/gm, '<h5>$1</h5>')
        .replace(/^#### (.*)$/gm, '<h4>$1</h4>')
        .replace(/^### (.*)$/gm, '<h3>$1</h3>')
        .replace(/^## (.*)$/gm, '<h2>$1</h2>')
        .replace(/^# (.*)$/gm, '<h1>$1</h1>')
        .replace(/(^>.*(?:\n>.*)*)/gm, match =>
            `<blockquote>${parseMD(match.split('\n').map(line => line.replace(/^>\s?/, '')).join('\n'), depth + 1)}</blockquote>`
        )
        .replace(/\[spoiler="([^"]+)"\]([\s\S]*?)\[\/spoiler\]/g, (m, name, content) =>
            `<details><summary>${name}</summary>${parseMD(content, depth + 1)}</details>`
        )
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/(^|[\s>])\*([^*\s][^*]*?)\*(?=[\s<]|$)/g, '$1<em>$2</em>')
        .replace(/^(?!<h\d|<ul|<ol|<pre|<p|<blockquote|<code|<hr|<img|<details|<summary)(.+)$/gm, '<p>$1</p>')
        .replace(/§CODEBLOCK(\d+)§/g, (_, i) => codeBlocks[i]);
}