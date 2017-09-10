var Game = artifacts.require("./Game.sol");

const noPlayers = 1000;
const noGames = 30;
const basicFee = 1;
const gameDelay = 1;

module.exports = function(deployer) {
  deployer.deploy(Game, noPlayers, noGames, basicFee, gameDelay);
};
