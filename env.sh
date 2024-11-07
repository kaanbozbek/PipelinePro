#!/bin/sh

# Recreate config file
NGINX_ROOT="/usr/share/nginx/html"
ENV_CONFIG_FILE="${NGINX_ROOT}/config.js"

# Add assignment 
echo "window._env_ = {" > $ENV_CONFIG_FILE

# Read each line in .env file
# Each line represents key=value pairs
for line in $(env); do
  if [[ $line == VITE_* ]]; then
    # Split env variables by character `=`
    key=$(echo $line | cut -d '=' -f1)
    value=$(echo $line | cut -d '=' -f2-)

    # Append configuration property to JS file
    echo "  $key: \"$value\"," >> $ENV_CONFIG_FILE
  fi
done

echo "};" >> $ENV_CONFIG_FILE