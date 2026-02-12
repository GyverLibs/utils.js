import * as u from 'https://gyverlibs.github.io/utils.js/utils.min.js'
// import * as u from "../utils.js";

document.body.style.background = u.hsv2rgb8(255, 255, 255);
let t = new u.Timer(true, () => console.log(123), 1000);
t.start();