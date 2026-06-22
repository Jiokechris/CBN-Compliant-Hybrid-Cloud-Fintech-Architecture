# 🇳🇬 CBN-Compliant Hybrid Cloud Fintech Architecture (Version 2.0.0)

A production-grade, highly resilient hybrid cloud data pipeline engineered to enforce absolute national data residency compliance. This architecture isolates core financial transaction ledgers from foreign cloud nodes, strictly satisfying the Central Bank of Nigeria (CBN) guidelines and the Nigeria Data Protection Regulation (NDPR).

## 📊 Infrastructure Evolution: V1.0 vs V2.0

* **Version 1.0 (Proof of Concept):** Utilized public reverse-proxy tunneling (Pinggy) to pipe basic webhooks to a local machine. This served as a validation model but introduced third-party routing dependencies, public internet exposure, and lack of protocol-level encryption control.
* **Version 2.0 (Production Hardening):** Eliminated all third-party reverse proxies. Established a direct, kernel-level, point-to-point **WireGuard VPN Tunnel** using private IP routing blocks (`10.0.0.0/24`). Introduced an isolated **Mobile App Client Simulation** on the cloud edge and a real-time **Admin Control Tower Dashboard** with a sub-2-second monitoring loop.

## 🏗️ Architectural Topology

The system completely decouples the public application plane from the sovereign data residency vault, routing sensitive financial payloads inside an isolated private network plane.




────────────────────────────────────────────────────────────────────────┐
 │                      AWS EC2 PUBLIC EDGE SUBNET                        │
 │                                                                        │
 │  ┌─────────────────────────┐               ┌────────────────────────┐  │
 │  │   Mobile Client UI      │ ──[HTTP POST]─> │   Core Express Engine  │  │
 │  │   (Simulated App Layer) │               │   (Port 3000 Routing)  │  │
 │  └─────────────────────────┘               └────────────────────────┘  │
 └─────────────────────────────────────────────────┬──────────────────────┘
                                                   │
                                      [ SECURE TRANSIT PLANE ]
                                   WireGuard Tunnel Interface (wg0)
                                      Encrypted Private Subnet 
                                           10.0.0.1 ──> 10.0.0.2
                                                   │
                                                   ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │                    ON-PREMISE SOVEREIGN RESIDENCY VAULT                │
 │                                                                        │
 │  ┌─────────────────────────┐               ┌────────────────────────┐  │
 │  │  Admin Control Tower    │               │  Docker Core Container │  │
 │  │  (Real-Time Dashboard)  │ <──[2s Loop]── │  PostgreSQL Ledger     │  │
 │  └─────────────────────────┘               └────────────────────────┘  │
 └────────────────────────────────────────────────────────────────────────┘



## 🛠️ Core Engineering Implementations in V2.0

### 1. Enterprise VPN Migration (Pinggy ──> WireGuard)
* **The Upgrade:** Replaced public-facing third-party HTTP tunnels with a custom-configured WireGuard peer-to-peer network interface. 
* **The Security Impact:** All financial records skip public routing tables entirely. Payload transit is locked down using modern cryptography (ChaCha20 and Poly1305), directly binding the AWS EC2 instance (`10.0.0.1`) to the local infrastructure core (`10.0.0.2`).

### 2. Full-Stack Ecosystem Expansion (Mobile Client & Admin Tower)
* **The Upgrade:** Developed a dual-interface testing array on the cloud edge:
  * **Client Side:** A mobile transaction generator simulating live user card/account fund transfers.
  * **Admin Side:** A low-latency telemetry board querying aggregate metrics (`COUNT`, `SUM`) and displaying the last 10 local cryptographic ledger records sequentially.

### 3. Asynchronous Query Parallelism (Sub-2-Second Heartbeat)
* **The Problem:** Sequential blocking queries over the network bridge caused cumulative latency overhead, causing dashboard data drift.
* **The Optimization:** Implemented parallelized connection-pooled queries using JavaScript `Promise.all()`. This dropped the network processing window down to an optimized ~1.8-second automated refresh loop.

### 4. Database Schema Hardening & OS Socket Pruning
* **The Upgrade:** Aligned frontend data-binding structures to map strictly with unique relational constraints (`tx_ref`, `processed_at`) inside the local PostgreSQL container. Additionally, automated script-level port reclamation (`lsof -t -i:3000`) was introduced to cleanly flush zombie network sockets during hot-reloads on AWS.


# CBN-Compliant Hybrid Cloud Fintech Architecture (V 1.0)

This repository contains a production-grade prototype demonstrating how financial technology companies can comply with the Central Bank of Nigeria's (CBN) data residency directives. 

The architecture separates the public-facing application processing layer (hosted globally) from the transactional data enclave layer, ensuring all sensitive transaction records are stored strictly within local Nigerian infrastructure borders.

---

##  Architectural Overview

This project implements a **Hybrid Cloud Topology** split across two primary environments:

1. **The Global Processing Layer (AWS Cloud):** A public-facing Node.js Express API deployed on an AWS EC2 instance. This layer handles incoming traffic, route parsing, and API authentication.
2. **The Domestic Storage Layer (Lagos Data Center):** An isolated PostgreSQL database running inside a Docker container natively on local infrastructure in Lagos.

Data isolation is guaranteed because the cloud application possesses zero local storage permissions; transaction payloads are instantly routed across an encrypted SSH reverse tunnel directly to the local database disk.

---

##  Step-by-Step Technical Implementation Blueprint

