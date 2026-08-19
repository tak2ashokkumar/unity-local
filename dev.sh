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

# =====================================================================
#  HOW TO RUN
# ---------------------------------------------------------------------
#  Running an app = (1) its build/serve, plus (2) ONE proxy for the target
#  environment. A single proxy process serves all three front ends at once:
#
#      http://localhost:8091          -> ngx-unity
#      http://localhost:8091/admin    -> admin panel
#      http://localhost:8061          -> ngx-mtp
#
#  So start only ONE proxy at a time and pick it from the environment
#  groups below. Within a group the three commands are equivalent - they are
#  named per app just so the intent is obvious.
#
#  /admin serves the React admin (ngx-admin) by default; use the matching
#  *-admin-legacy command when you want the old AngularJS panel instead.
# =====================================================================


# =====================================================================
#  APP SERVERS  (same for every environment)
# =====================================================================

# ---- ngx-unity ----
buildunity() {
    unity || return
    node --max_old_space_size=8192 ./node_modules/@angular/cli/bin/ng build --watch
}

serveunity() {
    unity || return
    npm run static-server
}

# ---- ngx-mtp ----
buildmtp() {
    mtp || return
    node --max_old_space_size=8192 ./node_modules/@angular/cli/bin/ng build --watch
}

servemtp() {
    mtp || return
    npm run static-server
}

# ---- admin panel : legacy AngularJS (served from uldb/static) ----
admin() {
    cd "$UNITY_HOME/tools/admin-server" || return
}

serveadmin() {
    admin || return
    node server.js
}

# ---- admin panel : React (uldb/ngx-admin) ----
adminreact() {
    cd "$UNITY_HOME/uldb/ngx-admin" || return
}

buildadmin() {          # one-off production build -> dist/
    adminreact || return
    npm run build
}

buildadminwatch() {     # rebuild on every change
    adminreact || return
    npm run build -- --watch
}

serveadminreact() {     # serve dist/ on :8096
    adminreact || return
    npm run static-server
}

# ---- production build (run from inside ngx-unity or ngx-mtp) ----
buildprod() {
    node --max_old_space_size=8192 ./node_modules/@angular/cli/bin/ng build --configuration production
}


# =====================================================================
#  MOCK   ->  local mock API on :3001   (default, safe, offline)
# ---------------------------------------------------------------------
#  Writes only get echoed back, nothing is persisted.
#  Needs the mock API running:  startmock
# =====================================================================

# to run the admin panel (React) against MOCK
mock-admin() {
    proxy || return
    API_ENV=mock ADMIN_UI=react node server.js
}

# to run the admin panel (legacy AngularJS) against MOCK
mock-admin-legacy() {
    proxy || return
    API_ENV=mock node server.js
}

# to run ngx-unity against MOCK          (browse http://localhost:8091)
mock-unity() {
    proxy || return
    API_ENV=mock ADMIN_UI=react node server.js
}

# to run ngx-mtp against MOCK            (browse http://localhost:8061)
mock-mtp() {
    proxy || return
    API_ENV=mock ADMIN_UI=react node server.js
}


# =====================================================================
#  PROD   ->  https://unity.unitedlayer.com
# ---------------------------------------------------------------------
#  LIVE data. Reads AND writes hit the real system.
#  Session required:  tools/proxy/.cookie-prod
#  See the write-safety rule in CLAUDE.md before changing anything.
# =====================================================================

# to run the admin panel (React) against PROD
prod-admin() {
    proxy || return
    API_ENV=prod ADMIN_UI=react node server.js
}

# to run the admin panel (legacy AngularJS) against PROD
prod-admin-legacy() {
    proxy || return
    API_ENV=prod node server.js
}

# to run ngx-unity against PROD          (browse http://localhost:8091)
prod-unity() {
    proxy || return
    API_ENV=prod ADMIN_UI=react node server.js
}

# to run ngx-mtp against PROD            (browse http://localhost:8061)
prod-mtp() {
    proxy || return
    API_ENV=prod ADMIN_UI=react node server.js
}


# =====================================================================
#  AMS    ->  http://unity-ams.unitedlayer.com
#  Session required:  tools/proxy/.cookie-ams
# =====================================================================

ams-admin() {           # admin panel (React) against AMS
    proxy || return
    API_ENV=ams ADMIN_UI=react node server.js
}

ams-unity() {           # ngx-unity against AMS
    proxy || return
    API_ENV=ams ADMIN_UI=react node server.js
}

ams-mtp() {             # ngx-mtp against AMS
    proxy || return
    API_ENV=ams ADMIN_UI=react node server.js
}

ams-admin-legacy() {  # admin panel (legacy AngularJS) against AMS
    proxy || return
    API_ENV=ams node server.js
}


# =====================================================================
#  PLAY   ->  https://play.unityone.ai
#  Session required:  tools/proxy/.cookie-play
# =====================================================================

play-admin() {          # admin panel (React) against PLAY
    proxy || return
    API_ENV=play ADMIN_UI=react node server.js
}

play-unity() {          # ngx-unity against PLAY
    proxy || return
    API_ENV=play ADMIN_UI=react node server.js
}

play-mtp() {            # ngx-mtp against PLAY
    proxy || return
    API_ENV=play ADMIN_UI=react node server.js
}

play-admin-legacy() {  # admin panel (legacy AngularJS) against PLAY
    proxy || return
    API_ENV=play node server.js
}


# =====================================================================
#  ALPHA  ->  https://alpha.unityone.ai
#  Session required:  tools/proxy/.cookie-alpha
# =====================================================================

alpha-admin() {         # admin panel (React) against ALPHA
    proxy || return
    API_ENV=alpha ADMIN_UI=react node server.js
}

alpha-unity() {         # ngx-unity against ALPHA
    proxy || return
    API_ENV=alpha ADMIN_UI=react node server.js
}

alpha-mtp() {           # ngx-mtp against ALPHA
    proxy || return
    API_ENV=alpha ADMIN_UI=react node server.js
}

alpha-admin-legacy() {  # admin panel (legacy AngularJS) against ALPHA
    proxy || return
    API_ENV=alpha node server.js
}


# =====================================================================
#  LEGACY ALIASES (kept so existing muscle memory still works)
# =====================================================================
startproxy()          { mock-unity; }          # mock, legacy admin
startproxyreact()     { mock-admin; }          # mock, React admin
startproxyprod()      { prod-unity; }          # prod, legacy admin
startproxyreactprod() { prod-admin; }          # prod, React admin


# --- Python (3.13.12) ---
pythonlocal(){
    "$UNITY_HOME/tools/python/python.exe" "$@"
}