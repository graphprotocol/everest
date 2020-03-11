#!/bin/bash

OUT_DIR="build/full"

mkdir -p ${OUT_DIR}

echo "Flattening contracts..."

for path in contracts/*.sol; do
    echo ${path}
    truffle-flattener ${path} > ${OUT_DIR}/${path}
done

echo "Done."