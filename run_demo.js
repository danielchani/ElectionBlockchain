// גרסה מתקדמת של run_demo.js – כולל פתיחת בחירות, התאמה אידאולוגית ושמירה לקובץ log.txt
const fs = require('fs');
const Election = require('./src/election');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const logStream = fs.createWriteStream('log.txt', { flags: 'w' });
const log = (text) => {
  console.log(text);
  logStream.write(text + '\n');
};

const initData = () => {
  fs.writeFileSync('./data/candidates.json', JSON.stringify({}, null, 2));
  fs.writeFileSync('./data/voters.json', JSON.stringify({}, null, 2));
  fs.writeFileSync('./data/results.json', JSON.stringify([], null, 2));
  log('🧼 All data files reset.\n');
};

const createKeyPair = () => {
  const key = ec.genKeyPair();
  return {
    publicKey: key.getPublic('hex'),
    privateKey: key.getPrivate('hex')
  };
};

const allAnswers = ['left', 'right', 'center', 'economy', 'security', 'peace'];
const randomAnswers = () => [...allAnswers].sort(() => 0.5 - Math.random()).slice(0, 3);
const randomName = (prefix, i) => `${prefix} ${i + 1}`;

const matchCandidate = (voterAnswers, candidates) => {
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
};

const runDemo = () => {
  initData();
  const election = new Election();

  const candidateIds = [];
  for (let i = 0; i < 3; i++) {
    const name = randomName('candidate', i);
    const answers = randomAnswers();
    const id = election.addCandidate(name, answers);
    candidateIds.push(id);
    log(`🧑‍💼 Added Candidate: ${name} (${id}) → ${answers.join(', ')}`);
  }

  const now = new Date();
  const fiveMinLater = new Date(now.getTime() + 5 * 60000);
  election.openElection(now.toISOString(), fiveMinLater.toISOString());
  log('\n🟢 Election is now open!\n');

  const voters = [];
  for (let i = 0; i < 5; i++) {
    const voter = createKeyPair();
    voter.answers = randomAnswers();
    voters.push(voter);
    election.registerVoter(voter.publicKey);

    const matchedCandidate = matchCandidate(voter.answers, election.candidates);
    const matched = election.candidates[matchedCandidate];
    election.vote(voter.publicKey, matchedCandidate);

    log(`✅ Voter ${i + 1}:`);
    log(`   Public Key: ${voter.publicKey}`);
    log(`   Answers: ${voter.answers.join(', ')}`);
    log(`   Matched to: ${matched.name} (${matchedCandidate})`);
    log(`   Candidate Answers: ${matched.answers.join(', ')}`);
    log(`   Shared Positions: ${matched.answers.filter(a => voter.answers.includes(a)).length}\n`);
  }

  election.closeElection();
  log('\n🛑 Election closed.');

  log('\n📊 Election Results:');
  const results = election.getResults();
  results.forEach((res, i) => {
    log(`${i + 1}. ${res.name} – ${res.votes} votes`);
  });

  log('\n💰 Voter Token Balances:');
  voters.forEach((v, i) => {
    const bal = election.getBalance(v.publicKey);
    log(`Voter ${i + 1}: ${bal} tokens`);
  });

  log('\n✅ Advanced Demo Complete.');
  logStream.end();
};

runDemo();
