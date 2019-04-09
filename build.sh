mkdir -p js out/js
tsc &&
    browserify js/vis/main.js > out/js/main.js