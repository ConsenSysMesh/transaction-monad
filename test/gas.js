import Promise from 'bluebird';
import { expect } from 'chai';
import sinon from 'sinon';
import Transaction from '../src';
import * as utils from './_utils';

global.Promise = Promise;  // Use bluebird for better error logging during development.


describe('Transaction.estimateGas', () => {
  it('estimates gas from daemon', async function (done) {
    const tx = Transaction({
      options: {
        from: '0xe8d3266f3c4f083ab8864b5e04aea7b087044e49',
        to: '0x7967c4f4512195ba83ae8f08ca30f7b145be6cf8',
        value: '0xf4240',
      },
    });

    const GAS_ESTIMATE = 21000;
    const resultStub = sinon.stub();
    resultStub.returns(GAS_ESTIMATE);
    const provider = utils.stubbedProvider(resultStub);
    const sendAsync = sinon.spy(provider, 'sendAsync');

    const result = await tx.estimateGas(provider);
    expect(result).to.be.equal(GAS_ESTIMATE);

    expect(sendAsync.calledOnce).to.be.true;
    const args = sendAsync.firstCall.args[0];
    expect(args.params[0]).to.deep.equal(tx.options);
    expect(args.method).to.equal('eth_estimateGas');

    done();
  });

  it('quickest estimate uses daemon without expectedGas', async function (done) {
    const tx = Transaction({
      options: {
        from: '0xe8d3266f3c4f083ab8864b5e04aea7b087044e49',
        to: '0x7967c4f4512195ba83ae8f08ca30f7b145be6cf8',
        value: '0xf4240',
      },
    });

    const GAS_ESTIMATE = 21000;
    const resultStub = sinon.stub();
    resultStub.returns(GAS_ESTIMATE);
    const provider = utils.stubbedProvider(resultStub);
    const sendAsync = sinon.spy(provider, 'sendAsync');

    const result = await tx.getQuickestGasEstimate(provider);
    expect(result).to.be.equal(GAS_ESTIMATE);

    expect(sendAsync.calledOnce).to.be.true;
    const args = sendAsync.firstCall.args[0];
    expect(args.params[0]).to.deep.equal(tx.options);
    expect(args.method).to.equal('eth_estimateGas');

    done();
  });

  it('quickest estimate uses expectedGas', async function (done) {
    const GAS_ESTIMATE = 21000;
    const tx = Transaction({
      options: {
        from: '0xe8d3266f3c4f083ab8864b5e04aea7b087044e49',
        to: '0x7967c4f4512195ba83ae8f08ca30f7b145be6cf8',
        value: '0xf4240',
      },
      expectedGas: GAS_ESTIMATE,
    });

    const provider = utils.stubbedProvider();
    const sendAsync = sinon.spy(provider, 'sendAsync');

    const result = await tx.getQuickestGasEstimate(provider);
    expect(result).to.be.equal(GAS_ESTIMATE);
    expect(sendAsync.called).to.be.false;
    done();
  });
});
