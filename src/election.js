const fs = require('fs');
const crypto = require('crypto');
const SHA256 = require('crypto-js/sha256');

class Election {
  constructor() {
    this.statePath = './data/election_state.json';
    this.candidates = this.loadJSON('./data/candidates.json');
    this.voters = this.loadJSON('./data/voters.json');
    this.results = this.loadJSON('./data/results.json');
    this.tokenBalances = {};
    this.isOpen = false;
    this.startTime = null;
    this.endTime = null;

    this.loadState();
  }

  loadJSON(path) {
    if (!fs.existsSync(path)) return {};
    const content = fs.readFileSync(path, 'utf-8').trim();
    if (content === '') return {};
    return JSON.parse(content);
  }

  saveJSON(path, data) {
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
  }

  saveState() {
    const data = {
      startTime: this.startTime ? this.startTime.toISOString() : null,
      endTime: this.endTime ? this.endTime.toISOString() : null,
      isOpen: this.isOpen,
      tokenBalances: this.tokenBalances
    };
    this.saveJSON(this.statePath, data);
  }

  loadState() {
    if (!fs.existsSync(this.statePath)) return;
    const data = this.loadJSON(this.statePath);
    this.startTime = data.startTime ? new Date(data.startTime) : null;
    this.endTime = data.endTime ? new Date(data.endTime) : null;
    this.isOpen = data.isOpen || false;
    this.tokenBalances = data.tokenBalances || {};
  }

  addCandidate(name, answers) {
    const id = crypto.randomUUID();
    this.candidates[id] = { name, answers, votes: 0 };
    this.saveJSON('./data/candidates.json', this.candidates);
    return id;
  }

  registerVoter(publicKey) {
    const voterId = SHA256(publicKey).toString();

    if (!this.voters[voterId]) {
      this.voters[voterId] = { voted: false };
      this.saveJSON('./data/voters.json', this.voters);
    }
  }

  openElection(startTime, endTime) {
    this.startTime = new Date(startTime);
    this.endTime = new Date(endTime);
    this.isOpen = true;
    this.saveState();
    console.log('Election opened from:', this.startTime.toISOString(), 'to:', this.endTime.toISOString());
  }

  isElectionOpen() {
    const now = new Date();
    const open = this.isOpen && now >= this.startTime && now <= this.endTime;
    console.log('[DEBUG] Now:', now.toISOString());
    console.log('[DEBUG] Start:', this.startTime);
    console.log('[DEBUG] End:', this.endTime);
    console.log('[DEBUG] isElectionOpen:', open);
    return open;
  }

  vote(publicKey, candidateId) {
    if (!this.isElectionOpen()) throw new Error('Election is not open');

    const voterId = SHA256(publicKey).toString();

    if (!this.voters[voterId] || this.voters[voterId].voted) {
      throw new Error('Already voted or not registered');
    }

    if (!this.candidates[candidateId]) throw new Error('Invalid candidate');

    this.candidates[candidateId].votes++;
    this.voters[voterId].voted = true;
    this.tokenBalances[publicKey] = (this.tokenBalances[publicKey] || 0) + 1;

    this.saveJSON('./data/candidates.json', this.candidates);
    this.saveJSON('./data/voters.json', this.voters);
    this.saveState();
  }

  closeElection() {
    this.isOpen = false;
    this.endTime = new Date();
    this.saveState();
  }

  getResults() {
    const sorted = Object.entries(this.candidates)
      .sort((a, b) => b[1].votes - a[1].votes)
      .map(([id, data]) => ({ id, ...data }));
    this.saveJSON('./data/results.json', sorted);
    return sorted;
  }

  getBalance(publicKey) {
    return this.tokenBalances[publicKey] || 0;
  }
  clearAll() {
    this.candidates = {};
    this.voters = {};
    this.results = {};
    this.tokenBalances = {};
    this.isOpen = false;
    this.startTime = null;
    this.endTime = null;
  
    this.saveJSON('./data/candidates.json', {});
    this.saveJSON('./data/voters.json', {});
    this.saveJSON('./data/results.json', []);
    this.saveJSON('./data/election_state.json', {});
  }
  
}

module.exports = Election;
