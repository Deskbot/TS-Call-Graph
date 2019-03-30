mkdir js out/js
tsc &&
    browserify js/vis/draw.js > out/js/index.js