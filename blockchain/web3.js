const { Web3 } = require("web3");
const config = require("./contractConfig");

let web3 = null;
let contract = null;
let defaultAccount = null;

function normalizeBytes32(value) {
  if (!value) {
    throw new Error("Missing voter hash");
  }

  const clean = value.startsWith("0x") ? value.slice(2) : value;

  if (!/^[a-fA-F0-9]{64}$/.test(clean)) {
    throw new Error("Voter hash must be a valid 32-byte hex string");
  }

  return `0x${clean}`;
}

function toNumber(value) {
  return Number(value.toString());
}

async function connect() {
  if (!config.contractAddress || !Array.isArray(config.abi) || config.abi.length === 0) {
    throw new Error(
      "Smart contract is not deployed yet. Run: npm run deploy:local"
    );
  }

  web3 = new Web3(config.network.url);

  const accounts = await web3.eth.getAccounts();

  if (!accounts.length) {
    throw new Error("No local blockchain accounts found. Run: npm run node");
  }

  defaultAccount = accounts[0];
  contract = new web3.eth.Contract(config.abi, config.contractAddress);

  return {
    account: defaultAccount,
    contractAddress: config.contractAddress,
    network: config.network,
  };
}

async function ensureConnection() {
  if (!web3 || !contract || !defaultAccount) {
    await connect();
  }
}

async function setElectionWindow(startTimestamp, endTimestamp) {
  await ensureConnection();

  return contract.methods
    .setElectionWindow(startTimestamp, endTimestamp)
    .send({ from: defaultAccount });
}

async function addCandidate(name, positions) {
  await ensureConnection();

  return contract.methods
    .addCandidate(name, positions)
    .send({ from: defaultAccount });
}

async function registerVoter(voterHash) {
  await ensureConnection();

  return contract.methods
    .registerVoter(normalizeBytes32(voterHash))
    .send({ from: defaultAccount });
}

async function castVote(voterHash, candidateId) {
  await ensureConnection();

  return contract.methods
    .vote(normalizeBytes32(voterHash), candidateId)
    .send({ from: defaultAccount });
}

async function getCandidates() {
  await ensureConnection();

  const candidates = await contract.methods.getCandidates().call();

  return candidates.map((candidate) => ({
    id: toNumber(candidate.id),
    name: candidate.name,
    positions: candidate.positions,
    voteCount: toNumber(candidate.voteCount),
    exists: candidate.exists,
  }));
}

async function getElectionInfo() {
  await ensureConnection();

  const info = await contract.methods.getElectionInfo().call();

  return {
    startTime: toNumber(info.electionStartTime),
    endTime: toNumber(info.electionEndTime),
    configured: info.configured,
    candidateCount: toNumber(info.candidateCount),
  };
}

async function getVoter(voterHash) {
  await ensureConnection();

  const voter = await contract.methods
    .getVoter(normalizeBytes32(voterHash))
    .call();

  return {
    registered: voter.registered,
    voted: voter.voted,
    rewardBalance: toNumber(voter.rewardBalance),
  };
}

async function resetElection() {
  await ensureConnection();

  return contract.methods.resetElection().send({ from: defaultAccount });
}

module.exports = {
  connect,
  setElectionWindow,
  addCandidate,
  registerVoter,
  castVote,
  getCandidates,
  getElectionInfo,
  getVoter,
  resetElection,
};
