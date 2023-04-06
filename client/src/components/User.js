import { Tabs, Tab } from 'react-bootstrap'
import dBank from '../abis/dBank.json'
import React, { Component,useState } from 'react';
import Token from '../abis/Token.json'
import dbank from '../iuh.png';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Web3 from 'web3';
import {userAccount} from './account';
import {
    BrowserRouter as Router,
    Navigate 
}from "react-router-dom"
let amount = JSON.parse(localStorage.getItem('amount')) || [0];
let modal = localStorage.getItem('modal') || ('');
let lender = [{account: '', value: 0, method: '', payOffAmount: 0}];
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
    console.log(userAccount)
    if(userAccount == 1){
      return(
        <User socket = {this.props.socket} />)}
    return <Navigate to="/" />
  }
}
class User extends Component{
  async loadBlockchainData(dispatch) {
    if(typeof window.ethereum !== 'undefined'){
      const web3 = new Web3(window.ethereum)
      const netId = await web3.eth.net.getId()
      const accounts = await web3.eth.getAccounts()
        const balance = await web3.eth.getBalance(accounts[0])
        this.setState({account: accounts[0], balance: balance, web3: web3})
        const token = new web3.eth.Contract(Token.abi, Token.networks[netId].address)
        const dbank = new web3.eth.Contract(dBank.abi, dBank.networks[netId].address)
        const dBankAddress = dBank.networks[netId].address
        this.setState({token: token, dbank: dbank, dBankAddress: dBankAddress})

        await this.getInfo(); // Sử dụng await để đợi cho hàm getInfo hoàn thành
        this.setState({ connect: true }); // Sau đó mới gán giá trị true cho biến connect
          
    }
  }
  async getInfo(){
    this.state.bankBanlace = await this.state.dbank.methods.getBalance(this.state.account).call({from:this.state.account})/ (10**18);
    this.state.TokenBalance = await this.state.dbank.methods.getToken(this.state.account).call({from:this.state.account})/ (10**18);
    this.state.stake = await this.state.dbank.methods.getStake(this.state.account).call({from:this.state.account}) / (10**18);

    let lenderAmount = await this.state.dbank.methods.
    getLenderAmount().call({from: this.state.account});
    for (let index = 0; index < lenderAmount ; index++) {
    lender[index]={account: await this.state.dbank.methods.getLender(index).call({from:this.state.account})};
    lender[index].method = await this.state.dbank.methods.getBorrowMethod(index).call({from: this.state.account});
    lender[index].value = lender[index].method  === "Ether" ? await this.state.dbank.methods.getBorrowBalanceOf(lender[index].account).call({from:this.state.account}) : 
    await this.state.dbank.methods.getTokenBorrow(lender[index].account).call({from:this.state.account});
    lender[index].payOffAmount = lender[index].method == "Ether" ? 
    await this.state.dbank.methods.getPayOffAmountEther(lender[index].account).call({from: this.state.account}) :
    await this.state.dbank.methods.getPayOffAmountToken(lender[index].account).call({from: this.state.account})
    }
  }
  async sendAddress(){
    this.props.socket.emit('join',this.state.account);
    localStorage.setItem('modal',"Send request successfully");
    window.location.reload()
  }
  handleRequest = (e) => {
  e.preventDefault();
  let account = this.state.account;
  return fetch('http://localhost:3000/request', {
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
      localStorage.setItem('modal',"You have a request to stake");
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
      fetch('http://localhost:3000/method', {
          method: 'POST',
          headers: {
          'Content-Type': 'application/json',
          },
          body: JSON.stringify({account: this.state.account, method: 'ether'}),
          })
      localStorage.setItem('amount',0);
      localStorage.setItem('modal',"You stake successfully");
      window.location.reload();
      } catch (e) {
        localStorage.setItem('modal',"You stake fail");
        window.location.reload()
      }
    }
  }
  async withdraw(e) {
    e.preventDefault()
    if(this.state.dbank!=='undefined'){
      try{
        await this.state.dbank.methods.withdraw().send({from: this.state.account})
        localStorage.setItem('modal',"You withdraw successfully");
        window.location.reload()
      } catch(e) {
        localStorage.setItem('modal',"You withdraw fail");
        window.location.reload()
      }
    }
  }
  async CocWithDeposit(amount){
    if(this.state.dbank!=='undefined'){
      try{
        amount = amount * 10**18
        await this.state.dbank.methods.CocWithEtherDeposit(amount.toString()).send({from:this.state.account});
        fetch('http://localhost:3000/method', {
          method: 'POST',
          headers: {
          'Content-Type': 'application/json',
          },
          body: JSON.stringify({account: this.state.account, method: 'ether'}),
          })
          localStorage.setItem('modal',"You stake successfully");
        window.location.reload();
        } catch (e) {
        localStorage.setItem('modal',"You stake fail");
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
        fetch('http://localhost:3000/method', {
          method: 'POST',
          headers: {
          'Content-Type': 'application/json',
          },
          body: JSON.stringify({account: this.state.account, method: 'Token'}),
          })
        localStorage.setItem('modal',"You stake successfully");
        window.location.reload();
        } catch (e) {
        localStorage.setItem('modal',"You stake fail");
        window.location.reload()
      }
    }
  }
  async deposit(amount) {
    if(this.state.dbank!=='undefined'){
      try{
        await this.state.dbank.methods.deposit().send({value: amount.toString(), from: this.state.account});
        localStorage.setItem('modal',"You deposit successfully");
        window.location.reload()
      } catch (e) {
        localStorage.setItem('modal',"You deposit fail");
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
        localStorage.setItem('modal',"You lend successfully");
        window.location.reload();
        } catch (e) {
        // báo lỗi nếu việc lấy giá trị bị lỗi
        localStorage.setItem('modal',"You lend fail");
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
        localStorage.setItem('modal',"You lend successfully");
        window.location.reload();
      } catch (e) {
        localStorage.setItem('modal',"You lend fail");
        window.location.reload()
      }
    }
  }
  async lendDerectly(address,amountSend,interest) {
    if(this.state.dbank!=='undefined'){
      try{
        amountSend *= 10**18
        await this.state.dbank.methods.lendEtherDerectly(address,interest).send({value: amountSend.toString(),from: this.state.account});
        localStorage.setItem('modal',"You lend successfully");
        window.location.reload();
      } catch (e) {
        localStorage.setItem('modal',"You lend fail");
        window.location.reload()
      }
    }
  }
  async payOffEther(address,amount) {
    if(this.state.dbank!=='undefined'){
      try{
        await this.state.dbank.methods.payOffEther(address,amount).send({value: amount, from: this.state.account});
        localStorage.setItem('modal',"You PayOFf successfully");
        window.location.reload();
      } catch (e) {
        localStorage.setItem('modal',"You PayOff fail");
        window.location.reload()

      }
    }
  }
  async payOffToken(address,amount){
    if(this.state.dbank!=='undefined'){
      try{
        await this.state.token.methods.approve(this.state.dBankAddress,amount).send({from: this.state.account})
        await this.state.dbank.methods.payOffToken(address).send({ from:this.state.account});
        localStorage.setItem('modal',"You PayOFf successfully");
        window.location.reload();
        } catch (e) {
        localStorage.setItem('modal',"You PayOff fail");
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
                <h1>Welcome to d₿ank</h1>
                <h4>Your accoutn have : Ether: {this.state.bankBanlace}, Token: {this.state.TokenBalance},  Stake: {this.state.stake} </h4>
                <br></br>
                <div className="row">
                  <main role="main" className="col-lg-12 d-flex text-center">
                    <div className="content mr-auto ml-auto">
                      <Tabs defaultActiveKey="profile" id="uncontrolled-tab-example">
                        <Tab eventKey="send" title = "Send">
                          <div>
                            <form>
                            {(amount == 0) && 
                              <div>
                                <br></br>
                                <button type='button'  onClick={this.sendAddress.bind(this)}className='btn btn-primary'>Send Address</button><br></br>
                                <br></br>
                                <button type='submit' onClick={this.handleRequest.bind(this)}className='btn btn-primary'>Refresh</button>
                              </div>
                            }
                            {(amount != 0) && 
                                <div>
                                  <br></br>
                                  <p>Do you want to deposit?</p>
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
                                    <button type="submit" className='btn btn-primary'>DEPOSIT</button>{" "}
                                    <button type="submit" className='btn btn-primary' onClick={(e) => {
                                      e.preventDefault()
                                      amount = amount;
                                    this.CocWithDeposit(amount);}} >Deposit with deposit</button><br/>
                                    <button type="submit" className='mt-2 btn btn-primary' onClick={(e) => {
                                      e.preventDefault()
                                      amount = amount;
                                    this.CocWithToken(amount);}} >Deposit with Token</button>
                                  </form>
                                </div>}
                            </form>
                          </div>
                        </Tab>
                        <Tab eventKey="lend" title="lend">
                          <div>
                            <br></br>
                            How much do you want to deposit?
                            <br></br>
                            (min. amount is 0.01 ETH)
                            <br></br>
                            (1 deposit is possible at the time)
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
                                    placeholder='adress...'
                                    required />
                                  <br></br>
                                  <input
                                    id='amountSend'
                                    type='number'
                                    ref={(input) => { this.amountSend = input }}
                                    className="form-control form-control-md"
                                    placeholder='amount to lend...'
                                    required />
                                  <br></br>
                                  <input
                                    id='interest'
                                    type='number'
                                    ref={(input) => { this.interest = input }}
                                    className="form-control form-control-md"
                                    placeholder='interest to lend...'
                                    required />
                              </div>
                              <button type='button' className='m-3 mt-0 btn btn-primary' onClick={(e) => {
                                e.preventDefault()
                                let amountsend = this.amountSend.value
                                let interest = this.interest.value
                                let address = this.address.value
                                this.lendToken(address,amountsend,interest);
                              }}>lendToken</button>
                              <button type='button'  className='btn btn-primary m-3 mt-0' onClick={(e) => {
                                e.preventDefault()
                                let amountsend = this.amountSend.value
                                let interest = this.interest.value
                                let address = this.address.value
                                this.lendDerectly(address,amountsend,interest);
                              }}>lendDerectly</button>

                              <button type='button' className='btn btn-primary m-3 mt-0' onClick={(e) => {
                                e.preventDefault()
                                let amountsend = this.amountSend.value
                                let interest = this.interest.value
                                let address = this.address.value
                                this.lend(address,amountsend,interest);
                              }}>lend</button>
                            </form>
                          </div>
                        </Tab>
                        <Tab eventKey="deposit" title="Deposit">
                        <div>
                          <br></br>
                          How much do you want to deposit?
                          <br></br>
                          (min. amount is 0.01 ETH)
                          <br></br>
                          (1 deposit is possible at the time)
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
                                placeholder='amount...'
                                required />
                            </div>
                            <button type='submit' className='btn btn-primary'>DEPOSIT</button>
                          </form>
                        </div>
                        </Tab>
                        <Tab eventKey="withdraw" title="Withdraw">
                          <br></br>
                          Do you want to withdraw + take interest?
                          <br></br>
                          <br></br>
                          <div>
                            {/* tương tự như trên khi người dùng nhấn nút withdraw sẽ thực hiện hàm withdraw */}
                            <button type='submit' className='btn btn-primary' onClick={(e) => this.withdraw(e)}>WITHDRAW</button>
                          </div>
                        </Tab>
                        <Tab eventKey="Payoff" title="Pay off">
                          {lender != [] && lender.map(lendercon  => lendercon.value != 0 &&
                            <div>
                              <form >
                                {/* tạo form cho người dùng nhạp số lượng */}
                                <div className='form-group mr-sm-2'>
                                  <br></br>
                                  <input
                                    type='text'
                                    className="form-control form-control-md"
                                    placeholder= {lendercon.account} 
                                    disabled/>
                                  <br></br>
                                  <input
                                    type='number'
                                    className="form-control form-control-md"
                                    placeholder= {lendercon.value}
                                    disabled
                                    />
                                  <br></br>
                                  <input
                                    type='text'
                                    className="form-control form-control-md"
                                    placeholder= {lendercon.method}
                                    disabled/>
                                  <br></br>
                                  <input
                                    type='text'
                                    className="form-control form-control-md"
                                    placeholder= {lendercon.payOffAmount} 
                                    disabled/>
                                </div>
                                <button type='button' className='m-3 mt-0 btn btn-primary' onClick={(e) => {
                                  e.preventDefault()
                                  this.payOffToken(lendercon.account, lendercon.payOffAmount);
                                }}>Pay off by Token</button>
                                <button type='button' className='btn btn-primary m-3 mt-0' onClick={(e) => {
                                  e.preventDefault()
                                  this.payOffEther(lendercon.account, lendercon.payOffAmount);
                                }}>Pay off by Ether</button>
                              </form>
                            </div>)}
                        </Tab>
                      </Tabs>
                    </div>
                  </main>
                </div>
              </div>
            </div>}
        </div>
      </div>
    );
  }
}