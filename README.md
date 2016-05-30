transaction-monad
=================

The `Transaction` monad allows transaction-dependent computation to be composed
without executing the transaction or specifying the Web3 Provider until later.
The requirements for a transaction, particularly gas costs, can be checked in
the client code rather than in a protocol library.

Tests
-----

Run the Mocha test suite with `npm test`.
