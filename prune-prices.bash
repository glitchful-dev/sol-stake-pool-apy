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
        current_epoch = $2
        if (current_epoch != previous_epoch && NR > 1) {
            print first_date "," previous_epoch "," last_value
        }
        if (current_epoch != previous_epoch) {
            first_date = $1
        }
        last_value = $3
        previous_epoch = current_epoch
    } END {
        print first_date "," previous_epoch "," last_value
    }' "$tmp_file" > "$db_file"
    rm "$tmp_file"
done
