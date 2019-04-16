mkdir -p js out/js
tsc &&
    npx browserify js/vis/main.js > out/js/main.js