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

const minedTx = tx.map((txhash, provider) => waitForReceipt(txhash, provider));
const gas = await minedTx.estimateGas(httpProvider);

minedTx.transact(httpProvider)
  .then((receipt) => {
    ...
  })
```

Tests
-----

Run the Mocha test suite with `npm test`.
