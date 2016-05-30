import sinon from 'sinon';

export const STUB_TXHASH = 'STUB TXHASH';

export function stubbedProvider() {
  const resultStub = sinon.stub();
  const provider = {
    sendAsync: (payload, callback) => {
      const { id, jsonrpc } = payload;
      const result = resultStub();
      const response = { id, jsonrpc, result };
      callback(null, response);
    },
  };
  return { provider, resultStub };
}
