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

describe('waitForContract', () => {
  it('waits for contract', async function (done) {
    const getCode = sinon.stub();
    getCode.returns('0x1');
    const receipt = { contractAddress: '0x7967c4f4512195ba83ae8f08ca30f7b145be6cf8' };
    const provider = testutils.stubbedProvider(testutils.receiptProviderStub(
      receipt, { fallback: getCode }));
    const sendAsync = sinon.spy(provider, 'sendAsync');

    const result = await utils.waitForContract(
      '0xe8d3266f3c4f083ab8864b5e04aea7b087044e49', provider);
    expect(result).to.equal(receipt.contractAddress);

    expect(sendAsync.called).to.be.true;
    expect(getCode.calledOnce).to.be.true;

    done();
  });

  it('fails if no code was found', async function (done) {
    const getCode = sinon.stub();
    getCode.returns('0x');
    const receipt = { contractAddress: '0x7967c4f4512195ba83ae8f08ca30f7b145be6cf8' };
    const provider = testutils.stubbedProvider(testutils.receiptProviderStub(
      receipt, { fallback: getCode }));
    const sendAsync = sinon.spy(provider, 'sendAsync');

    let threw = false;
    try {
      await utils.waitForContract(
        '0xe8d3266f3c4f083ab8864b5e04aea7b087044e49', provider);
    } catch (error) {
      threw = true;
    }

    expect(threw).to.be.true;
    expect(sendAsync.called).to.be.true;
    expect(getCode.calledOnce).to.be.true;

    done();
  });
});
