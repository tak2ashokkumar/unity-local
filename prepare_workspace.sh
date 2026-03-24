#!/bin/bash

# Exit immediately if any command fails

set -e

PROJECT_ROOT="$(pwd)"

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

echo "Workspace prepared successfully."
