#!/bin/bash

set -x

function prune_db {
    db_file="$1"

    if [[ -z $db_file ]]
    then
        echo "Missing arguments, usage: prune_db <db-file>"
        exit 1
    fi
    tmp_file=$(mktemp)
    cp "$db_file" "$tmp_file"
    awk -F , '{
        current = $2 "," substr($3, 1, 8)
        if (previous != current) {
            print $0
        }
        previous = current
    }' "$tmp_file" > "$db_file"
    rm "$tmp_file"
}

prune_db './db/jito.csv'
prune_db './db/lido.csv'
prune_db './db/marinade.csv'
