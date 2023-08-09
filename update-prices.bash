#!/bin/bash

set -x

GREP_CMD="grep"
if [[ "$(uname)" == "Darwin" ]]; then
    GREP_CMD="ggrep"
fi

result_file="./result.tmp"
now="$(date -Iseconds)"

pnpm run start > "$result_file"
epoch=$($GREP_CMD -oP "^epoch \K[0-9.]*" "$result_file")

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

    price=$($GREP_CMD -ioP "^$search_exp \K[0-9.]*" "$result_file")
    if [[ -z $price ]]
    then
        echo "Price not found in the result file!"
        return
    fi

    echo "Found price for $search_exp: $price"

    echo "$now,$epoch,$price" >> "$db_file"
}

update_db './db/laine.csv' Laine
update_db './db/cogent.csv' Cogent
#update_db './db/everstake.csv' Everstake
update_db './db/solblaze.csv' SolBlaze
update_db './db/daopool.csv' DAOPool
update_db './db/jpool.csv' JPool
#update_db './db/socean.csv' Socean
update_db './db/jito.csv' Jito
update_db './db/lido.csv' Lido
update_db './db/marinade.csv' Marinade

rm "$result_file"
