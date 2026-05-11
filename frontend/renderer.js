const EC = require("elliptic").ec;
const SHA256 = require("crypto-js/sha256");

const {
  connect,
  setElectionWindow,
  addCandidate: addCandidateOnChain,
  registerVoter,
  castVote,
  getCandidates,
  getElectionInfo,
  getVoter,
  resetElection,
} = require("./blockchain/web3");

const ec = new EC("secp256k1");

let currentStep = 1;
let currentPublicKey = "";
let resultsChart = null;
let connectedAccount = "";
let cachedElectionInfo = null;

function $(id) {
  return document.getElementById(id);
}

function writeOutput(data) {
  const output = $("output");

  if (!output) {
    return;
  }

  output.textContent =
    typeof data === "string" ? data : JSON.stringify(data, null, 2);
}

function logMessage(message) {
  writeOutput(`[${new Date().toLocaleTimeString()}] ${message}`);
}

function parseLocalDateTime(value) {
  if (!value || !value.trim()) {
    throw new Error("Date value is required");
  }

  const normalized = value.trim().replace(" ", "T");
  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid date format. Use YYYY-MM-DD HH:MM");
  }

  return Math.floor(date.getTime() / 1000);
}

function createVoterKey() {
  const keyPair = ec.genKeyPair();

  return keyPair.getPublic("hex");
}

function hashPublicKey(publicKey) {
  return SHA256(publicKey).toString();
}

async function refreshCandidates() {
  const candidates = await getCandidates();
  const select = $("manualCandidateSelect");

  if (select) {
    select.innerHTML = "";

    candidates.forEach((candidate) => {
      if (!candidate.exists) {
        return;
      }

      const option = document.createElement("option");
      option.value = candidate.id;
      option.textContent = `${candidate.name} (${candidate.voteCount} votes)`;
      select.appendChild(option);
    });
  }

  return candidates;
}

async function refreshElectionInfo() {
  cachedElectionInfo = await getElectionInfo();

  return cachedElectionInfo;
}

function isElectionOpen(info) {
  if (!info || !info.configured) {
    return false;
  }

  const now = Math.floor(Date.now() / 1000);

  return now >= info.startTime && now <= info.endTime;
}

function updateCountdownDisplay() {
  const countdown = $("countdown");

  if (!countdown || !cachedElectionInfo || !cachedElectionInfo.configured) {
    return;
  }

  const now = Math.floor(Date.now() / 1000);
  const remaining = cachedElectionInfo.endTime - now;

  if (remaining <= 0) {
    countdown.textContent = "Election closed";
    return;
  }

  const hours = Math.floor(remaining / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;

  countdown.textContent = `Time remaining: ${hours}h ${minutes}m ${seconds}s`;
}

function renderChart(candidates) {
  const canvas = $("resultsChart");

  if (!canvas || typeof Chart === "undefined") {
    return;
  }

  const labels = candidates.map((candidate) => candidate.name);
  const values = candidates.map((candidate) => candidate.voteCount);

  if (resultsChart) {
    resultsChart.destroy();
  }

  resultsChart = new Chart(canvas, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Votes",
          data: values,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
          },
        },
      },
    },
  });
}

async function startElection() {
  try {
    const startTimestamp = parseLocalDateTime($("startTime").value);
    const endTimestamp = parseLocalDateTime($("endTime").value);

    await setElectionWindow(startTimestamp, endTimestamp);
    await refreshElectionInfo();

    logMessage("Election window configured on-chain");
  } catch (error) {
    writeOutput(`Error: ${error.message}`);
  }
}

async function addCandidate() {
  try {
    const name = $("candidateName").value.trim();
    const positions = $("candidateAnswers").value.trim();

    if (!name) {
      throw new Error("Candidate name is required");
    }

    await addCandidateOnChain(name, positions);
    await refreshCandidates();

    $("candidateName").value = "";
    $("candidateAnswers").value = "";

    logMessage(`Candidate added on-chain: ${name}`);
  } catch (error) {
    writeOutput(`Error: ${error.message}`);
  }
}

async function generateKey() {
  try {
    currentPublicKey = createVoterKey();

    $("voterKey").value = currentPublicKey;

    const voterHash = hashPublicKey(currentPublicKey);

    await registerVoter(voterHash);

    logMessage("Voter key generated and registered on-chain");
  } catch (error) {
    writeOutput(`Error: ${error.message}`);
  }
}

async function ensureVoterKey() {
  if (!currentPublicKey) {
    await generateKey();
  }

  return {
    publicKey: currentPublicKey,
    voterHash: hashPublicKey(currentPublicKey),
  };
}

async function voteManual() {
  try {
    const candidateId = Number($("manualCandidateSelect").value);

    if (!Number.isInteger(candidateId)) {
      throw new Error("Select a valid candidate");
    }

    const info = await refreshElectionInfo();

    if (!isElectionOpen(info)) {
      throw new Error("Election is not currently open");
    }

    const { voterHash } = await ensureVoterKey();

    await registerVoter(voterHash);
    await castVote(voterHash, candidateId);

    const voter = await getVoter(voterHash);
    const candidates = await refreshCandidates();

    renderChart(candidates);

    writeOutput({
      message: "Vote submitted on-chain",
      voterHash,
      rewardBalance: voter.rewardBalance,
    });
  } catch (error) {
    writeOutput(`Error: ${error.message}`);
  }
}

function getQuestionnaireAnswers() {
  return [$("q1").value, $("q2").value, $("q3").value].map((value) =>
    value.toLowerCase()
  );
}

