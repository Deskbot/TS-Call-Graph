#!/bin/bash

# one liner off Stackoverflow
BUILD_SH_LOCATION="$( cd "$( dirname "${BASH_SOURCE[0]}" )" > /dev/null 2>&1 && pwd )"

mkdir -p out/js out/single-file

tsc

(
    echo "<!DOCTYPE html>"
    echo "<html>"
    echo "<head>"
    echo "<script defer type=\"module\">"
    npx browserify out/js/browser/main.js
    echo "</script>"
    cat $BUILD_SH_LOCATION/html/style.html
    echo "</head>"
    cat $BUILD_SH_LOCATION/html/body.html
) > $BUILD_SH_LOCATION/out/single-file/index.html