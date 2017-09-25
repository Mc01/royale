const Game = artifacts.require('Game.sol');

contract('Game', (accounts) => {
  let game;

  const finney = 10**15;
  const testAccount = accounts[5];

  const noPlayers = 100;
  const noGames = 30;
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
    await game.init(noPlayers, noGames, basicFee, gameDelay);
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
      await game.play();
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
    let initialAccount = parseInt(await web3.eth.getBalance(testAccount));
    let initialContract = parseInt(await web3.eth.getBalance(game.address));

    await fund();
    assert.equal(
      await game.currentState.call(), statePlaying,
      'State should be Playing'
    );
    let fundAccount = parseInt(await web3.eth.getBalance(testAccount));
    let fundContract = parseInt(await web3.eth.getBalance(game.address));

    await play();
    assert.equal(
      await game.currentState.call(), stateFinished,
      'State should be Finished'
    );
    let playedAccount = parseInt(await web3.eth.getBalance(testAccount));
    let playedContract = parseInt(await web3.eth.getBalance(game.address));

    assert.isOk(
      initialContract < playedContract && playedContract < fundContract &&
      fundAccount < initialAccount && initialAccount < playedAccount
    );

    await game.kill();
  })
})
