# ZKPDF Project - Commands Reference

This document contains all the commands needed to run the ZKPDF project across three terminals.

## Terminal Setup

### Opening WSL from PowerShell

1. Open PowerShell
2. Type: `wsl` or `wsl -d Ubuntu`
3. You should see a prompt like: `akaash@Akaash-XPS:~$`

---

## Terminal 1: Prover Service (Rust)

### Navigate to Project
```bash
cd ~/zk-project/zk/circuits/script
```

### Setup Environment Variables (First Time Only)

Create a `.env` file in the `circuits/script/` directory:

```bash
# Copy the example file
cp .env.example .env

# Or create it manually
nano .env
```

**For Local CPU Mode (default, no credits needed):**
```bash
PORT=3002
RUST_LOG=info
# Don't set SP1_PROVER or NETWORK_PRIVATE_KEY
```

**For Network Mode (faster, requires Succinct credits):**
```bash
PORT=3002
RUST_LOG=info
SP1_PROVER=network
NETWORK_PRIVATE_KEY=0x...your_key_here...
```

**Note**: The prover will automatically fall back to local CPU if network mode fails (e.g., insufficient credits).

### Run Prover Service

**Option 1: Network Mode with Automatic Fallback (Recommended)**
```bash
SP1_PROVER=network NETWORK_PRIVATE_KEY=0x9473aa71275aae7df5b97d3ae7db71edc048c2aadb7259cf858809bba35ca19b PORT=3002 RUST_LOG=info cargo run --release --bin prover
```
This will:
- Try network prover first (fast if you have credits)
- Automatically fall back to local CPU if network fails (insufficient credits, network errors, etc.)

**Option 2: Using .env file**
```bash
cargo run --release --bin prover
```
(Requires .env file to be set up)

