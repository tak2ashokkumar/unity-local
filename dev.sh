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

devadmin() {            # vite dev server + HMR on :8098 (needs startmock)
    adminreact || return
    npm run dev -- --port 8098 --strictPort
}

# ---- production build (run from inside ngx-unity or ngx-mtp) ----
buildprod() {
    node --max_old_space_size=8192 ./node_modules/@angular/cli/bin/ng build --configuration production
}


# =====================================================================
#  MOCK   ->  local mock API on :3001   (default, safe, offline)
# ---------------------------------------------------------------------
#  Writes are only echoed back, nothing is persisted. No login needed.
#
#  WHAT TO RUN  (one command per terminal, in this order):
#
#    MOCK + ADMIN (React)      MOCK + UNITY              MOCK + MTP
#    --------------------      ------------              ----------
#    1. startmock              1. startmock              1. startmock
#    2. buildadminwatch        2. buildunity             2. buildmtp
#    3. serveadminreact        3. serveunity             3. servemtp
#    4. mock-admin             4. mock-unity             4. mock-mtp
#
#    then open:                then open:                then open:
#    localhost:8091/admin      localhost:8091            localhost:8061
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
#  SF     ->  https://unity.unitedlayer.com
# ---------------------------------------------------------------------
#  LIVE data. Reads AND writes hit the real system.
#  Requires a session in tools/proxy/.cookie-sf
#  (sign in to the site, then copy sessionid + csrftoken into that file).
#  See the write-safety rule in CLAUDE.md before changing anything.
#
#  WHAT TO RUN  (one command per terminal, in this order):
#
#    SF + ADMIN (React)        SF + UNITY                SF + MTP
#    ------------------        ----------                --------
#    1. buildadminwatch        1. buildunity             1. buildmtp
#    2. serveadminreact        2. serveunity             2. servemtp
#    3. sf-admin               3. sf-unity               3. sf-mtp
#
#    then open:                then open:                then open:
#    localhost:8091/admin      localhost:8091            localhost:8061
#
#    (no startmock - the data comes from SF)
# =====================================================================

# to run the admin panel (React) against SF
sf-admin() {
    proxy || return
    API_ENV=sf ADMIN_UI=react node server.js
}

# to run the admin panel (legacy AngularJS) against SF
sf-admin-legacy() {
    proxy || return
    API_ENV=sf node server.js
}

# to run ngx-unity against SF            (browse http://localhost:8091)
sf-unity() {
    proxy || return
    API_ENV=sf ADMIN_UI=react node server.js
}

# to run ngx-mtp against SF              (browse http://localhost:8061)
sf-mtp() {
    proxy || return
    API_ENV=sf ADMIN_UI=react node server.js
}


# =====================================================================
#  AMS    ->  http://unity-ams.unitedlayer.com
# ---------------------------------------------------------------------
#  LIVE data. Reads AND writes hit the real system.
#  Requires a session in tools/proxy/.cookie-ams
#  (sign in to the site, then copy sessionid + csrftoken into that file).
#  See the write-safety rule in CLAUDE.md before changing anything.
#
#  WHAT TO RUN  (one command per terminal, in this order):
#
#    AMS + ADMIN (React)       AMS + UNITY               AMS + MTP
#    -------------------       -----------               ---------
#    1. buildadminwatch        1. buildunity             1. buildmtp
#    2. serveadminreact        2. serveunity             2. servemtp
#    3. ams-admin              3. ams-unity              3. ams-mtp
#
#    then open:                then open:                then open:
#    localhost:8091/admin      localhost:8091            localhost:8061
#
#    (no startmock - the data comes from AMS)
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
# ---------------------------------------------------------------------
#  LIVE data. Reads AND writes hit the real system.
#  Requires a session in tools/proxy/.cookie-play
#  (sign in to the site, then copy sessionid + csrftoken into that file).
#  See the write-safety rule in CLAUDE.md before changing anything.
#
#  WHAT TO RUN  (one command per terminal, in this order):
#
#    PLAY + ADMIN (React)      PLAY + UNITY              PLAY + MTP
#    --------------------      ------------              ----------
#    1. buildadminwatch        1. buildunity             1. buildmtp
#    2. serveadminreact        2. serveunity             2. servemtp
#    3. play-admin             3. play-unity             3. play-mtp
#
#    then open:                then open:                then open:
#    localhost:8091/admin      localhost:8091            localhost:8061
#
#    (no startmock - the data comes from PLAY)
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
# ---------------------------------------------------------------------
#  LIVE data. Reads AND writes hit the real system.
#  Requires a session in tools/proxy/.cookie-alpha
#  (sign in to the site, then copy sessionid + csrftoken into that file).
#  See the write-safety rule in CLAUDE.md before changing anything.
#
#  WHAT TO RUN  (one command per terminal, in this order):
#
#    ALPHA + ADMIN (React)     ALPHA + UNITY             ALPHA + MTP
#    ---------------------     -------------             -----------
#    1. buildadminwatch        1. buildunity             1. buildmtp
#    2. serveadminreact        2. serveunity             2. servemtp
#    3. alpha-admin            3. alpha-unity            3. alpha-mtp
#
#    then open:                then open:                then open:
#    localhost:8091/admin      localhost:8091            localhost:8061
#
#    (no startmock - the data comes from ALPHA)
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
startproxyprod()      { sf-unity; }            # sf, React admin
startproxyreactprod() { sf-admin; }            # sf, React admin


# --- Python (3.13.12) ---
pythonlocal(){
    "$UNITY_HOME/tools/python/python.exe" "$@"
}