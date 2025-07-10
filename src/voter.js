const ElectionVoter = require('./election');
const readlineVoter = require('readline');
const electionVoter = new ElectionVoter();

const rlVoter = readlineVoter.createInterface({
  input: process.stdin,
  output: process.stdout
});

rlVoter.question('Enter your public key: ', (pubKey) => {
  const candidates = electionVoter.candidates;
  console.log('\nAvailable candidates:');
  Object.entries(candidates).forEach(([id, data]) => {
    console.log(`${id}: ${data.name}`);
  });

  rlVoter.question('Enter candidate ID to vote for: ', (cid) => {
    try {
      electionVoter.vote(pubKey, cid);
      console.log(' Vote successful!');
    } catch (err) {
      console.error('X Error:', err.message);
    }
    rlVoter.close();
  });
});