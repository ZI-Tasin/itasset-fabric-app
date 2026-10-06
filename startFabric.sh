#!/bin/bash
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SAMPLES_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
CC_SRC_LANGUAGE="${1:-javascript}"
CC_SRC_LANGUAGE="$(printf '%s' "$CC_SRC_LANGUAGE" | tr '[:upper:]' '[:lower:]')"

if [ "$CC_SRC_LANGUAGE" != "javascript" ]; then
    echo "This project includes JavaScript chaincode only."
    exit 1
fi

cd "$SAMPLES_DIR/test-network"
./network.sh down
./network.sh up createChannel -ca -s couchdb
./network.sh deployCC -ccn fabcar -ccv 1 -cci initLedger -ccl javascript \
    -ccp "../itasset-fabric-app/chaincode-javascript" \
    -ccep "OR('Org1MSP.peer','Org2MSP.peer')"
