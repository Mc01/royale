const HDWalletProvider = require('truffle-hdwallet-provider');

var mnemonic = '';

const kovanUrl = 'https://kovan.infura.io/fG2dpoLdhYxKtzRwAmOR';
const mainnetUrl = 'https://mainnet.infura.io/fG2dpoLdhYxKtzRwAmOR';

function gwei(n) { return n * (10 ** 9); }
function mwei(n) { return n * (10 ** 6); }

const gasLimit = mwei(6);
const gasPrice = gwei(30);

module.exports = {
  networks: {
    kovan: {
      network_id: 42,
      provider: new HDWalletProvider(mnemonic, kovanUrl),
      gas: gasLimit,
      gasPrice: gasPrice,
    },
    mainnet: {
      network_id: 1,
      provider: new HDWalletProvider(mnemonic, mainnetUrl),
      gas: gasLimit,
      gasPrice: gasPrice,
    },
    testnet: {
      network_id: '*',
      host: 'localhost',
      port: 8545,
    }
  }
};
