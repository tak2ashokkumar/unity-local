# Unity UI Local Development Environment – AI Index

## Overview

This repository contains the local UI development environment for the Unity platform.

Production architecture:
Angular UI → Django Backend → PostgreSQL

Local development replaces the backend with a Node.js mock API server.

---

# Repository Structure

unity-local/
  tools/
    node/              Portable Node runtime
    mock-api/          Mock backend APIs
    proxy/             Angular proxy configuration

  uldb/
    ngx-unity/         Angular 12 Unity UI
    ngx-mtp/           Angular 12 Multi Tenant Portal UI

  dev.sh               Local developer commands
  start-node-env.sh    Initializes portable node environment

---

# Applications

## ngx-unity

Angular 12 application representing the Unity customer portal.

Responsibilities:

- UI components
- Angular services
- UI routing
- dashboards
- service catalog UI

Does NOT contain backend logic.

---

## ngx-mtp

Angular 12 application for multi-tenant portal management.

Similar architecture to ngx-unity.

---

# Mock API System

Mock APIs simulate backend responses.

Location:

tools/mock-api

API path mapping rule:

Request:

/customer/uldbusers/

File:

tools/mock-api/customer/users/uldbusers.json

Folder structure mirrors API endpoints.

---

# Development Workflow

1. Load node environment

source start-node-env.sh

2. Load development commands

source dev.sh

3. Start Unity build watcher

buildunity

4. Start Unity static server

serveunity

5. Start mock API server

cd tools/mock-api
./start-mock.sh

---

# Important Constraints

- Proxy configuration must remain under tools/proxy
- Mock APIs must remain under tools/mock-api
- Angular apps must not contain mock logic
- Portable node runtime is used under tools/node

---

# Key Technologies

Angular 12  
Node.js (portable runtime)  
Express mock server  
Webpack bundle tracker  
Static server for Angular bundles

---

# Important Entry Points

Unity Angular application:

uldb/ngx-unity/src/main.ts

Mock API server:

tools/mock-api/server.js

Static server:

uldb/ngx-unity/static-server.js

---

# Agent Guidance

When modifying code:

Prefer editing:

tools/
scripts
mock APIs

Avoid modifying Angular app architecture unless explicitly required.

Mock API documentation:
tools/mock-api/MOCK_API_INDEX.md