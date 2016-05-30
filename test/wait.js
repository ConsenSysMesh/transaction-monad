import Promise from 'bluebird';
import { expect } from 'chai';
import sinon from 'sinon';
import { utils } from '../src';
import * as testutils from './_utils';

global.Promise = Promise;  // Use bluebird for better error logging during development.


describe('waitForReceipt', () => {
  it('gets receipt from provider', async function (done) {
    const receipt = { dummy: true };
    const provider = testutils.stubbedProvider(testutils.receiptProviderStub(receipt));
    const sendAsync = sinon.spy(provider, 'sendAsync');

    const result = await utils.waitForReceipt(
      '0xe8d3266f3c4f083ab8864b5e04aea7b087044e49', provider);
    expect(result).to.equal(receipt);

    expect(sendAsync.called).to.be.true;
    // Ensure that the block filter was stopped.
    const args = sendAsync.lastCall.args[0];
    expect(args.method).to.equal('eth_uninstallFilter');

    done();
  });

  it("gets receipt when the transaction's block was already mined", async function (done) {
    const receipt = { dummy: true };
    const provider = testutils.stubbedProvider(
      testutils.receiptProviderStub(receipt, { neverNewBlocks: true }));
    const sendAsync = sinon.spy(provider, 'sendAsync');

    const result = await utils.waitForReceipt(
      '0xe8d3266f3c4f083ab8864b5e04aea7b087044e49', provider);
    expect(result).to.equal(receipt);

    expect(sendAsync.called).to.be.true;
    // Ensure that the block filter was stopped.
    const args = sendAsync.lastCall.args[0];
    expect(args.method).to.equal('eth_uninstallFilter');

    done();
  });
});
