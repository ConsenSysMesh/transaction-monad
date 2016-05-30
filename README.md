transaction-monad
=================

The `Transaction` monad allows transaction-dependent computation to be composed
without executing the transaction or specifying the Web3 Provider until later.
The requirements for a transaction, particularly gas costs, can be checked in
the client code rather than in a protocol library.

Usage
-----

```
// ES6
import Transaction from 'transaction-monad';
import * as utils from 'transaction-monad/lib/utils';

// ES5
var Transaction = require('transaction-monad');
var utils = require('transaction-monad/lib/utils');

const httpProvider = new Web3.providers.HttpProvider('http://localhost:8545');
const tx = Transaction({
  options: {
    from: '0xe8d3266f3c4f083ab8864b5e04aea7b087044e49',
    to: '0x7967c4f4512195ba83ae8f08ca30f7b145be6cf8',
    value: 1000000,
  },
});

const minedTx = tx.map((txhash, provider) => utils.waitForReceipt(txhash, provider));
const gas = await minedTx.getQuickestGasEstimate(httpProvider);

minedTx.transact(httpProvider)
  .then((receipt) => {
    ...
  })

// Protocol Libraries
// ==================

function transferTokens(sender, to, amount) {
  const web3 = new Web3();
  const TokenContract = web3.eth.contract(Token.abi).at(Token.address);
  const data = TokenContract.transfer.getData(to, amount);
  const options = { data, from: sender, to: Pledges.address };
  return Transaction({ options });
}

const tx = transferTokens(
  '0xe8d3266f3c4f083ab8864b5e04aea7b087044e49',
  '0x7967c4f4512195ba83ae8f08ca30f7b145be6cf8',
  1000000
);

const txhash = await tx.transact(provider);
```

Tests
-----

Run the Mocha test suite with `npm test`.
