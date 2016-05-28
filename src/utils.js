import Promise from 'bluebird';
import Web3 from 'web3';


function deconstructedPromise() {
  const parts = {};
  parts.promise = new Promise((resolve, reject) => {
    parts.resolve = resolve;
    parts.reject = reject;
  });
  return parts;
}

function receiptChecker(hash, filter, web3Provider, resolve) {
  return () => {
    new Web3(web3Provider).eth.getTransactionReceipt(hash, (err, receipt) => {
      if (err || receipt == null) {
        return;
      }

      console.log(`Transaction ${hash} was mined in block ${receipt.blockNumber}.`);
      resolve(receipt);
      filter.stopWatching();
    });
  };
}

/**
 * Create a promise that resolves to the receipt for the given transaction
 * hash once it has been included in a block.
 */
export function waitForReceipt(txhash, web3Provider) {
  console.log(`Waiting for transaction ${txhash} to be mined...`);
  const { promise, resolve } = deconstructedPromise();
  // Start a block filter to check for receipts on each new block.
  const filter = new Web3(web3Provider).eth.filter('latest');
  const checkForReceipt = receiptChecker(txhash, filter, web3Provider, resolve);
  filter.watch(checkForReceipt);

  // Check for a receipt on the current block. The transaction might have been
  // mined before the filter was created.
  checkForReceipt();

  return promise;
}

/**
 * Create a promise that resolves to the address of the deployed contract if
 * deployed successfully.
 * @return {Promise<Address>}
 */
export function waitForContract(txhash, web3Provider) {
  const getCode = Promise.promisify(new Web3(web3Provider).eth.getCode);
  return waitForReceipt(txhash, web3Provider)
    .then((receipt) => {
      // Contract addresses are deterministic, so web3 (supposedly) sets the
      // contract address on the receipt even if the transaction failed. Checking
      // for the contract code proves the transaction succeeded.
      return getCode(receipt.contractAddress)
        .then((code) => {
          if (code.length > 2) {
            return receipt;
          }

          throw new Error('Contract code was not stored, probably because it ran out of gas.');
        });
    })
    .then(receipt => receipt.contractAddress);
}
