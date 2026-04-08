#!/bin/bash

# Exit immediately if any command fails
set -e

PROJECT_ROOT="$(pwd)"

echo "----------------------------------------------------"
echo "🚀 Preparing Unity local workspace..."
echo "📍 Project Root: $PROJECT_ROOT"
echo "----------------------------------------------------"

# Create code backup directory if it doesn't exist
mkdir -p "$PROJECT_ROOT/../code"

if [ -f "uldb_static_export.tar.gz" ]; then
    echo "📦 Extracting uldb_static_export.tar.gz directly to uldb/..."
    if [ -d "$PROJECT_ROOT/uldb/static" ]; then
    	rm -rf "$PROJECT_ROOT/uldb/static"
	  fi
    tar -C "$PROJECT_ROOT/uldb" -xvzf uldb_static_export.tar.gz
    
    echo "🚚 Moving uldb_static_export.tar.gz to backup..."
    rm -f ../code/uldb_static_export.tar.gz
    mv uldb_static_export.tar.gz ../code/
fi

if [ -f "unity_export.tar.gz" ]; then
    echo "📦 Extracting unity_export.tar.gz directly to uldb/..."
	  if [ -d "$PROJECT_ROOT/uldb/ngx-unity" ]; then
    	rm -rf "$PROJECT_ROOT/uldb/ngx-unity"
	  fi
    tar -C "$PROJECT_ROOT/uldb" -xvzf unity_export.tar.gz

    echo "🚚 Moving unity_export.tar.gz to backup..."
    rm -f ../code/unity_export.tar.gz
    mv unity_export.tar.gz ../code/
fi

if [ -f "mtp_export.tar.gz" ]; then
    echo "📦 Extracting mtp_export.tar.gz directly to uldb/..."
	  if [ -d "$PROJECT_ROOT/uldb/ngx-mtp" ]; then
    	rm -rf "$PROJECT_ROOT/uldb/ngx-mtp"
	  fi
    tar -C "$PROJECT_ROOT/uldb" -xvzf mtp_export.tar.gz

    echo "🚚 Moving mtp_export.tar.gz to backup..."
    rm -f ../code/mtp_export.tar.gz
    mv mtp_export.tar.gz ../code/
fi

if [ -d "$PROJECT_ROOT/uldb/ngx-unity" ] && [ ! -d "$PROJECT_ROOT/uldb/ngx-unity/node_modules" ]; then
    echo "🔧 Installing npm dependencies for ngx-unity..."
	  cd "$PROJECT_ROOT/uldb/ngx-unity"
   	npm install
    cd "$PROJECT_ROOT"
fi

if [ -d "$PROJECT_ROOT/uldb/ngx-mtp" ] && [ ! -d "$PROJECT_ROOT/uldb/ngx-mtp/node_modules" ]; then
    echo "🔧 Installing npm dependencies for ngx-mtp..."
	  cd "$PROJECT_ROOT/uldb/ngx-mtp"
   	npm install
    cd "$PROJECT_ROOT"
fi

echo "----------------------------------------------------"
echo "✅ Workspace prepared successfully."
echo "----------------------------------------------------"
echo "Press any key to exit..."
read -n 1 -s
