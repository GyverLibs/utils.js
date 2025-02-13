//#region math
export const random = (min, max) => Math.random() * (max - min) + min;
export const randomInt = (min, max) => Math.floor(random(min, max));
export const radians = (deg) => deg * 0.0174532925;
export const degrees = (rad) => rad * 57.2957795130;
export const constrain = (x, min, max) => x < min ? min : (x > max ? max : x);
export const map = (x, in_min, in_max, out_min, out_max) => (in_max == in_min) ? out_min : ((x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min);
export const parseFloatNoNaN = (str) => { let f = parseFloat(str); return isNaN(f) ? 0 : f; }

//#region misc
export const sleep = ms => new Promise(r => setTimeout(r, ms));

export const last = (arr, i = 1) => arr[arr.length - i];

export function hash(str) {
    let h = new Uint32Array([0]);
    for (let i = 0; i < str.length; i++) {
        h[0] += (h[0] << 5) + str.charCodeAt(i);
    }
    return h[0];
}

//#region time
export const now = () => (new Date()).getTime();
export const localTime = (unix) => new Date(unix - (new Date().getTimezoneOffset()) * 60000);

//#region render
export const waitFrame = () => new Promise(requestAnimationFrame);

export async function wait2Frame() {
    await waitFrame();
    await waitFrame();
}

export async function waitRender(elm, cb = null) {
    return new Promise(res => {
        let e = elm;
        while (e.parentNode) e = e.parentNode;
        if (e instanceof Document) {
            if (cb) cb(elm);
            res(elm);
        }
        const obs = new MutationObserver((mut) => {
            if (mut[0].addedNodes.length === 0) return;
            if (Array.prototype.indexOf.call(mut[0].addedNodes, e) === -1) return;
            obs.disconnect();
            if (cb) cb(elm);
            res(elm);
        });
        obs.observe(window.document.body, { childList: true, subtree: true });
    });
}

//#region color
export const intToColor = (int) => "#" + Number(int).toString(16).padStart(6, '0');

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
                default: return '#000';
            }
        } else if (parseInt(col)) {
            return makeWebColor(parseInt(col));
        } else {
            return col;
        }
    }
}

export const hsl2rgb = (h, s, l) => {
    h %= 360;
    let a = s * Math.min(l, 1 - l);
    let f = (n, k = (n + h / 30) % 12) => l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return 'rgb(' + Math.round(f(0) * 255) + ',' + Math.round(f(8) * 255) + ',' + Math.round(f(4) * 255) + ')';
}

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