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

# Define a regex pattern to match the "epoch" line
EPOCH_PATTERN="^epoch [0-9]+$"
# Set the flag to start processing lines after the epoch line is found
START_PROCESSING=false

# Read the input file line by line
while IFS= read -r line; do
  if [[ $line =~ $EPOCH_PATTERN ]]; then
    START_PROCESSING=true
    continue
  fi
  
  if $START_PROCESSING; then
    pool=$(echo "$line" | awk '{print $1}')
    price=$(echo "$line" | awk '{$1=""; print $0}' | sed 's/^ *//; s/ *$//')
    
    if [ ! -f "./db/${pool}.csv" ]; then
      echo "timestamp,epoch,price" > "./db/${pool}.csv"
    fi
    echo "$now,$epoch,$price" >> "./db/${pool}.csv"
    
    echo "Updated or created file: ${pool}.csv with content: $price"
  fi
done < "$result_file"

rm "$result_file"
