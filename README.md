# ElectionBlockchain
Election - Encrypted Voting Blockchain based DApp with features for token rewards key generation.
# Election – Decentralized Voting Dashboard

## Overview  
Election 2025 is a cross-platform desktop application built with Electron and Node.js. It simulates a decentralized voting system, providing both administrators and voters with a rich, interactive user interface. All state is persisted locally in JSON files, with support for bulk simulation, real-time countdowns, multi-step ideological questionnaires, and graphical results via Chart.js.

## Key Features

- **Administrator Panel**  
  - Configure election window (start and end timestamps)  
  - Add and remove candidates with custom ideological positions  

- **Voter Experience**  
  - Generate ECDSA public/private key pairs (secp256k1)  
  - Manual voting via candidate dropdown  
  - Three-step ideological questionnaire with automatic candidate matching  

- **Real-Time Elements**  
  - Live countdown timer until election closes  
  - In-page log output for feedback on every action  
  - Tailwind CSS for hover, scale and transition effects  

- **Simulation Mode**  
  - Bulk simulate N voters casting ballots  
  - Auto-create default candidates if none exist  
  - Immediate chart update and log of simulation results  

- **Results & Visualization**  
  - Bar chart of vote counts per candidate (Chart.js)  
  - Tabular and textual summary of results  

- **Reset Functionality**  
  - Clear all in-memory state and JSON data files for a fresh start  

## Prerequisites

- [Node.js](https://nodejs.org/) version 14 or higher  
- npm (bundled with Node.js)

## Installation

1. Clone the repository:  
   ```bash
   git clone https://github.com/your-username/election2025.git
   cd election2025
