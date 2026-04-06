#!/bin/bash

# Exit immediately if any command fails

set -e

PROJECT_ROOT="$(pwd)"
UNITY_WEBPACK_DEV="$PROJECT_ROOT/uldb/ngx-unity/extra-webpack-dev.config.js"
MTP_WEBPACK_DEV="$PROJECT_ROOT/uldb/ngx-mtp/extra-webpack-dev.config.js"

echo "Preparing Unity local workspace..."

if [ -f "uldb_static_export.tar.gz" ]; then
    if [ -d "$PROJECT_ROOT/uldb/static" ]; then
    	rm -rf "$PROJECT_ROOT/uldb/static"
	fi
    tar -xvzf uldb_static_export.tar.gz && mv static uldb/
    rm -f ../code/uldb_static_export.tar.gz
    mv uldb_static_export.tar.gz ../code/
fi

if [ -f "unity_export.tar.gz" ]; then
	if [ -d "$PROJECT_ROOT/uldb/ngx-unity" ]; then
    	rm -rf "$PROJECT_ROOT/uldb/ngx-unity"
	fi
    tar -xvzf unity_export.tar.gz && mv ngx-unity uldb/ 

    rm -f ../code/unity_export.tar.gz
    mv unity_export.tar.gz ../code/
fi

if [ -f "mtp_export.tar.gz" ]; then
	if [ -d "$PROJECT_ROOT/uldb/ngx-mtp" ]; then
    	rm -rf "$PROJECT_ROOT/uldb/ngx-mtp"
	fi
    tar -xvzf mtp_export.tar.gz && mv ngx-mtp uldb/

    rm -f ../code/mtp_export.tar.gz
    mv mtp_export.tar.gz ../code/
fi

if [ ! -d "$PROJECT_ROOT/uldb/ngx-unity/node_modules" ]; then
	cd "$PROJECT_ROOT/uldb/ngx-unity"
   	npm install
fi

if [ ! -d "$PROJECT_ROOT/uldb/ngx-mtp/node_modules" ]; then
	cd "$PROJECT_ROOT/uldb/ngx-mtp"
   	npm install
fi

echo "Patching UNITY webpack publicPath..."
if [ -f "$UNITY_WEBPACK_DEV" ]; then
  # Replace publicPath → local proxy
  sed -i 's|publicPath.*|publicPath: "/",|g' "$UNITY_WEBPACK_DEV"
else
  echo "❌ webpack config not found"
fi

echo "Patching MTP webpack publicPath..."
if [ -f "$MTP_WEBPACK_DEV" ]; then
  # Replace publicPath → local proxy
  sed -i 's|publicPath.*|publicPath: "/",|g' "$MTP_WEBPACK_DEV"
else
  echo "❌ webpack config not found"
fi

echo "Workspace prepared successfully."
