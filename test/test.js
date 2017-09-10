const Game = artifacts.require('Game.sol');

contract('Game', (accounts) => {
  const noPlayers = 1000;
  const noGames = 30;
  const basicFee = 1;
  const gameDelay = 1;

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
      await game.noPlayers(), noPlayers,
      'Players should match'
    );

    assert.equal(
      await game.noGames(), noGames,
      'Games should match'
    );

    assert.equal(
      await game.basicFee(), basicFee,
      'Fee should match'
    );

    assert.equal(
      await game.gameDelay(), gameDelay,
      'Delay should match'
    );

    assert.equal(
      await game.currentState(), stateFunding,
      'State should be Funding'
    );
  })

  it('test states', async () => {
    await game.fund();

    assert.equal(
      await game.currentState(), statePlaying,
      'State should be Playing'
    );

    await game.play();

    assert.equal(
      await game.currentState(), stateFinished,
      'State should be Finished'
    );

    await game.kill();
  })
})
