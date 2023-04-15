import dBank from '../abis/dBank.json'
import React, { Component,useState } from 'react';
import Token from '../abis/Token.json'
import dbank from '../iuh.png';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Web3 from 'web3';
import {userAccount} from "./account"
import { Tabs, Tab } from 'react-bootstrap'
import Col from 'react-bootstrap/Col'
import Nav from 'react-bootstrap/Nav'
import Row from 'react-bootstrap/Row'
import {Navigate}from "react-router-dom";
let amount = JSON.parse(localStorage.getItem('amount')) || [0];
let modal = localStorage.getItem('modal') || ('');
let lender = [];
let borrower =[];
function ModalShow(props){
  const [show, setShow] = useState(true);
  const handleClose = () => setShow(false);
  const Reload = () =>{
    setShow(false);
  }
  const message = props.message
  localStorage.removeItem("modal");
  return(
    <>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header>
          <Modal.Title className='m-auto'>{message}</Modal.Title>
        </Modal.Header>
        <Modal.Footer>
          <Button variant="primary" onClick={Reload}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>)
}
export default class Begin extends React.Component {
  render() {
       if(userAccount == 1){
        return(
        <User socket = {this.props.socket} />)
       }else{
        return(
        <Navigate to = '/' />)
       }}
}
class User extends Component{
  async loadBlockchainData(dispatch) {
    if(typeof window.ethereum !== 'undefined'){
      try{
      const web3 = new Web3(window.ethereum)
      const netId = await web3.eth.net.getId()
      const accounts = await web3.eth.getAccounts()
      const balance = await web3.eth.getBalance(accounts[0])
      this.setState({account: accounts[0], balance: balance, web3: web3})
      const token = new web3.eth.Contract(Token.abi, Token.networks[netId].address)
      const dbank = new web3.eth.Contract(dBank.abi, dBank.networks[netId].address)
      const dBankAddress = dBank.networks[netId].address
      this.setState({token: token, dbank: dbank, dBankAddress: dBankAddress})
      console.log(this.state);
      await this.getInfo();
      // Sử dụng await để đợi cho hàm getInfo hoàn thành
      this.setState({ connect: true }); // Sau đó mới gán giá trị true cho biến connect
      }catch (e) {
            console.log('Error', e)
            window.alert('Contracts not deployed to the current network')
           this.setState({ connect: true });
          }
          
    }else {
      window.alert('Please install MetaMask')
    }
  }
  async getInfo(){
    this.state.bankBanlace = await this.state.dbank.methods.getBalance(this.state.account).call({from:this.state.account})/ (10**18);
    this.state.TokenBalance = await this.state.dbank.methods.getToken(this.state.account).call({from:this.state.account})/ (10**18);
    this.state.stake = await this.state.dbank.methods.getStake(this.state.account).call({from:this.state.account}) / (10**18);

    let lenderAmount = await this.state.dbank.methods.getLenderAmount().call({from: this.state.account});
    for (let index = 0; index < lenderAmount ; index++) {
    lender[index]={account: await this.state.dbank.methods.getLender(index).call({from:this.state.account})};
    lender[index].method = await this.state.dbank.methods.getBorrowMethod(index).call({from: this.state.account});
    lender[index].value = lender[index].method  === "Ether" ? await this.state.dbank.methods.getBorrowBalanceOf(lender[index].account).call({from:this.state.account}) : 
    await this.state.dbank.methods.getTokenBorrow(lender[index].account).call({from:this.state.account});
    lender[index].payOffAmount = lender[index].method == "Ether" ? 
    await this.state.dbank.methods.getPayOffAmountEther(lender[index].account).call({from: this.state.account}) :
    await this.state.dbank.methods.getPayOffAmountToken(lender[index].account).call({from: this.state.account})
    }
    let borrowerAmount = await this.state.dbank.methods.getBorrowerAmount().call({from: this.state.account});
    for (let index = 0; index < borrowerAmount ; index++) {
    borrower[index]={account: await this.state.dbank.methods.getBorrower(index).call({from:this.state.account})};
    borrower[index].method = await this.state.dbank.methods.getLendMethod(index).call({from: this.state.account});
    borrower[index].value = borrower[index].method  === "Ether" ? await this.state.dbank.methods.getLendBalanceOf(borrower[index].account).call({from:this.state.account}) : 
    await this.state.dbank.methods.getTokenLend(borrower[index].account).call({from:this.state.account});
    borrower[index].payOffAmount = borrower[index].method == "Ether" ? 
    await this.state.dbank.methods.getLendPayOffAmountEther(borrower[index].account).call({from: this.state.account}) :
    await this.state.dbank.methods.getLendPayOffAmountToken(borrower  [index].account).call({from: this.state.account})
    }
  }
  async sendAddress(){
    this.props.socket.emit('join',this.state.account);
    localStorage.setItem('modal',"Gửi yêu cầu thành công");
    window.location.reload()
  }
  handleRequest = (e) => {
  e.preventDefault();
  let account = this.state.account;
  return fetch('https://iuh-bank-server-2.onrender.com/request', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({account: account}),
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error('Network response was not ok');
      }
      return res.json();
    })
    .then((data) => {
      localStorage.setItem('amount',data);
      localStorage.setItem('modal',"Bạn có một yêu cầu đặt cọc");
      window.location.reload();
    })
    .catch((error) => {
      window.location.reload();
    });
};
  async coc(amount) {
    if(this.state.dbank!=='undefined'){
      try{
      await this.state.dbank.methods.Coc().send({value: amount.toString(), from: this.state.account});
      fetch('https://iuh-bank-server-2.onrender.com/delete', {
          method: 'POST',
          headers: {
          'Content-Type': 'application/json',
          },
          body: JSON.stringify({account: this.state.account}),
          })
      localStorage.setItem('amount',0);
      localStorage.setItem('modal',"Bạn đặt cọc thành công");
      window.location.reload();
      } catch (e) {
        localStorage.setItem('modal',"Bạn đặt cọc không thành công");
        window.location.reload()
      }
    }
  }
  async withdraw(amount) {
    if(this.state.dbank !=='undefined'){
      try{
        await this.state.dbank.methods.withdraw().send({value: amount.toString(),from: this.state.account})
        localStorage.setItem('modal',"Bạn đã rút tiền thành công");
        window.location.reload()
      } catch(e) {
        localStorage.setItem('modal',"Bạn đã rút tiền thất bại");
        window.location.reload()
      }
    }
  }
  async CocWithDeposit(amount){
    if(this.state.dbank!=='undefined'){
      try{
        amount = amount * 10**18
        await this.state.dbank.methods.CocWithEtherDeposit(amount.toString()).send({from:this.state.account});
        fetch('https://iuh-bank-server-2.onrender.com/delete', {
          method: 'POST',
          headers: {
          'Content-Type': 'application/json',
          },
          body: JSON.stringify({account: this.state.account}),
          })
          localStorage.setItem('modal',"Bạn đã đặt cọc thành công");
        window.location.reload();
        } catch (e) {
        localStorage.setItem('modal',"Bạn đặt cọc không thành công");
        window.location.reload()
      }
    }
  }
  async CocWithToken(amount){
    if(this.state.dbank!=='undefined'){
      try{
        amount = amount * 10**18;
        await this.state.token.methods.approve(this.state.dBankAddress, amount.toString()).send({from: this.state.account})
        await this.state.dbank.methods.CocWithToken(amount.toString()).send({from:this.state.account});
        fetch('https://iuh-bank-server-2.onrender.com/delete', {
          method: 'POST',
          headers: {
          'Content-Type': 'application/json',
          },
          body: JSON.stringify({account: this.state.account}),
          })
        localStorage.setItem('modal',"Bạn đã dặt cọc thành công");
        window.location.reload();
        } catch (e) {
        localStorage.setItem('modal',"Bạn đặt cọc không thành công");
        window.location.reload()
      }
    }
  }
  async deposit(amount) {
    if(this.state.dbank!=='undefined'){
      try{
        await this.state.dbank.methods.deposit().send({value: amount.toString(), from: this.state.account});
        localStorage.setItem('modal',"Bạn đã gửi tiền vào ngân hàng thành công");
        window.location.reload()
      } catch (e) {
        localStorage.setItem('modal',"Bạn gửi tiền vào ngân hàng không thành công");
        window.location.reload();
      }
    }
  }
  async lendToken(address, amount, interest){
    if(this.state.dbank!=='undefined'){
      try{
        amount = amount * 10**18;
        await this.state.token.methods.approve(this.state.dBankAddress, amount.toString()).send({from: this.state.account})
        await this.state.dbank.methods.lendToken(address, interest).send({value: amount, from:this.state.account});
        localStorage.setItem('modal',"Bạn đã cho mượn thành công");
        window.location.reload();
        } catch (e) {
        // báo lỗi nếu việc lấy giá trị bị lỗi
        localStorage.setItem('modal',"Bạn cho mượn không thành công");
        window.location.reload()
      }
    }
  }
  async lend(address,amountSend,interest) {
    if(this.state.dbank!=='undefined'){
      try{
        amountSend *= 10**18
        // Sau đó trả lại cho người dùng tiền đã thế chấp
        await this.state.dbank.methods.lendEther(address,amountSend.toString(),interest).send({from: this.state.account});
        localStorage.setItem('modal',"Bạn đã cho mượn thành công");
        window.location.reload();
      } catch (e) {
        localStorage.setItem('modal',"Bạn cho mượn không thành công");
        window.location.reload()
      }
    }
  }
  async lendDerectly(address,amountSend,interest) {
    if(this.state.dbank!=='undefined'){
      try{
        amountSend *= 10**18
        await this.state.dbank.methods.lendEtherDerectly(address,interest).send({value: amountSend.toString(),from: this.state.account});
        localStorage.setItem('modal',"Bạn đã cho mượn thành công");
        window.location.reload();
      } catch (e) {
        localStorage.setItem('modal',"Bạn cho mượn không thành công");
        window.location.reload()
      }
    }
  }
  async payOffEther(address,amount) {
    if(this.state.dbank!=='undefined'){
      try{
        await this.state.dbank.methods.payOffEther(address,amount).send({value: amount, from: this.state.account});
        localStorage.setItem('modal',"Bạn đã trả nợ thành công");
        window.location.reload();
      } catch (e) {
        localStorage.setItem('modal',"Bạn trả nợ không thành công");
        window.location.reload()

      }
    }
  }
  async payOffToken(address,amount){
    if(this.state.dbank!=='undefined'){
      try{
        await this.state.token.methods.approve(this.state.dBankAddress,amount).send({from: this.state.account})
        await this.state.dbank.methods.payOffToken(address).send({ from:this.state.account});
        localStorage.setItem('modal',"Bạn đã trả nợ thành công");
        window.location.reload();
        } catch (e) {
        localStorage.setItem('modal',"Bạn trả nợ không thành công");
        window.location.reload()
      }
    }
  }
  constructor(props) {
    super(props)
    this.state = {
      web3: 'undefined',
      account: '',
      token: null,
      dbank: null,
      balance: 0,
      dBankAddress: null,
      bankBanlace: 0,
      TokenBalance: 0,
      stake: 0,
      connect: false,
    }
  }
  async logout(){
    localStorage.setItem('role',0);
    window.location.reload()
  }

  // dùng để tạo giao diện website 
  render() {

    return (
      <div>
        {modal !== '' && <ModalShow message = {modal} />}
        <div className='text-monospace'>
          {this.state.connect === false && <div onLoad={this.loadBlockchainData(this.props.dispatch)}></div> }
          { this.state.connect === true && 
            <div>
              <nav className="navbar navbar-primary fixed-top bg-primary flex-md-nowrap p-0 shadow">
                <a
                  className="navbar-brand col-sm-3 col-md-2 mr-0"
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                >
              <img src={dbank} className="App-logo m-auto " alt="logo" height="32"/>
              <b className='text-dark'>IUHBANK</b>
                </a>
              </nav>
              <div className="container-fluid mt-5 text-center">
              <br></br>
                <h1>Welcome to IUHBANK</h1>
                <h4>Trong tài khoản bạn có : Ether gửi: {this.state.bankBanlace}, Token: {this.state.TokenBalance},  Tiền cọc: {this.state.stake} </h4>
                <h4>
                  <button type='submit' onClick={this.logout.bind(this)}className='btn btn-primary'>Đăng xuất</button>
                </h4>
                <br></br>
                  <main role="main" className="col-lg-12 d-flex text-center w-100">
                    <div className="content  mr-auto ml-auto w-100">
                       <Tab.Container id="left-tabs-example" defaultActiveKey="first">
                          <Row>
                            <Col xs={3}>
                              <Nav variant="pills" className=" text-left flex-column">
                                <Nav.Item>
                                  <Nav.Link eventKey="first">Cọc tiền</Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                  <Nav.Link eventKey="second">Cho mượn tiền</Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                  <Nav.Link eventKey="third">Gửi tiền vào ngân hàng</Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                  <Nav.Link eventKey="fourth">Rút tiền</Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                  <Nav.Link eventKey="fifth">Trả nợ</Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                  <Nav.Link eventKey="sixth">Danh sách đã cho mượn tiền</Nav.Link>
                                </Nav.Item>
                              </Nav>
                            </Col>
                            <Col xs={9}>
                              <Tab.Content>
                                <Tab.Pane eventKey="first">
                                 <div>
                                   <form>
                                        {(amount == 0) && 
                                          <div>
                                            <br></br>
                                            <button type='button'  onClick={this.sendAddress.bind(this)}className='btn btn-primary'>Gửi yêu cầu</button><br></br>
                                            <br></br>
                                            <button type='submit' onClick={this.handleRequest.bind(this)}className='btn btn-primary'>Refresh</button>
                                          </div>
                                        }
                                        {(amount != 0) && 
                                            <div>
                                              <br></br>
                                              <p>Bạn có muốn đặt cọc không?</p>
                                              <form onSubmit={(e) => {
                                                e.preventDefault()
                                                amount = amount * 10**18;
                                                this.coc(amount);
                                              }}>
                                              {/* tạo form cho người dùng nhạp số lượng */}
                                                <div className='form-group mr-sm-2'>
                                                  <br></br>
                                                  <input
                                                    type='number'
                                                    className="form-control form-control-md"
                                                    placeholder= {amount}
                                                    disabled />
                                                </div>
                                                <button type="submit" className='btn btn-primary'>Đặt cọc trưc tiếp</button>{" "}
                                                <button type="submit" className='btn btn-primary' onClick={(e) => {
                                                  e.preventDefault()
                                                  amount = amount;
                                                this.CocWithDeposit(amount);}} >Đặt cọc với tài khoản ngân hàng</button><br/>
                                                <button type="submit" className='mt-2 btn btn-primary' onClick={(e) => {
                                                  e.preventDefault()
                                                  amount = amount;
                                                this.CocWithToken(amount);}} >Đặt cọc với token</button>
                                              </form>
                                            </div>}
                                  </form>
                                 </div>
                                </Tab.Pane>
                                <Tab.Pane eventKey="second">
                                  <div>
                                      <br></br>
                                      Cho mượn tiền
                                      <br></br>
                                      <form >
                                        {/* tạo form cho người dùng nhạp số lượng */}
                                        <div className='form-group mr-sm-2'>
                                          <br></br>
                                            <input
                                              id='address'
                                              type='text'
                                              ref={(input) => { this.address = input }}
                                              className="form-control form-control-md"
                                              placeholder='Địa chỉ...'
                                              required />
                                            <br></br>
                                            <input
                                              id='amountSend'
                                              type='number'
                                              ref={(input) => { this.amountSend = input }}
                                              className="form-control form-control-md"
                                              placeholder='Số tiền muốn cho mượn...'
                                              required />
                                            <br></br>
                                            <input
                                              id='interest'
                                              type='number'
                                              ref={(input) => { this.interest = input }}
                                              className="form-control form-control-md"
                                              placeholder='Lãi suất...'
                                              required />
                                        </div>
                                        <button type='button' className='m-3 mt-0 btn btn-primary' onClick={(e) => {
                                          e.preventDefault()
                                          let amountsend = this.amountSend.value
                                          let interest = this.interest.value
                                          let address = this.address.value
                                          this.lendToken(address,amountsend,interest);
                                        }}>Token</button>
                                        <button type='button'  className='btn btn-primary m-3 mt-0' onClick={(e) => {
                                          e.preventDefault()
                                          let amountsend = this.amountSend.value
                                          let interest = this.interest.value
                                          let address = this.address.value
                                          this.lendDerectly(address,amountsend,interest);
                                        }}>Trực tiếp từ ví điện tử</button>

                                        <button type='button' className='btn btn-primary m-3 mt-0' onClick={(e) => {
                                          e.preventDefault()
                                          let amountsend = this.amountSend.value
                                          let interest = this.interest.value
                                          let address = this.address.value
                                          this.lend(address,amountsend,interest);
                                        }}>Tài khoản ngân hàng</button>
                                      </form>
                                  </div>
                                </Tab.Pane>
                                <Tab.Pane eventKey="third">
                                    <div>
                                      Bạn muốn gửi bao nhiêu?
                                      <br></br>
                                      {/* khi người dùng nhập vào số lượng và nhấn nút submit \ */}
                                      <form onSubmit={(e) => {
                                        e.preventDefault()
                                        let amount = this.depositAmount.value
                                        amount = amount * 10**18 //convert to wei
                                        this.deposit(amount);
                                      }}>
                                        <div className='form-group mr-sm-2'>
                                          <br></br>
                                          <input
                                            id='depositAmount'
                                            step="0.01"
                                            type='number'
                                            ref={(input) => { this.depositAmount = input }}
                                            className="form-control form-control-md"
                                            placeholder='Số lượng muốn gửi...'
                                            required />
                                        </div>
                                        <button type='submit' className='btn btn-primary'>Gửi</button>
                                      </form>
                                    </div>
                                </Tab.Pane>
                                <Tab.Pane eventKey='fourth'>
                                      <br></br>
                                      Bạn muốn rút bao nhiêu tiền?
                                      <br></br>
                                      <br></br>
                                      <form onSubmit={(e) => {
                                                e.preventDefault();
                                                let amount = this.withdrawAmount.value;
                                                amount = amount * 10 **18;
                                                this.withdraw(amount);
                                              }}>
                                              {/* tạo form cho người dùng nhạp số lượng */}
                                                <div className='form-group mr-sm-2'>
                                                  <br></br>
                                                  <input
                                                    id = 'withdrawAmount'
                                                    type='number'
                                                    className="form-control form-control-md"
                                                    placeholder= "Nhập số tiền muốn rút"
                                                    ref={(input) => { this.withdrawAmount = input }}
                                                    />
                                                </div>
                                                <button type="submit" className='btn btn-primary'>Rút tiền</button></form>
                                      <div>
                                      </div>
                                </Tab.Pane>
                                <Tab.Pane eventKey="fifth">
                                      {lender.length == 0 && <h3>Bạn không có nợ để trả.</h3>}
                                      {lender != [] && lender.map(lendercon  => lendercon.value != 0 &&
                                          <div>
                                            <form >
                                              {/* tạo form cho người dùng nhạp số lượng */}
                                              <div className='form-group mr-sm-2'>
                                                <br></br>
                                                <Row>
                                                  <Col xs={3} >
                                                    <label>
                                                      Địa chỉ người cho mượn
                                                    </label>
                                                  </Col>
                                                <Col xs={6}>
                                                  <input
                                                  type='text'
                                                  className="form-control form-control-md"
                                                  placeholder= {lendercon.account} 
                                                  disabled/>
                                                </Col>
                                                </Row>
                                                <br></br>
                                                <Row>
                                                  <Col xs={3} >
                                                    <label>
                                                      Số tiền đã mượn
                                                    </label>
                                                  </Col>
                                                <Col xs={6}>
                                                  <input
                                                  type='number'
                                                  className="form-control form-control-md"
                                                  placeholder= {lendercon.value / (10** 18)}
                                                  disabled
                                                  />
                                                </Col>
                                                </Row>
                                                <br></br>
                                                <Row>
                                                  <Col xs={3} >
                                                    <label>
                                                      Hình thức mượn
                                                    </label>
                                                  </Col>
                                                <Col xs={6}>
                                                  <input
                                                  type='text'
                                                  className="form-control form-control-md"
                                                  placeholder= {lendercon.method}
                                                  disabled/>
                                                </Col>
                                                </Row>
                                                <br></br>
                                                <Row>
                                                  <Col xs={3} >
                                                    <label>
                                                      Số tiền cần trả
                                                    </label>
                                                  </Col>
                                                <Col xs={6}>
                                                  <input
                                                  type='text'
                                                  className="form-control form-control-md"
                                                  placeholder= {lendercon.payOffAmount / (10 ** 18)} 
                                                  disabled/>
                                                </Col>
                                                </Row>
                                                
                                              </div>
                                              {lendercon.method == "Token" && <button type='button' className='m-3 mt-0 btn btn-primary' onClick={(e) => {
                                                e.preventDefault()
                                                this.payOffToken(lendercon.account, lendercon.payOffAmount);
                                              }}>Trả nợ</button>}
                                              {lendercon.method == 'Ether' && <button type='button' className='btn btn-primary m-3 mt-0' onClick={(e) => {
                                                e.preventDefault()
                                                this.payOffEther(lendercon.account, lendercon.payOffAmount);
                                              }}>Trả nợ</button>}
                                            </form>
                                          </div>)}
                                </Tab.Pane>
                                <Tab.Pane eventKey="sixth">
                                      {borrower.length == 0 && <h3>Bạn chưa có cho ai mượn tiền.</h3>}
                                      {borrower !==[] && borrower.map(borrowercon  => borrowercon.value != 0 &&
                                          <div>
                                            <form >
                                              {/* tạo form cho người dùng nhạp số lượng */}
                                              <div className='form-group mr-sm-2'>
                                                <br></br>
                                                <Row>
                                                  <Col xs={3} >
                                                    <label>
                                                      Địa chỉ người đã mượn
                                                    </label>
                                                  </Col>
                                                <Col xs={6}>
                                                  <input
                                                  type='text'
                                                  className="form-control form-control-md"
                                                  placeholder= { borrowercon.account} 
                                                  disabled/>
                                                </Col>
                                                </Row>
                                                <br></br>
                                                <Row>
                                                  <Col xs={3} >
                                                    <label>
                                                      Số tiền đã cho mượn
                                                    </label>
                                                  </Col>
                                                <Col xs={6}>
                                                  <input
                                                  type='number'
                                                  className="form-control form-control-md"
                                                  placeholder= {borrowercon.value / (10 **18)}
                                                  disabled
                                                  />
                                                </Col>
                                                </Row>
                                                <br></br>
                                                <Row>
                                                  <Col xs={3} >
                                                    <label>
                                                      Phương thức cho mượn
                                                    </label>
                                                  </Col>
                                                <Col xs={6}>
                                                  <input
                                                  type='text'
                                                  className="form-control form-control-md"
                                                  placeholder= {borrowercon.method}
                                                  disabled/>
                                                </Col>
                                                </Row>
                                                
                                                <br></br>
                                                <Row>
                                                  <Col xs={3} >
                                                    <label>
                                                      Số tiền người mượn cần trả
                                                    </label>
                                                  </Col>
                                                <Col xs={6}>
                                                  <input
                                                  type='text'
                                                  className="form-control form-control-md"
                                                  placeholder= {borrowercon.payOffAmount / (10 **18)} 
                                                  disabled/>
                                                </Col>
                                                </Row>
                                                
                                              </div>
                                            </form>
                                          </div>)}
                                </Tab.Pane>
                              </Tab.Content>
                            </Col>
                          </Row>
                      </Tab.Container>
                    </div>
                  </main>
                </div>
            </div>}
        </div>
      </div>
    );
  }
}
