#!/bin/bash

set -x

for db_file in db/*; do
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
done