### Phase 1: Deploying the Cloud Server (AWS EC2)
1. **Provisioning:** Launched an Ubuntu Server LTS instance using the `t2.micro` free-tier configuration.
2. **Security Credentials:** Generated a cryptographic Key Pair (`.pem`) to enforce secure SSH key-based authentication, completely disabling traditional insecure password logins.
3. **Firewall Architecture:** Configured an AWS Security Group with the following inbound rules:
   * **Port 22 (SSH):** Restricted for administrative terminal access.
   * **Port 3000 (Custom TCP):** Unlocked globally (`0.0.0.0/0`) to accept financial transaction web payloads.

---

### Phase 2: Isolating the Domestic Database (Docker)
To avoid system overhead and ensure portable environment isolation, the local database engine runs inside a Docker container.

1. Prepared a dedicated project directory:
   ```bash
   mkdir ~/lagos-vault && cd ~/lagos-vault

## 1. Created an Infrastructure-as-Code deployment recipe file (docker-compose.yml):

   version: '3.8'
services:
  cbn_compliant_db:
    image: postgres:15-alpine
    container_name: local_tx_vault
    restart: always
    environment:
      POSTGRES_USER: ledger_admin
      POSTGRES_PASSWORD: HardenedPassword101!
      POSTGRES_DB: domestic_transactions
    ports:
      - "5432:5432"

## 2. Initialized and daemonized the container execution layer:

docker compose up -d

Phase 3: Building the Cross-Continental Interconnection Network
Because local servers sit behind dynamic home/private Wi-Fi routers, an overseas AWS cloud instance cannot natively see local infrastructure. We bypass expensive hardware leases by spinning up a secure reverse network tunnel.

## 1. Generated a local cryptographic host signature identity:

ssh-keygen -t rsa -b 4000

## 2. Initiated an encrypted reverse SSH bridge mapping the local database interface out to a public proxy broker:

ssh -p 443 -R0:localhost:5432 tcp@free.pinggy.io

## 3. Extracted live tunnel routing endpoints generated by the proxy engine

Host: alwew-102-88-108-114.run.pinggy-free.link.
Port: 35387.

Phase 4: Setting Up the Backend Engine on AWS

## 1. Accessed the cloud instance securely via terminal:

ssh -i fintech-key.pem" ubuntu@16.171.181.60

## 2. Standardized the empty OS environment and installed runtime engines

sudo apt update && sudo apt install -y nodejs npm

## 3. Scaffolding the codebase layout

mkdir fintech-api && cd fintech-api
npm init -y
npm install express pg

## 4. Implemented the core compliance application logic (index.js). The code hooks directly into the reverse tunnel connection pool, bypassing AWS persistent storage

See index.js as committed file

## 5. Executed the application thread pool

node index.js

## Verification and End-to-End Audit

To prove compliance, a transactional post request is fired directly to the global AWS gateway

curl -X POST http://16.171.181.60:3000/api/v1/payment \
-H "Content-Type: application/json" \
-d '{"userId": "user_lagos_01", "amount": 85000, "currency": "NGN", "reference": "TXN-CBN-COMPLIANT-2026"}'

## Response Received

{
  "success": true,
  "cbn_status": "Compliant - Domiciled in Nigeria",
  "data": {
    "id": 1,
    "user_id": "user_lagos_01",
    "amount": "85000",
    "currency": "NGN",
    "tx_ref": "TXN-CBN-COMPLIANT-2026",
    "processed_at": "2026-06-21T20:01:31.999Z"
  }
}

Database Ledger Validation (Executed locally on the Lagos terminal

docker exec -it local_tx_vault psql -U ledger_admin -d domestic_transactions -c "SELECT * FROM tx_ledger;"

## Real-World Challenges Overcome

1. System Resource Constrains: Attempting to run a full enterprise emulator (local VM, database instances, and API servers) on a single personal laptop caused severe system lag. Resolution: Optimized the layout by offloading the API runtime layer to the AWS Cloud and containerizing the database via Docker, reducing local RAM usage significantly.


2. Inbound Connectivity Blocks: Local ISP home Wi-Fi routers do not provide static public IP addresses and sit behind aggressive internal firewalls, preventing AWS from communicating with the database. Resolution: Leveraged a secure, transient reverse SSH handshake tunnel to provide a public mapping point without paying for complex corporate static networking.


3. Authentication Lockouts: Handshaking with automated proxies initially required a password block due to a missing local host profile. Resolution: Generated dedicated 4000-bit RSA cryptographic identity signatures on the host machine to bypass interactive login prompts.


  ## Future Roadmap & Next Improvements
Production Network Hardening: Replace temporary development reverse tunnels with a production-grade, open-source mesh network client like WireGuard or a dedicated site-to-site hardware VPN.


Secrets Management Security: Migrate plaintext database credentials out of the application source code (index.js) and inject them dynamically at runtime using AWS Secrets Manager or system environmental variables (process.env).


Connection Resilience & Failure Backups: Implement a queuing layer using RabbitMQ or an offline database buffer on AWS. If local network stability fluctuates in Lagos, transactions will log to a secure temporary cloud queue and sync automatically once internet connectivity restores, ensuring zero dropped payments.



## Authors & Collaborators
Lead cloud engineer: Chijioke C Odoh 
 Developed the hybrid network strategy, local container stack, and handled complete deployment execution.


Co-Author & AI Infrastructure Consultant: Gemini (Google AI) — Assisted with system architecture refinement, debugging deployment configurations, and compliance optimization.
