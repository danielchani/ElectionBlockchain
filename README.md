# Election 2025 – Blockchain-Based Voting Management System

Election 2025 is a desktop voting management application built with Electron, Node.js, Solidity, Web3.js, and Hardhat.

The project demonstrates a blockchain-integrated election workflow with candidate management, voter key generation, hashed voter identities, smart contract-based vote recording, questionnaire-based candidate matching, voting simulation, and real-time result visualization.

This project was developed as an academic and portfolio project focused on secure voting concepts, blockchain integration, cryptographic identity handling, and interactive election administration.

---

## Overview

Election 2025 combines a desktop application interface with a local Ethereum-compatible blockchain environment.

The Electron application provides the user interface for administrators and voters, while the Solidity smart contract manages the core election state on-chain. Web3.js is used as the bridge between the desktop application and the deployed smart contract.

The system supports:

- Election configuration
- Candidate management
- Public key generation for voters
- Hashed voter identification
- Manual voting
- Questionnaire-based candidate matching
- Bulk voting simulation
- Real-time results and chart visualization
- Local blockchain deployment using Hardhat

---

## Key Features

### Election Administration

Administrators can configure and manage the election process through the desktop interface.

Supported actions include:

- Setting the election start and end time
- Adding candidates with ideological positions
- Viewing candidate vote totals
- Running voting simulations
- Resetting the election state
- Displaying election results through charts and structured output

### Solidity Smart Contract Integration

The project includes a Solidity smart contract that manages the blockchain-side election logic.

The smart contract supports:

- Setting the election time window
- Adding candidates
- Registering voter hashes
- Recording votes
- Preventing duplicate voting
- Returning candidate and election information
- Resetting the election state for local testing

The contract is deployed locally using Hardhat and accessed from the Electron application through Web3.js.

### Web3.js Application Layer

The Web3.js integration layer connects the Electron interface to the deployed smart contract.

It handles:

- Connecting to the local Hardhat blockchain
- Loading the contract ABI and deployed contract address
- Sending transactions from a local blockchain account
- Registering voters on-chain
- Submitting votes on-chain
- Reading candidates and results from the contract
- Resetting contract state during testing

### Voter Key Generation

The application generates a public voter key using ECDSA over the `secp256k1` curve.

The generated public key is used as the basis for voter identity. Before being sent to the smart contract, the key is hashed using SHA-256. This avoids storing the raw public key directly as the voter identifier.

### Voting Methods

The system supports two voting flows:

1. **Manual Voting**

   The voter selects a candidate directly from the interface and submits a vote.

2. **Questionnaire-Based Voting**

   The voter answers a short ideological questionnaire. The system compares the answers with candidate positions and automatically selects the most suitable candidate.

The questionnaire includes:

- Political preference
- Economic preference
- Security preference

### Bulk Voting Simulation

The simulation mode allows the application to generate multiple voters and submit a large number of votes automatically.

This feature is useful for:

- Testing the smart contract voting flow
- Demonstrating result changes
- Populating the election with sample data
- Validating chart rendering
- Stress-testing the application logic in a local environment

### Results and Visualization

Election results are displayed through:

- Candidate vote totals
- Structured output logs
- Bar chart visualization using Chart.js
- Real-time UI refresh after voting and simulation actions

---

## Technology Stack

### Desktop Application

- Electron
- Node.js
- JavaScript
- HTML
- Tailwind CSS

### Blockchain Layer

- Solidity
- Hardhat
- Web3.js
- Local Ethereum-compatible blockchain

### Cryptography

- ECDSA key generation using `elliptic`
- `secp256k1` public keys
- SHA-256 hashing using `crypto-js`

### Visualization

- Chart.js

### Development Tools

- npm
- Hardhat local node
- Hardhat contract deployment scripts

---

## Architecture

Election 2025 uses a hybrid desktop-blockchain architecture.

```text
Electron UI
   |
   | User actions
   v
renderer.js
   |
   | Calls Web3 integration functions
   v
blockchain/web3.js
   |
   | Sends transactions and reads contract state
   v
Solidity Smart Contract
   |
   | Deployed locally using Hardhat
   v
Local Ethereum-Compatible Blockchain
```

### Application Flow

1. The administrator starts the local Hardhat blockchain.
2. The Solidity contract is compiled and deployed.
3. The deployment script writes the contract address and ABI into the blockchain configuration file.
4. The Electron application starts.
5. The UI connects to the deployed smart contract using Web3.js.
6. Admin and voter actions are sent as blockchain transactions.
7. Results are read from the contract and displayed in the UI.

---

## Project Structure

```text
Election2025/
├── blockchain/
│   ├── contractConfig.js        # Generated contract address, ABI, and network configuration
│   └── web3.js                  # Web3.js integration layer
│
├── contracts/
│   └── Election.sol             # Solidity smart contract for election logic
│
├── scripts/
│   └── deploy.js                # Hardhat deployment script
│
├── data/
│   ├── candidates.json          # Legacy/local candidate data
│   ├── voters.json              # Legacy/local voter data
│   ├── results.json             # Legacy/local result data
│   └── election_state.json      # Legacy/local election state
│
├── src/
│   └── election.js              # Legacy/local election logic
│
├── index.html                   # Electron UI
├── renderer.js                  # UI behavior and blockchain interaction calls
├── main.js                      # Electron bootstrap file
├── hardhat.config.js            # Hardhat configuration
├── package.json                 # Dependencies and npm scripts
└── README.md                    # Project documentation
```

