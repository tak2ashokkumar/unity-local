# Unity UI Architecture

## Applications

### ngx-unity
Single tenant portal UI built using Angular 12.

### ngx-mtp
Multi tenant portal UI built using Angular 12.

## Backend

Production backend is Django + PostgreSQL.

Local development replaces backend with mock API server.

## Mock API Server

Node.js Express server.

Maps request paths to JSON files.

Example mapping:

/customer/uldbusers
→ tools/mock-api/customer/uldbusers.json

/customer/users/user_list
→ tools/mock-api/customer/users/user_list.json