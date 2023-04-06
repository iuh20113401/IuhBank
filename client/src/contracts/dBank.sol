// SPDX-License-Identifier: MIT
pragma solidity >0.6.0 <0.8.0;
//giống import trong python
import "./Token.sol";

// tạo ra Smart contract tên là dBank
contract dBank {
  Token private token;
  address payable public receiver;
  address[] staker;
  uint PayOffAmount;
  mapping (address => bool) staked;
  mapping (address => string) StakeMethod;
  mapping(address => uint) public stakeStart;
  mapping(address => bool) public isStake;
  mapping(address => uint) public stakeBalanceOf;
  mapping(address => uint) public TokenBalanceOf;

  mapping(address => uint) public etherBalanceOf;
  mapping(address => bool) public isDeposited;
  mapping(address => uint) public depositStart;

  mapping (address => address) borrower;
  mapping (address => string[]) borrowMethod;
  mapping (address => mapping(address => uint)) public borrowBalanceOf;
  mapping (address => mapping(address => uint)) public TokenBorrowBalanceOf;
  mapping (address => address[]) lender;
  mapping (address => mapping(address => bool)) lendedEther;
  mapping (address => mapping(address => bool)) lendedToken;
  mapping (address => mapping(address => uint)) public interest;
  mapping(address => bool) public isBorrowed;
  
  event Deposit(address indexed user, uint etherAmount, uint timeStart);
  event Withdraw(address indexed user, uint etherAmount, uint depositTime);

  constructor(Token _token) public {
  token = _token;
  etherBalanceOf[msg.sender] = 0;
  }

  // Khai báo một hàm dùng để gửi tiền gủi
  function deposit() payable public {
  // Yêu cầu chỉ được gủi 1 lần 1 lúc
    require(msg.value>=1e16, 'Error, deposit must be >= 0.01 ETH');
  //tạo ra biến lưu trữ số tiền gửi của người gửi
    etherBalanceOf[msg.sender] = etherBalanceOf[msg.sender] + msg.value;
  // ghi lại thời gian gửi tiền
    depositStart[msg.sender] = depositStart[msg.sender] + block.timestamp;
  // kích hoạt trạng thái gửi tiền
    isDeposited[msg.sender] = true; //activate deposit status
  // Ghi lại thông tin gửi tiền của khách hàng
    emit Deposit(msg.sender, msg.value, block.timestamp);
  }

  // khai báo một hàm dùng để rút tiền cộng với tiền lãi
  function withdraw() public {
    // kiểm tra trạng thái gửi tiền nếu không có tiền gửi thì báo lỗi
    require(isDeposited[msg.sender]==true, 'Error, no previous deposit');
    // khai báo một biến dùng để lưu trữ tiền gửi của người gửi
    uint userBalance = etherBalanceOf[msg.sender]; //for event
    uint depositTime = block.timestamp - depositStart[msg.sender];
    payable(msg.sender).transfer(etherBalanceOf[msg.sender]); //eth 
    depositStart[msg.sender] = 0;
    etherBalanceOf[msg.sender] = 0;
    isDeposited[msg.sender] = false;
    emit Withdraw(msg.sender, userBalance, depositTime);
  }

  //khai báo một hàm dùng để đặt tiền cọc bằng tiền gửi trong ngân hàng từ trước
  function CocWithEtherDeposit(uint amount) payable public {
    require(etherBalanceOf[msg.sender] >= amount, 'Error, deposit already active');
    stakeBalanceOf[msg.sender] = stakeBalanceOf[msg.sender] + amount;
    stakeStart[msg.sender] = stakeStart[msg.sender] + block.timestamp;
    etherBalanceOf[msg.sender] -= amount;
    if(staked[msg.sender] == false){
    staker.push(msg.sender);
    }
    isStake[msg.sender] = true; 
    staked[msg.sender] = true;
    StakeMethod[msg.sender] = 'Ether';
  }

  //khai báo một hàm dùng để đặt tiền cọc bằng tiền trực tiếp từ ví 
  function Coc() payable public {
    require(msg.value>=1e16, 'Error, stake must be >= 0.01 ETH');
    stakeBalanceOf[msg.sender] = stakeBalanceOf[msg.sender] + msg.value;
    stakeStart[msg.sender] = stakeStart[msg.sender] + block.timestamp;
    if(staked[msg.sender]  == false){
      staker.push(msg.sender);
    }
    isStake[msg.sender] = true; 
    staked[msg.sender] = true;
    StakeMethod[msg.sender] = 'Ether';
  }
  // khai báo một hàm dùng để đặt cọc bằng token
  function CocWithToken(uint amount) payable public {
    require(TokenBalanceOf[msg.sender] >=  amount,"ban khong co du token de cho muon");
    token.transferFrom(msg.sender, address(this), amount);
    stakeBalanceOf[msg.sender] = stakeBalanceOf[msg.sender] + amount;
    stakeStart[msg.sender] = stakeStart[msg.sender] + block.timestamp;
    TokenBalanceOf[msg.sender] -= amount;
    if(staked[msg.sender]  == false){
      staker.push(msg.sender);
    }
    isStake[msg.sender] = true;
    staked[msg.sender]  = true;
    StakeMethod[msg.sender] = 'Token';
  }

  // khai báo hàm với để có thể trả lại tiền cọc cho sinh viên
  function withState(address payable receiver)  public {
    require(isStake[receiver] == true, "Ban khoong co tien dat coc");
    uint userBalance = stakeBalanceOf[receiver]; //for event
    uint TokenMint = 10 * 10**18;
    uint time = block.timestamp - stakeStart[receiver];
    if(time > 30){
      userBalance -= userBalance / 2;
      TokenMint = 5 * 10 ** 18;
      payable(msg.sender).transfer(userBalance);
    }
    token.mint(receiver, TokenMint);
    receiver.transfer(userBalance); //eth back to user
    stakeBalanceOf[receiver] = 0;// tiền gửi bằng 0
    stakeStart[receiver] = 0;
    TokenBalanceOf[receiver] += TokenMint;
    isStake[receiver] = false;// trạng thái gửi tiền 0
  }
  // khai báo hàm với để có thể trả lại tiền cọc cho sinh viên
  function withStateToken(address payable receiver)  public {
    require(isStake[receiver] == true, "Ban khoong co tien dat coc");
    uint TokenMint = 10 * 10**18;
    uint time = block.timestamp - stakeStart[receiver];
    if(time > 10){
      TokenMint = 5 * 10 ** 18;
    }
    token.mint(receiver, TokenMint);
    stakeBalanceOf[receiver] = 0;// tiền gửi bằng 0
    TokenBalanceOf[receiver] += TokenMint;
    stakeStart[receiver] = 0;
    isStake[receiver] = false;// trạng thái gửi tiền 0
    }

  // khai báo hàm để có thể cho phép sinh viên chuyển token của mình cho sinh viên khác
  function lendToken(address payable receiver, uint interested) payable public {
    require(TokenBalanceOf[msg.sender] >= msg.value,"ban khong co du token de cho muon");
    token.transferFrom(msg.sender, receiver, msg.value);
    TokenBalanceOf[msg.sender] -= msg.value;
    TokenBalanceOf[receiver] += msg.value;
    if(lendedToken[receiver][msg.sender] == false){
      lender[receiver].push(msg.sender);
      borrowMethod[receiver].push('Token'); 
    }
    TokenBorrowBalanceOf[receiver][msg.sender] += msg.value;
    interest[msg.sender][receiver] += interested;
    lendedToken[receiver][msg.sender] = true;
  }

  // khai báo hàm để có thể cho phép sinh viên chuyển ether từ tài khoản trong ngân hàng của mình cho sinh viên khác
  function lendEther(address payable receiver, uint256 amount, uint interested) payable public{
    require(etherBalanceOf[msg.sender] >= amount,"khong du tien");
    etherBalanceOf[msg.sender] -= amount;
    borrowBalanceOf[receiver][msg.sender] += amount;
    interest[receiver][msg.sender] += interested;
    if(lendedEther[receiver][msg.sender] == false){
      lender[receiver].push(msg.sender);
      borrowMethod[receiver].push('Ether');
    }
    lendedEther[receiver][msg.sender] = true; 
    receiver.transfer(amount);
  }

  // khai báo hàm để có thể cho phép sinh viên chuyển ether từ ví của mình cho sinh viên khác
  function lendEtherDerectly(address payable receiver, uint interested) payable public{
    borrowBalanceOf[receiver][msg.sender] += msg.value;
    interest[receiver][msg.sender] += interested;
    if(lendedEther[receiver][msg.sender] == false){
      lender[receiver].push(msg.sender);
      borrowMethod[receiver].push('Ether'); 
    }
    lendedEther[receiver][msg.sender] = true;
    receiver.transfer(msg.value);
  }
  // khai báo hàm cho phép sinh viên tra lại tiền ether đã mượn 
  function payOffEther(address payable receiver, uint amount) payable public{
    PayOffAmount =  borrowBalanceOf[msg.sender][receiver] + (interest[msg.sender][receiver] * borrowBalanceOf[msg.sender][receiver])/100;
    require(amount == PayOffAmount,"Ban phai tra du tien");
    interest[receiver][msg.sender] = 0;
    borrowBalanceOf[msg.sender][receiver] = 0;
    receiver.transfer(PayOffAmount);
  }

  // khai báo hàm cho phép sinh viên tra lại tiền Token đã cho mượn 
  function payOffToken(address payable receiver) payable public{
    PayOffAmount =  TokenBorrowBalanceOf[msg.sender][receiver] + (interest[msg.sender][receiver] * TokenBorrowBalanceOf[msg.sender][receiver])/100;
    interest[receiver][msg.sender] = 0;
    borrowBalanceOf[msg.sender][receiver] = 0;
    token.transferFrom(msg.sender, receiver, PayOffAmount);
  }
  // hàm dùng để lấy giá trị tiền đã gửi trong ngân hàng
  function getBalance(address sender) view public returns (uint){
    return etherBalanceOf[sender];
  }
  // hàm dùng để lấy số token hiện có trong ngân hàng
  function getToken(address sender) view public returns (uint){
    return TokenBalanceOf[sender];
  }
  // hàm dùng để lấy số tiền đã đặt cọc trong ngân hàng
  function getStake(address sender) view public returns (uint){
    return stakeBalanceOf[sender];
  }

  // hàm dùng để lấy số lượng người đã đặt cọc trong ngân hàng
  function getAmountStaker() public view returns (uint){
    return staker.length;
  }
  // hàm dùng để lấy địa chỉ người đã đặt cọc
  function getStaker(uint index) public view returns (address){
    return staker[index];
  }
  // hàm dùng để lấy giá trị tiền đặt cọc của người đặt cọc từ phía admin
  function getStakeBalanceOf(address receiver) public view returns (uint ){
    return stakeBalanceOf[receiver];
  }
  // lấy phương thức đặt cọc
  function getStakeMethod(address receiver) public view returns(string memory){
    return StakeMethod[receiver];
  }

  // lấy số lượng người đã cho mượn tiền 
  function getLenderAmount() public view returns(uint){
    return lender[msg.sender].length;
  }
  // lấy địa chỉ ví của người đã cho mượn tiền 
  function getLender(uint index) public view returns(address){
    return lender[msg.sender][index];
  }
  // lấy số tiền đã mượn của người cho mượn
  function getBorrowBalanceOf(address receiver) public view returns (uint){
    return borrowBalanceOf[msg.sender][receiver];}
  // lấy số token đã mượn
  function getTokenBorrow(address receiver) public view returns (uint){
    return TokenBorrowBalanceOf[msg.sender][receiver];}
  // Lấy phương pháp mượn
  function getBorrowMethod(uint index) public view returns(string memory){
    return borrowMethod[msg.sender][index]; 
  }
  // trả nợ bằng ether
  function getPayOffAmountEther(address receiver) public view returns (uint ){
    return borrowBalanceOf[msg.sender][receiver] + (interest[msg.sender][receiver] * borrowBalanceOf[msg.sender][receiver])/100;
  }
  // trả nợ bằng token
  function getPayOffAmountToken(address receiver) public view returns (uint ){
    return TokenBorrowBalanceOf[msg.sender][receiver] + (interest[msg.sender][receiver] * TokenBorrowBalanceOf[msg.sender][receiver])/100;
  }
  }
