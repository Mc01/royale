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

  uint256 public entryFee;
  uint256 public fundingGoal;
  uint256 public gameReward;

  address provider = 0x0;
  address public leader;

  uint256 fundsRaised;
  uint256 currentGame;

  address[] public playerList;
  mapping (address => uint256) public players;
  address[] public winnerList;
  mapping (address => bool) public winners;

  event FailedWin(address winner);

  modifier onlyInState(State state) { require(currentState == state); _; }

  function init(
    uint256 _noPlayers,
    uint256 _noGames,
    uint256 _basicFee,
    uint256 _gameDelay
  ) {
    require(_noPlayers >= 100 && _noPlayers <= 100000); // 100 to 100k
    require(_noGames >= 3 && _noGames <= 30); // 3 to 30 games
    require(_basicFee >= 1 && _basicFee <= 1000); // 1 finney to 1 eth
    require(_gameDelay >= 1 && _gameDelay <= 24); // 1 hour to 1 day

    noPlayers = _noPlayers;
    noGames = _noGames;
    basicFee = _basicFee;
    gameDelay = _gameDelay;

    entryFee = (noGames + 2) * basicFee; // 5 finney to 32 eth
    fundingGoal = noPlayers * entryFee; // 500 finney to 3.2 mln eth
    gameReward = noPlayers * basicFee; // 100 finney to 100k eth

    leader = msg.sender;
    currentState = State.Funding;
  }

  function fund() onlyInState(State.Funding) payable {
    require(msg.value == entryFee * feeMultiplier);
    /*require(msg.sender != leader);*/ // disabled for local
    require(players[msg.sender] == 0);

    players[msg.sender] = msg.value;
    playerList.push(msg.sender);
    fundsRaised += msg.value;

    if (fundsRaised >= fundingGoal * feeMultiplier) {
      currentState = State.Playing;
    }
  }

  function _getRandomNumber() private returns (uint256) {
    return 4;
  }

  function _validateWinner(uint256 winner) private returns (uint256) {
    if (winners[playerList[winner]]) {
      for (uint256 i; i < noGames; i++) {
        winner++;
        if (winner >= noPlayers) { winner = 0; } // Reset to zero
        if (!winners[playerList[winner]]) { break; }
      }
    }

    address player = playerList[winner];
    winners[player] = true;
    winnerList.push(player);
    return winner;
  }

  function play() onlyInState(State.Playing) {
    uint256 winner = _getRandomNumber();
    winner = _validateWinner(winner);

    address player = playerList[winner];
    if (!player.send(gameReward * feeMultiplier)) { FailedWin(player); }

    currentGame++;
    if (currentGame >= noGames) {
      currentState = State.Finished;
    }
  }

  function kill() onlyInState(State.Finished) {
    if (!leader.send(gameReward * feeMultiplier)) { FailedWin(leader); }
    selfdestruct(provider);
  }
}