---

## Installation

### Prerequisites

Make sure you have Node.js and npm installed.

Check your versions:

```bash
node -v
npm -v
```

### Install Dependencies

```bash
npm install
```

---

## Running the Project

The project requires three terminal windows.

### Terminal 1 – Start the Local Blockchain

```bash
npm run node
```

Keep this terminal running.

This starts a local Hardhat blockchain at:

```text
http://127.0.0.1:8545
```

---

### Terminal 2 – Compile and Deploy the Smart Contract

```bash
npm run compile
npm run deploy:local
```

The deployment script deploys the Solidity contract and writes the deployed contract address and ABI into:

```text
blockchain/contractConfig.js
```

---

### Terminal 3 – Start the Electron Application

```bash
npm start
```

The desktop application will open and connect to the deployed smart contract.

---

## Usage Guide

### 1. Start an Election

In the administrator panel:

1. Enter the election start time.
2. Enter the election end time.
3. Use this format:

```text
YYYY-MM-DD HH:MM
```

4. Click **Start**.

The election window is saved on-chain through the Solidity contract.

---

### 2. Add Candidates

In the candidate management section:

1. Enter the candidate name.
2. Enter ideological positions as comma-separated values.
3. Click **Add**.

Example:

```text
right,tax-reduction,security
```

The candidate is added to the smart contract state.

---

### 3. Generate a Voter Key

In the voter panel:

1. Click **Generate**.
2. The application generates an ECDSA public key.
3. The public key is hashed using SHA-256.
4. The voter hash is registered on-chain.

The raw public key is displayed in the UI, while the smart contract works with the hashed voter identifier.

---

### 4. Submit a Manual Vote

To vote manually:

1. Generate a voter key.
2. Select a candidate from the candidate list.
3. Click **Vote**.

The application sends the vote to the smart contract through Web3.js.

The smart contract verifies:

- The election is active
- The voter is registered
- The voter has not already voted
- The selected candidate exists

---

### 5. Vote Using the Ideological Questionnaire

The questionnaire provides a guided voting flow.

The voter answers questions in three categories:

- Political preference
- Economic preference
- Security preference

The application compares the answers with candidate positions and selects the best-matching candidate.

The selected vote is then submitted on-chain.

---

### 6. Run a Voting Simulation

To run a bulk simulation:

1. Enter the number of simulated voters.
2. Click **Run Simulation**.

The application generates voter keys, hashes voter identities, registers voters, and submits votes through the smart contract.

This is intended for testing and demonstration purposes.

---

### 7. Show Results

Click **Show Results** to fetch the latest candidate data from the smart contract.

The UI displays:

- Candidate names
- Vote totals
- Structured result output
- Bar chart visualization

---

### 8. Reset the Election

Click **Reset** to reset the local smart contract election state.

This clears:

- Candidates
- Registered voter hashes
- Vote totals
- Election time window

This feature is intended for local development and repeated demonstrations.

---

## Smart Contract Design

The Solidity contract manages the core election logic.

Main responsibilities:

- Store election start and end time
- Store candidates
- Register voter hashes
- Enforce one vote per voter
- Record candidate vote counts
- Expose election and candidate data to the UI
- Reset state for local testing

### Security-Oriented Contract Rules

The contract includes several basic protections:

- Only the contract owner can configure the election
- Only the contract owner can add candidates
- Only registered voter hashes can vote
- A voter hash cannot vote more than once
- Votes can only be submitted during the configured election window
- Invalid candidate IDs are rejected

---

## Security and Privacy Notes

This project demonstrates several security-oriented concepts:

- Public-key-based voter identity
- SHA-256 hashing of voter identifiers
- Smart contract-controlled vote recording
- Duplicate-vote prevention
- Separation between UI logic and contract logic
- Local blockchain testing before real deployment

However, this project is still a prototype and should not be used for real elections without major additional work.

A production-grade voting system would require:

- Independent smart contract audits
- Strong voter identity verification
- Privacy-preserving vote mechanisms
- Protection against coercion
- Distributed election authority
- Secure deployment infrastructure
- Formal verification or extensive testing
- Legal and operational review

---

## Current Limitations

Election 2025 is a local blockchain prototype.

Current limitations include:

- The blockchain runs locally through Hardhat
- The system is not deployed to a public testnet or mainnet
- MetaMask integration is not fully implemented
- Voter identity verification is simulated
- The project is not externally audited
- The reset function is intended only for local development
- Some legacy JSON-based files may remain from earlier versions of the project

---

## Future Improvements

Planned improvements include:

- MetaMask wallet integration
- Public testnet deployment
- Stronger role-based access control
- Automated smart contract tests
- Improved error handling
- CI workflow for contract compilation and tests
- More advanced voter authentication
- Vote commitment or privacy-preserving voting model
- Better separation between admin and voter permissions
- Packaged desktop builds for Windows

---



## License

This project is licensed under the ISC License.

---

## Author

Daniel Chani
