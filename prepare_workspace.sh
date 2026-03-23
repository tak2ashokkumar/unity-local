#!/bin/bash

# Exit immediately if any command fails

set -e

PROJECT_ROOT="$(pwd)"

echo "Preparing Unity local workspace..."

# 1. Remove existing ngx-unity & ngx-mtp folders
if [ -d "$PROJECT_ROOT/uldb/ngx-unity" ]; then
    rm -rf "$PROJECT_ROOT/uldb/ngx-unity"
fi

if [ -d "$PROJECT_ROOT/uldb/ngx-mtp" ]; then
    rm -rf "$PROJECT_ROOT/uldb/ngx-mtp"
fi

if [ -f "uldb_static_export.tar.gz" ]; then
    tar -xvzf uldb_static_export.tar.gz && mv static uldb/

    rm -f ../code/uldb_static_export.tar.gz
    mv uldb_static_export.tar.gz ../code/
fi

if [ -f "unity_export.tar.gz" ]; then
    tar -xvzf unity_export.tar.gz && mv ngx-unity uldb/ 

    rm -f ../code/unity_export.tar.gz
    mv unity_export.tar.gz ../code/
fi

if [ -f "mtp_export.tar.gz" ]; then
    tar -xvzf mtp_export.tar.gz && mv ngx-mtp uldb/

    rm -f ../code/mtp_export.tar.gz
    mv mtp_export.tar.gz ../code/
fi

if [ ! -d "$PROJECT_ROOT/uldb/ngx-unity/node_modules" ]; then
   npm install --prefix "$PROJECT_ROOT/uldb/ngx-unity"
fi

if [ ! -d "$PROJECT_ROOT/uldb/ngx-mtp/node_modules" ]; then
   npm install --prefix "$PROJECT_ROOT/uldb/ngx-mtp"
fi

echo "Workspace prepared successfully."