function scoreCandidate(candidate, answers) {
  const positions = candidate.positions
    .split(",")
    .map((position) => position.trim().toLowerCase());

  return answers.reduce((score, answer) => {
    return positions.includes(answer) ? score + 1 : score;
  }, 0);
}

async function voteFromQuestionnaire() {
  try {
    const info = await refreshElectionInfo();

    if (!isElectionOpen(info)) {
      throw new Error("Election is not currently open");
    }

    const candidates = await getCandidates();

    if (!candidates.length) {
      throw new Error("No candidates available");
    }

    const answers = getQuestionnaireAnswers();

    const bestCandidate = candidates
      .filter((candidate) => candidate.exists)
      .map((candidate) => ({
        ...candidate,
        score: scoreCandidate(candidate, answers),
      }))
      .sort((a, b) => b.score - a.score)[0];

    if (!bestCandidate) {
      throw new Error("Could not match a candidate");
    }

    const { voterHash } = await ensureVoterKey();

    await registerVoter(voterHash);
    await castVote(voterHash, bestCandidate.id);

    const updatedCandidates = await refreshCandidates();

    renderChart(updatedCandidates);

    writeOutput({
      message: "Questionnaire vote submitted on-chain",
      selectedCandidate: bestCandidate.name,
      matchedScore: bestCandidate.score,
      voterHash,
    });
  } catch (error) {
    writeOutput(`Error: ${error.message}`);
  }
}

function showStep(stepNumber) {
  for (let i = 1; i <= 3; i++) {
    const step = $(`step${i}`);

    if (step) {
      step.classList.toggle("hidden", i !== stepNumber);
    }
  }

  $("prevBtn").disabled = stepNumber === 1;
  $("nextBtn").textContent = stepNumber === 3 ? "Vote" : "Next";
}

async function nextStep() {
  if (currentStep < 3) {
    currentStep += 1;
    showStep(currentStep);
    return;
  }

  await voteFromQuestionnaire();
}

function prevStep() {
  if (currentStep > 1) {
    currentStep -= 1;
    showStep(currentStep);
  }
}

async function ensureDefaultCandidates() {
  const existing = await getCandidates();

  if (existing.length > 0) {
    return existing;
  }

  const defaults = [
    {
      name: "Candidate A",
      positions: "left,welfare,peace",
    },
    {
      name: "Candidate B",
      positions: "center,economy,neutral",
    },
    {
      name: "Candidate C",
      positions: "right,tax-reduction,security",
    },
  ];

  for (const candidate of defaults) {
    await addCandidateOnChain(candidate.name, candidate.positions);
  }

  return refreshCandidates();
}

async function ensureOpenElectionForDemo() {
  const info = await refreshElectionInfo();

  if (isElectionOpen(info)) {
    return;
  }

  const now = Math.floor(Date.now() / 1000);

  await setElectionWindow(now - 60, now + 3600);
  await refreshElectionInfo();
}

async function runSimulation() {
  try {
    const amount = Number($("simCount").value);

    if (!Number.isInteger(amount) || amount <= 0) {
      throw new Error("Simulation amount must be a positive number");
    }

    await ensureOpenElectionForDemo();

    const candidates = await ensureDefaultCandidates();

    if (!candidates.length) {
      throw new Error("No candidates available for simulation");
    }

    for (let i = 0; i < amount; i++) {
      const publicKey = createVoterKey();
      const voterHash = hashPublicKey(publicKey);
      const candidateId = candidates[i % candidates.length].id;

      await registerVoter(voterHash);
      await castVote(voterHash, candidateId);
    }

    const updatedCandidates = await refreshCandidates();

    renderChart(updatedCandidates);

    writeOutput({
      message: "Simulation completed on-chain",
      simulatedVotes: amount,
    });
  } catch (error) {
    writeOutput(`Error: ${error.message}`);
  }
}

async function showResults() {
  try {
    const candidates = await refreshCandidates();

    renderChart(candidates);

    writeOutput({
      connectedAccount,
      contractResults: candidates,
    });
  } catch (error) {
    writeOutput(`Error: ${error.message}`);
  }
}

async function resetAll() {
  try {
    await resetElection();

    currentPublicKey = "";

    if ($("voterKey")) {
      $("voterKey").value = "";
    }

    await refreshCandidates();
    await refreshElectionInfo();

    if (resultsChart) {
      resultsChart.destroy();
      resultsChart = null;
    }

    logMessage("Election contract state reset");
  } catch (error) {
    writeOutput(`Error: ${error.message}`);
  }
}

async function initializeApp() {
  try {
    const connection = await connect();

    connectedAccount = connection.account;

    await refreshCandidates();
    await refreshElectionInfo();

    showStep(currentStep);
    updateCountdownDisplay();

    setInterval(updateCountdownDisplay, 1000);
    setInterval(refreshElectionInfo, 10000);

    writeOutput({
      message: "Connected to local blockchain",
      account: connectedAccount,
      contractAddress: connection.contractAddress,
      network: connection.network,
    });
  } catch (error) {
    writeOutput(
      `Blockchain connection failed: ${error.message}\n\nStart the local blockchain and deploy the contract before running the app.`
    );
  }
}

window.startElection = startElection;
window.addCandidate = addCandidate;
window.generateKey = generateKey;
window.voteManual = voteManual;
window.nextStep = nextStep;
window.prevStep = prevStep;
window.runSimulation = runSimulation;
window.showResults = showResults;
window.resetAll = resetAll;

window.addEventListener("DOMContentLoaded", initializeApp);
