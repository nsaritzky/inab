#!/bin/bash
# scripts/setenv.sh

# Export env vars
export $(grep -v '^#' .env.test | xargs)
