#!/bin/bash

UNITY_HOME="/c/Users/AshokKumar/Desktop/unity-local"

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

serveunitylocal(){
    echo "Starting Mock API..."
    startmock &

    sleep 2

    echo "Starting Proxy..."
    startproxy &

    sleep 2

    echo "Starting Unity Static Server..."
    serveunity &
}

buildmtp() {
    mtp || return
    node --max_old_space_size=8192 ./node_modules/@angular/cli/bin/ng build --watch
}

servemtp() {
    mtp || return
    npm run static-server
}

servemtplocal(){
    echo "Starting Mock API..."
    startmock &

    sleep 2

    echo "Starting Proxy..."
    startproxy &

    sleep 2

    echo "Starting Unity Static Server..."
    servemtp &
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
    agadmin || return
    node server.js
}