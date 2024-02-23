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
    }' "$tmp_file" | awk -F , '{
        current_epoch = $2
        if (current_epoch != previous_epoch && previous_record) {
            print previous_record
        }
        previous_epoch = current_epoch
        previous_record = $0
    } END {
      print previous_record
    }' > "$db_file"
    rm "$tmp_file"
}

prune_db './db/laine.csv'
prune_db './db/cogent.csv'
prune_db './db/everstake.csv'
prune_db './db/solblaze.csv'
prune_db './db/daopool.csv'
prune_db './db/jpool.csv'
prune_db './db/socean.csv'
prune_db './db/jito.csv'
prune_db './db/lst.csv'
prune_db './db/edgevana.csv'
prune_db './db/lido.csv'
prune_db './db/marinade.csv'
