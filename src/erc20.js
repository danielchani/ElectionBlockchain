// erc20.js – ניהול טוקנים פשוט למשתמשים
class TokenLedger {
    constructor() {
      this.balances = {};
    }
  
    mint(address, amount) {
      this.balances[address] = (this.balances[address] || 0) + amount;
    }
  
    transfer(from, to, amount) {
      if ((this.balances[from] || 0) < amount) {
        throw new Error('Insufficient balance');
      }
      this.balances[from] -= amount;
      this.balances[to] = (this.balances[to] || 0) + amount;
    }
  
    balanceOf(address) {
      return this.balances[address] || 0;
    }
  }
  
  module.exports = TokenLedger;
  