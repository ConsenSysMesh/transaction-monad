import Promise from 'bluebird';
import { expect } from 'chai';
import sinon from 'sinon';
import Transaction from '../src';
import * as utils from './utils';

global.Promise = Promise;  // Use bluebird for better error logging during development.


describe('transact', () => {
  it('uses the transaction options to send a transaction', async function (done) {
    const tx = Transaction({
      options: {
        from: '0xe8d3266f3c4f083ab8864b5e04aea7b087044e49',
        to: '0x7967c4f4512195ba83ae8f08ca30f7b145be6cf8',
        value: '0xf4240',
      },
    });

    const { provider, resultStub } = utils.stubbedProvider();
    const sendAsync = sinon.spy(provider, 'sendAsync');
    resultStub.returns(utils.STUB_TXHASH);

    const txhash = await tx.transact(provider);

    expect(txhash).to.be.equal(utils.STUB_TXHASH);
    expect(sendAsync.calledOnce).to.be.true;

    const args = sendAsync.firstCall.args[0];
    expect(args.params[0]).to.be.deep.equal(tx.options);
    expect(args.method).to.be.equal('eth_sendTransaction');

    done();
  });
});
