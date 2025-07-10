// voter_cli.js – English CLI with temporary election window injection
const inquirer = require('inquirer');
const Election = require('./election');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const Table = require('cli-table3');

function matchCandidate(voterAnswers, candidates) {
  let bestId = null;
  let bestScore = -1;
  for (const [id, c] of Object.entries(candidates)) {
    const overlap = c.answers.filter(a => voterAnswers.includes(a)).length;
    if (overlap > bestScore) {
      bestId = id;
      bestScore = overlap;
    }
  }
  return bestId;
}

async function main() {
  const election = new Election();

  // TEMP FIX: open elections for 10 minutes from now if not opened
  if (!election.startTime || !election.endTime) {
    const now = new Date();
    const later = new Date(Date.now() + 10 * 60 * 1000);
    election.openElection(now, later);
    console.log('[⚠️ TEMP] Elections opened automatically for 10 minutes');
  }

  const key = ec.genKeyPair();
  const publicKey = key.getPublic('hex');
  election.registerVoter(publicKey);
  console.log(`\n🔑 Your public key: ${publicKey}`);

  if (!election.isElectionOpen()) {
    console.log('\n🛑 Elections are currently closed.\n');
    return;
  }

  // Show candidates table
  const table = new Table({ head: ['ID', 'Name', 'Positions'] });
  for (const [id, cand] of Object.entries(election.candidates)) {
    table.push([id.slice(0, 8), cand.name, cand.answers.join(', ')]);
  }
  console.log('\n📋 Registered Candidates:');
  console.log(table.toString());

  const { voteMode } = await inquirer.prompt([
    {
      type: 'list',
      name: 'voteMode',
      message: 'How would you like to vote?',
      choices: ['Ideological Match (Questionnaire)', 'Manual Selection']
    }
  ]);

  let candidateId;
  if (voteMode === 'Manual Selection') {
    const { chosen } = await inquirer.prompt([
      {
        type: 'list',
        name: 'chosen',
        message: 'Select your candidate:',
        choices: Object.entries(election.candidates).map(([id, c]) => ({
          name: `${c.name} – ${c.answers.join(', ')}`,
          value: id
        }))
      }
    ]);
    candidateId = chosen;
  } else {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'q1',
        message: 'What is your stance on politics?',
        choices: ['left', 'right', 'center']
      },
      {
        type: 'list',
        name: 'q2',
        message: 'What is your economic preference?',
        choices: ['economy', 'welfare', 'tax-reduction']
      },
      {
        type: 'list',
        name: 'q3',
        message: 'How do you feel about security?',
        choices: ['security', 'peace', 'neutral']
      }
    ]);
    const voterAnswers = Object.values(answers);
    candidateId = matchCandidate(voterAnswers, election.candidates);

    const matched = election.candidates[candidateId];
    console.log('\n🤝 Ideological Match:');
    console.log(`🔸 Candidate: ${matched.name}`);
    console.log(`🔹 Positions: ${matched.answers.join(', ')}`);
    console.log(`🎯 Match Score: ${matched.answers.filter(a => voterAnswers.includes(a)).length} / 3`);
  }

  try {
    election.vote(publicKey, candidateId);
    console.log('\n✅ Vote successful!');
    console.log(`💰 You received ${election.getBalance(publicKey)} token(s)`);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

main();
