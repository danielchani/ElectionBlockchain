// admin.js – ממשק אדמין לניהול הבחירות
const Election = require('./election'); // 
const readline = require('readline');
const election = new Election();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function menu() {
  console.log('\n=== Admin Menu ===');
  console.log('1. Add Candidate');
  console.log('2. Register Voter');
  console.log('3. Open Election');
  console.log('4. Close Election');
  console.log('5. Show Results');
  console.log('6. Check Voter Balance');
  console.log('7. Exit');

  rl.question('Choose an option: ', (answer) => {
    switch (answer) {
      case '1':
        rl.question('Candidate name: ', (name) => {
          rl.question('Answers (comma-separated): ', (ans) => {
            const answers = ans.split(',').map(a => a.trim());
            const id = election.addCandidate(name, answers);
            console.log('✅ Candidate added with ID:', id);
            menu();
          });
        });
        break;

      case '2':
        rl.question('Voter Public Key: ', (key) => {
          election.registerVoter(key);
          console.log('✅ Voter registered.');
          menu();
        });
        break;

      case '3':
        rl.question('Start time (YYYY-MM-DD HH:MM): ', (start) => {
          rl.question('End time (YYYY-MM-DD HH:MM): ', (end) => {
            election.openElection(start, end);
            console.log('🟢 Election opened.');
            menu();
          });
        });
        break;

      case '4':
        election.closeElection();
        console.log('🛑 Election closed.');
        menu();
        break;

      case '5':
        const results = election.getResults();
        console.log('📊 Election Results:\n', results);
        menu();
        break;

      case '6':
        rl.question('Voter Public Key: ', (key) => {
          const balance = election.getBalance(key);
          console.log(` Token Balance: ${balance}`);
          menu();
        });
        break;

      case '7':
        rl.close();
        break;

      default:
        console.log('X Invalid option');
        menu();
    }
  });
}

menu();
