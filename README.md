# Election 2025 – Decentralized Voting Management System

Election 2025 is a desktop-based voting management application built with Electron and Node.js.  
The project simulates a decentralized election workflow with voter key generation, encrypted voter identification, candidate management, ideological candidate matching, vote simulation, and visual result analysis.

The system was designed as an academic software engineering project focused on secure voting concepts, transparent election management, and an extensible architecture that can later be connected to blockchain smart contracts.

---

## Overview

Election 2025 provides two main workflows:

1. **Administrator Workflow**
   - Configure an election time window
   - Add and manage candidates
   - Monitor election activity
   - Run voting simulations
   - View election results and statistics

2. **Voter Workflow**
   - Generate a public voting key
   - Submit a vote manually
   - Complete an ideological questionnaire
   - Receive automatic candidate matching based on political, economic, and security preferences

The application stores election state locally using JSON files and uses cryptographic hashing to protect voter identifiers.

---

## Main Features

### Election Administration

- Configure election start and end times
- Add candidates with ideological positions
- Track election state during runtime
- Reset the system state when needed
- Manage election data through a graphical interface

### Voter Key Generation

- Generates a public key using ECDSA over the `secp256k1` curve
- Uses the generated key as the voter’s unique voting identity
- Hashes the public key before storing voter-related data

### Voting Methods

The system supports two voting flows:

- **Manual voting** – the voter selects a candidate directly
- **Questionnaire-based voting** – the system recommends a candidate based on voter answers

The questionnaire is divided into several ideological categories:

- Political views
- Economic views
- Security views

Based on the voter’s answers, the system compares preferences against candidate positions and selects the most suitable candidate.

### Real-Time Election Elements

- Live countdown timer until the election closes
- Immediate UI updates after voting actions
- Toast-style activity log for user and administrator actions
- Interactive UI transitions using Tailwind CSS

### Bulk Voting Simulation

The simulation mode allows testing the system with a large number of generated votes.

It can be used to:

- Stress-test election logic
- Demonstrate result changes over time
- Quickly populate the system with sample voting data
- Validate candidate result calculations

If default candidates are missing, the simulation can populate the system with predefined candidates for demonstration purposes.

### Results and Data Visualization

Election results are displayed using both textual summaries and visual charts.

The results section includes:

- Candidate vote totals
- Tabular result summaries
- Bar chart visualization using Chart.js
- Real-time result refresh after new votes or simulations

### System Reset

The application includes a reset option that clears the current election state from memory and local JSON storage.

This allows the system to return to a clean initial state for testing, demonstrations, or new election scenarios.

---

## Technology Stack

### Core Technologies

- Electron
- Node.js
- JavaScript
- HTML
- Tailwind CSS

### Data and State

- Local JSON-based persistence
- File-based election state management

### Security and Cryptography

- `crypto-js` for SHA-256 hashing
- `elliptic` for ECDSA key generation using `secp256k1`
- Hashed voter identifiers to avoid storing raw public keys directly as voter records

### Visualization

- Chart.js for election result graphs

---

## Project Structure

```text
Election2025/
├── data/
│   ├── candidates.json
│   ├── voters.json
│   ├── results.json
│   └── election_state.json
│
├── src/
│   └── election.js
│
├── index.html
├── renderer.js
├── main.js
├── package.json
└── README.md
