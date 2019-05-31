#!/bin/bash

# one liner off Stackoverflow
BUILD_SH_LOCATION="$( cd "$( dirname "${BASH_SOURCE[0]}" )" > /dev/null 2>&1 && pwd )"

mkdir -p out/js out/multi-file

(
    (
        echo "<!DOCTYPE html>"
        echo "<html>"
        echo "<head>"
        cat $BUILD_SH_LOCATION/html/single-script.html
        cat $BUILD_SH_LOCATION/html/style.html
        echo "</head>"
        cat $BUILD_SH_LOCATION/html/body.html
    ) > $BUILD_SH_LOCATION/out/multi-file/index.html
) &

(npx tsc &&
    npx browserify out/js/browser/main.js > out/multi-file/main.js
)
