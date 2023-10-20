#!/bin/bash

DIR="$(cd "$(dirname "$0")" && pwd)"
source $DIR/setenv.sh
npx prisma migrate dev --name init
if [ "$#" -eq  "0" ]
  then
    vitest -c ./vitest.config.integration.ts
else
    vitest -c ./vitest.config.integration.ts --ui
fi
