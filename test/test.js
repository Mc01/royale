const sha256 = require('js-sha256').sha256;
const BigNumber = require('bignumber.js');

const Game = artifacts.require('Game.sol');

contract('Game', (accounts) => {
  let game;

  const finney = 10**15;

  const noGames = 3;
  const sources = Array(noGames).fill().map(() => `${Math.random()}`);
  const secrets = sources.map(s => new BigNumber(`0x${sha256(s)}`));

  const noPlayers = 100;
  const basicFee = 1;
  const gameDelay = 1;

  const entryFee = (noGames + 2) * basicFee;
  const fundingGoal = noPlayers * entryFee;
  const gameReward = noPlayers * basicFee;

  const stateFunding = 0;
  const statePlaying = 1;
  const stateFinished = 2;

  beforeEach(async () => {
    game = await Game.new();
    await game.init(noPlayers, noGames, basicFee, gameDelay, secrets);
  })

  async function throws(fn, ...args) {
    thrown = false;
    try { await fn(...args); }
    catch (err) { thrown = true; }
    return thrown;
  }

  async function fund() {
    let i = 0;
    let leader = await game.leader.call();
    for (account of accounts) {
      if (account != leader) {
        await game.fund({ value: entryFee * finney, from: account });
        i += 1;
        if (i >= noPlayers) { break; }
      }
    }
  }

  async function play() {
    for (let i = 0; i < noGames; i++) {
      await game.play(sources[i]);
    }
  }

  // New game test

  it('test new game', async () => {
    assert.equal(
      await game.noPlayers.call(), noPlayers,
      'No players should match'
    );

    assert.equal(
      await game.noGames.call(), noGames,
      'No games should match'
    );

    assert.equal(
      await game.basicFee.call(), basicFee,
      'Basic fee should match'
    );

    assert.equal(
      await game.gameDelay.call(), gameDelay,
      'Game delay should match'
    );

    assert.equal(
      await game.currentState.call(), stateFunding,
      'State should be Funding'
    );
  })

  // Computation test

  it('test calculated params', async () => {
    assert.equal(
      await game.entryFee.call(), entryFee,
      'Entry fee should match'
    );

    assert.equal(
      await game.fundingGoal.call(), fundingGoal,
      'Funding goal should match'
    );

    assert.equal(
      await game.gameReward.call(), gameReward,
      'Game reward should match'
    );
  })

  // Workflow test

  it('test workflow', async () => {
    let initialContract = parseInt(await web3.eth.getBalance(game.address));

    await fund();
    assert.equal(
      parseInt(await game.currentState.call()), statePlaying,
      'State should be Playing'
    );
    let fundContract = parseInt(await web3.eth.getBalance(game.address));

    await play();
    assert.equal(
      parseInt(await game.currentState.call()), stateFinished,
      'State should be Finished'
    );
    let playedContract = parseInt(await web3.eth.getBalance(game.address));

    assert.isOk(
      initialContract < playedContract && playedContract < fundContract
    );

    let balances = [];
    for (let i = 0; i < noPlayers; i++) {
      balances.push(parseInt(await web3.eth.getBalance(accounts[i])));
    }

    await game.kill();
  })
})
