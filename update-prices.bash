#!/bin/bash

set -x

result_file="./result.tmp"
now="$(date -Iseconds)"

pnpm run start > "$result_file"
epoch=$(grep -oP "^epoch \K[0-9.]*" "$result_file")

if [[ -z $epoch ]]
then
    echo "Epoch not found in the result file!"
    exit 1
fi

function update_db {
    db_file="$1"
    search_exp="$2"

    if [[ -z $db_file ]] || [[ -z $search_exp ]]
    then
        echo "Missing arguments, usage: update_db <db-file> <search-exp>"
        exit 1
    fi

    price=$(grep -oP "^$search_exp \K[0-9.]*" "$result_file")
    if [[ -z $price ]]
    then
        echo "Price not found in the result file!"
        return
    fi

    echo "Found price for $search_exp: $price"

    echo "$now,$epoch,$price" >> "$db_file"
}

update_db './db/jito.csv' Jito
update_db './db/lido.csv' Lido
update_db './db/marinade.csv' Marinade

rm "$result_file"