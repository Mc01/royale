const Game = artifacts.require('Game.sol');

contract('Game', (accounts) => {
  const noPlayers = 1000;
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
    game = await Game.new(noPlayers, noGames, basicFee, gameDelay);
  })

  async function throws(fn, ...args) {
    thrown = false;
    try { await fn(...args); }
    catch (err) { thrown = true; }
    return thrown;
  }

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

  it('test states', async () => {
    await game.fund();

    assert.equal(
      await game.currentState.call(), statePlaying,
      'State should be Playing'
    );

    await game.play();

    assert.equal(
      await game.currentState.call(), stateFinished,
      'State should be Finished'
    );

    await game.kill();
  })
})
