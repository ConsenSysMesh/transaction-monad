import _ from 'lodash';
import sinon from 'sinon';

export const STUB_TXHASH = 'STUB TXHASH';

export function stubbedProvider(resultFunc) {
  const getResult = resultFunc ? resultFunc : () => null;
  const provider = {
    sendAsync: (payloads, callback) => {
      const isBatchRequest = _.isArray(payloads);
      const payload = isBatchRequest ? payloads[0] : payloads;
      const { id, jsonrpc } = payload;
      const result = getResult(payload);
      const response = { id, jsonrpc, result };
      // Call the callback asynchronously for fidelity with the real sendAsync.
      setImmediate(() => callback(null, isBatchRequest ? [response] : response));
    },
  };
  return provider;
}

/**
 * Stub the RPC calls used to wait for a receipt.
 *
 * To call a stub for other RPC calls, pass it as options.fallback.
 * To test behavior when the block filter is never triggered, pass
 * 	 options.neverNewBlocks = true.
 */
export function receiptProviderStub(receipt, options = {}) {
  const {
    fallback = () => null,
    neverNewBlocks = false,
  } = options;
  const NEW_BLOCK_HASH = '0xe8d3266f3c4f083ab8864b5e04aea7b087044e49';

  return (payload) => {
    switch (payload.method) {
    case 'eth_newBlockFilter':
      return '0x1';
    case 'eth_uninstallFilter':
      return true;
    case 'eth_getFilterChanges':
      if (neverNewBlocks) {
        return [];
      }
      return [NEW_BLOCK_HASH];
    case 'eth_getTransactionReceipt':
      return receipt;
    default:
      return fallback(payload);
    }
  };
}
