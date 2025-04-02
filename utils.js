//#region math
export const random = (min, max) => Math.random() * (max - min) + min;
export const randomInt = (min, max) => Math.floor(random(min, max));
export const radians = (deg) => deg * 0.0174532925;
export const degrees = (rad) => rad * 57.2957795130;
export const constrain = (x, min, max) => x < min ? min : (x > max ? max : x);
export const map = (x, in_min, in_max, out_min, out_max) => (in_max == in_min) ? out_min : ((x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min);
export const parseFloatNoNaN = (str) => { let f = parseFloat(str); return isNaN(f) ? 0 : f; }
export const findFloat = (str) => { let res = str.match(/\-?\d*\.?\d*/gm); return res ? res[0] : '0'; }

//#region misc
export const isTouch = () => "ontouchstart" in window.document.documentElement;
export const sleep = (ms) => new Promise(r => setTimeout(r, ms));
export const last = (arr, i = 1) => arr[arr.length - i];
export const clipWrite = (str) => navigator.clipboard.writeText(str);
export const clipRead = () => navigator.clipboard.readText();
export const encodeText = (str) => (new TextEncoder()).encode(str);
export const download = (blob, name) => {
    let link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = name;
    link.click();
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
    setCb(cb) {
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
        if (this.tmr) this.tout ? clearTimeout(this.tmr) : clearInterval(this.tmr);
        this.tmr = null;
    }
    running() {
        return this.tmr;
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
export const rgbTo24 = (r, g, b) => (r << 16) | (g << 8) | b;
export const rgbaTo24 = (r, g, b, a) => (rgbTo24(r, g, b) << 8) | a;
export const HEXtoRGB = (hex) => [(hex >> 16) & 0xff, (hex >> 8) & 0xff, hex & 0xff];

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

export async function fetchTimeout(url, timeout = 5000) {
    const controller = new AbortController();
    const tmr = setTimeout(() => controller.abort(), timeout);
    let res = null;
    try {
        res = await fetch(url, { signal: controller.signal });
    } catch (e) { }
    clearTimeout(tmr);
    return res && res.ok ? res : null;
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
        } catch {
            console.log("Data is too big" + JSON.stringify(val).length);
        }
    }
}