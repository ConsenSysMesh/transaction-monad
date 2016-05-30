import Promise from 'bluebird';
import t from 'tcomb';
import Web3 from 'web3';


/**
 * A transaction-dependent computation. Clients can compose operations on the
 * result of the transaction, but can always simulate the transaction to
 * check the gas costs or return value of the dependent transaction.
 *
 * This approach is intended for libraries that want to provide clients with
 * promises that resolve to a useful value.
 */
const Transaction = t.struct({
  options: t.Object,
  expectedGas: t.maybe(t.Number),
  // handleTransact is typically passed via compose unless the transaction
  // logic itself is being overridden.
  handleTransact: t.maybe(t.Function),
});

Object.assign(Transaction.prototype, {
  /**
   * Performs the transaction-dependent computation defined in handleTransact. If
   * handleTransact was not provided, the transaction is sent and its hash is
   * returned in a Promise.
   */
  transact(provider, overrides) {
    if (this.handleTransact != null) {
      return this.handleTransact(provider, overrides);
    }

    const web3 = new Web3(provider);
    const sendTransaction = Promise.promisify(web3.eth.sendTransaction);
    return sendTransaction({ ...this.options, ...(overrides || {}) });
  },

  /**
   * Create a new Transaction that operates on this Transaction's result using
   * the provided function. Its transact() method will return a Promise that
   * resolves to the result of the provided function.
   *
   * The provided function will receive the Web3 Provider used for the transaction
   * as the last argument.
   */
  map(fn) {
    const wrapped = this;
    return Transaction({
      ...wrapped,
      handleTransact(provider, overrides) {
        return wrapped.transact(provider, overrides)
          .then((...args) => fn(...args, provider));
      },
    });
  },

  estimateGas(provider) {
    const web3 = new Web3(provider);
    const web3EstimateGas = Promise.promisify(web3.eth.estimateGas);
    return web3EstimateGas(this.options);
  },

  getQuickestGasEstimate(provider) {
    if (this.expectedGas != null) {
      return Promise.resolve(this.expectedGas);
    }
    return this.estimateGas(provider);
  },
});

export default Transaction;
