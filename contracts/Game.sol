pragma solidity ^0.4.11;

contract Game {
  enum State { Funding, Playing, Finished }
  State public currentState;

  uint256 feeMultiplier = 1 finney;
  uint256 delayMultipler = 1 hours;

  uint256 public noPlayers;
  uint256 public noGames;
  uint256 public basicFee;
  uint256 public gameDelay;

  address provider = 0x0;
  address public leader;

  modifier onlyInState(State state) { require(currentState == state); _; }

  function Game(
    uint256 _noPlayers,
    uint256 _noGames,
    uint256 _basicFee,
    uint256 _gameDelay
  ) {
    require(_noPlayers >= 100 && _noPlayers <= 100000); // 100 to 100k
    require(_noGames >= 3 && _noGames <= 30); // 3 to 30
    require(_basicFee >= 1 && _basicFee <= 1000); // 1 finney to 1 eth
    require(_gameDelay >= 1 && _gameDelay <= 24); // 1 hour to 1 day

    noPlayers = _noPlayers;
    noGames = _noGames;
    basicFee = _basicFee;
    gameDelay = _gameDelay;

    leader = msg.sender;
    currentState = State.Funding;
  }

  function fund() onlyInState(State.Funding) {
    currentState = State.Playing;
  }

  function play() onlyInState(State.Playing) {
    currentState = State.Finished;
  }

  function kill() onlyInState(State.Finished) {
    selfdestruct(provider);
  }
}
