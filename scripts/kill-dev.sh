#!/bin/sh

# netlify-cli isn't always great about cleaning up processes,
# which slows down the local dev server. 
# This utility script just makes sure we have a clean slate by
# killing anything lingering around.
pkill -f eleventy || true
pkill -f netlify-cli || true
echo "Killed eleventy and netlify-cli processes."
