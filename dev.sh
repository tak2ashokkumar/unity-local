#!/bin/bash

UNITY_HOME="/c/Users/AshokKumar/Desktop/unity-local"
export PATH="$UNITY_HOME/tools/python/Scripts:$UNITY_HOME/tools/python:$PATH"

cdd(){
    cd "$UNITY_HOME"
}

uldb(){
   cd "$UNITY_HOME/uldb"
}

unity(){
    cd "$UNITY_HOME/uldb/ngx-unity"
}

mtp(){
    cd "$UNITY_HOME/uldb/ngx-mtp"
}

mockapi(){
    cd "$UNITY_HOME/tools/mock-api" || return
}

proxy(){
    cd "$UNITY_HOME/tools/proxy" || return
}

startmock(){
    mockapi || return
    npm start
}

startproxy(){
    proxy || return
    node server.js
}

buildunity() {
    unity || return
    node --max_old_space_size=8192 ./node_modules/@angular/cli/bin/ng build --watch
}

serveunity() {
    unity || return
    npm run static-server
}

buildmtp() {
    mtp || return
    node --max_old_space_size=8192 ./node_modules/@angular/cli/bin/ng build --watch
}

servemtp() {
    mtp || return
    npm run static-server
}

buildprod() {
    # move to respective folder either ngx-mtp or ngx-unity and run
    node --max_old_space_size=8192 ./node_modules/@angular/cli/bin/ng build --configuration production
}


# --- ADMIN PORTAL (Angular 1.x) ---

admin() {
    cd "$UNITY_HOME/tools/admin-server" || return
}

serveadmin() {
    admin || return
    node server.js
}

# --- ADMIN PORTAL (React - ngx-admin) ---

adminreact() {
    cd "$UNITY_HOME/uldb/ngx-admin" || return
}

# One-time / on-change production build of the React admin (outputs dist/).
buildadmin() {
    adminreact || return
    npm run build
}

# Watch-rebuild the React admin during development.
buildadminwatch() {
    adminreact || return
    npm run build -- --watch
}

# Serve the built React admin on :8096 (mirrors serveunity's static-server).
serveadminreact() {
    adminreact || return
    npm run static-server
}

# Run the proxy with the React admin active at http://localhost:8091/admin.
startproxyreact() {
    proxy || return
    ADMIN_UI=react node server.js
}

# --- Python (3.13.12) ---
pythonlocal(){
    "$UNITY_HOME/tools/python/python.exe" "$@"
}