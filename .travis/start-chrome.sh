#!/bin/bash

#Variables
MAC_CMD="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
UBUNTU_CMD="google-chrome"

# Test OS
if [ -f "$MAC_CMD" ]
then
    CMD="$MAC_CMD"
else
    CMD="$UBUNTU_CMD"
fi

# Execute the command
exec "$CMD" --no-default-browser-check --no-first-run --disable-default-apps "$@"