**Option 3: Local CPU Only (no network attempts)**
```bash
PORT=3002 RUST_LOG=info cargo run --release --bin prover
```
(Don't set SP1_PROVER or NETWORK_PRIVATE_KEY)

### Expected Output
```
🚀 Prover server listening on 0.0.0.0:3002
   POST /prove - Generate SNARK proof
   POST /verify - Verify SNARK proof
```

**Note**: The prover runs on port **3002** to avoid conflict with Next.js on port 3001.

---

## Terminal 2: Next.js Application

### Navigate to App Directory
```bash
cd ~/zk-project/zk/app
```

### Install Dependencies (First Time Only)
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

### Expected Output
```
▲ Next.js 15.5.4
- Local:        http://localhost:3001
- Network:      http://10.255.255.254:3001
- Ready in [time]
```

**Note**: The app runs on port **3001** by default.

---

## Terminal 3: MongoDB (Docker)

### Check if Docker is Running
```bash
docker ps
```

### Start MongoDB Container
```bash
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -v mongodb_data:/data/db \
  mongo:7
```

### Verify MongoDB is Running
```bash
docker ps | grep mongodb
```

### Stop MongoDB Container
```bash
docker stop mongodb
```

### Start Existing MongoDB Container
```bash
docker start mongodb
```

### Remove MongoDB Container (if needed)
```bash
docker stop mongodb
docker rm mongodb
```

---

## MongoDB Commands (mongosh)

### Access MongoDB Shell

#### Option 1: From Docker Container
```bash
docker exec -it mongodb mongosh
```

#### Option 2: If mongosh is Installed Locally
```bash
mongosh mongodb://localhost:27017
```

### Basic MongoDB Operations

#### Show All Databases
```javascript
show dbs
```

#### Use Your Database
```javascript
use wisk
```

**Note**: Replace `wisk` with your actual database name if different. Check your `.env.local` file in the `app` directory for the database name.

#### Show All Collections
```javascript
show collections
```

Expected collections:
- `academicverifies`
- `nameverifies`
- `panverifies`

#### View All Documents in a Collection
```javascript
// View all academic verifications
db.academicverifies.find().pretty()

// View all name verifications
db.nameverifies.find().pretty()

// View all PAN verifications
db.panverifies.find().pretty()
```

#### View Limited Documents
```javascript
// View first 5 documents
db.academicverifies.find().limit(5).pretty()

// View first 10 documents
db.nameverifies.find().limit(10).pretty()
```

#### Count Documents
```javascript
// Count all documents in a collection
db.academicverifies.countDocuments()
db.nameverifies.countDocuments()
db.panverifies.countDocuments()

// Count with filter
db.academicverifies.countDocuments({ isVerified: true })
```

#### Find Specific Document
```javascript
// Find by ID
db.academicverifies.findOne({ _id: ObjectId("your-id-here") })

// Find by email
db.academicverifies.find({ email: "user@example.com" }).pretty()

// Find by verification status
db.nameverifies.find({ isVerified: false }).pretty()
```

#### Delete All Documents from a Collection
```javascript
// Delete all documents (keeps collection)
db.academicverifies.deleteMany({})
db.nameverifies.deleteMany({})
db.panverifies.deleteMany({})
```

#### Delete Specific Documents
```javascript
// Delete by email
db.academicverifies.deleteMany({ email: "user@example.com" })

// Delete by verification status
db.nameverifies.deleteMany({ isVerified: false })
```

#### Delete Entire Collection
```javascript
// Drop collection (removes collection entirely)
db.academicverifies.drop()
db.nameverifies.drop()
db.panverifies.drop()
```

#### Clear All Collections (Keep Collections)
```javascript
use wisk
db.academicverifies.deleteMany({})
db.nameverifies.deleteMany({})
db.panverifies.drop()
```

#### Verify Collections are Empty
```javascript
db.academicverifies.countDocuments()
db.nameverifies.countDocuments()
db.panverifies.countDocuments()
```

### Exit MongoDB Shell
```javascript
exit
```

---

## Quick Start Sequence

### 1. Start MongoDB (Terminal 3)
```bash
# In PowerShell, type:
wsl

# Then in WSL:
docker start mongodb
# Or if not created:
docker run -d --name mongodb -p 27017:27017 -v mongodb_data:/data/db mongo:7
```

### 2. Start Prover Service (Terminal 1)
```bash
# In PowerShell, type:
wsl

# Then in WSL:
cd ~/zk-project/zk/circuits/script
PORT=3002 RUST_LOG=info cargo run --release --bin prover
```

### 3. Start Next.js App (Terminal 2)
```bash
# In PowerShell, type:
wsl

# Then in WSL:
cd ~/zk-project/zk/app
npm run dev
```

---

## Troubleshooting

### MongoDB Connection Issues

#### Check if MongoDB is Running
```bash
docker ps | grep mongodb
```

#### Check MongoDB Logs
```bash
docker logs mongodb
```

#### Restart MongoDB
```bash
docker restart mongodb
```

### Prover Service Issues

#### Check if Port 3002 is Available
```bash
netstat -tuln | grep 3002
```

#### Rebuild Prover
```bash
cd ~/zk-project/zk/circuits/script
cargo clean
cargo build --release --bin prover
PORT=3002 RUST_LOG=info ./target/release/prover
```

### Next.js App Issues

#### Clear Cache and Reinstall
```bash
cd ~/zk-project/zk/app
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
npm run dev
```

#### Check if Port 3001 is Available
```bash
netstat -tuln | grep 3001
```

---

## Environment Variables

### MongoDB Connection
Check your `.env.local` file in the `app` directory:
```bash
cd ~/zk-project/zk/app
cat .env.local | grep MONGO
```

Expected:
```
MONGO_URL=mongodb://localhost:27017/wisk
```

---

## Service URLs

- **Next.js App**: http://localhost:3001
- **Prover Service**: http://localhost:3002
- **MongoDB**: mongodb://localhost:27017

---

## Useful MongoDB Queries

### Find Unverified Requests
```javascript
db.academicverifies.find({ isVerified: false }).pretty()
```

### Find Requests by Date Range
```javascript
// Find requests created today
db.nameverifies.find({
  createdAt: { $gte: new Date("2025-11-25") }
}).pretty()
```

### Find Requests with SNARK Proofs
```javascript
db.academicverifies.find({ snark: { $exists: true, $ne: null } }).pretty()
```

### Sort by Creation Date
```javascript
// Newest first
db.academicverifies.find().sort({ createdAt: -1 }).pretty()

// Oldest first
db.academicverifies.find().sort({ createdAt: 1 }).pretty()
```

---

## Notes

- Always run MongoDB first, then the prover service, then the Next.js app
- Keep all three terminals open while developing
- Use `Ctrl+C` to stop any service
- MongoDB data persists in Docker volume `mongodb_data`
- Prover service must be running for SNARK proof generation to work

