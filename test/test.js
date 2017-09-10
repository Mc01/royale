const Game = artifacts.require('Game.sol');

contract('Game', (accounts) => {
  const noPlayers = 1000;
  const noGames = 30;
  const basicFee = 1;
  const gameDelay = 1;

  beforeEach(async () => {
    game = await Game.new(noPlayers, noGames, basicFee, gameDelay);
  })

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
  })
})
