import { Tabs, Tab } from 'react-bootstrap'
import dBank from '../abis/dBank.json'
import React, { Component,useState } from 'react';
import Token from '../abis/Token.json'
import dbank from '../dbank.png';
import Web3 from 'web3';
import {adminAccount} from './adminaccount';
import {BrowserRouter as Router, Navigate }from "react-router-dom"
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
let room = '';
let user = [];
let userStake =[];
let modal = localStorage.getItem('modal') || ('');
export default class Begin extends Component{
  render (){
    if(adminAccount === 2){
      return <Admin socket = {this.props.socket}/>
    }
    return <Navigate to="/" />}
}
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
        <Modal.Header closeButton>
          <Modal.Title>Modal heading</Modal.Title>
        </Modal.Header>
        <Modal.Body>{message}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={Reload}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </>)
}
class Admin extends Component{ 
  async loadBlockchainData(dispatch) {
    if(typeof window.ethereum !== 'undefined'){
      const web3 = new Web3(window.ethereum)
      const netId = await web3.eth.net.getId()
      const accounts = await web3.eth.getAccounts()
      const account =[];
      
      if(typeof accounts[0] !== 'undefined'){
        const balance = await web3.eth.getBalance(accounts[0])
        this.setState({account: accounts[0], balance: balance, web3: web3})
      } else {
        window.alert('Please login with MetaMask')
      }
      try {
        const token = new web3.eth.Contract(Token.abi, Token.networks[netId].address)
        const dbank = new web3.eth.Contract(dBank.abi, dBank.networks[netId].address)
        const dBankAddress = dBank.networks[netId].address
        this.setState({token: token, dbank: dbank, dBankAddress: dBankAddress})
        let StakeAmount = await this.state.dbank.methods.getAmountStaker().call({from:this.state.account});
        for (let index = 0; index < StakeAmount; index++) {
          this.state.staker[index]={account:await this.state.dbank.methods.getStaker(index).call({from:this.state.account}), value: 0}
        }
        for (let index = 0; index < this.state.staker.length; index++) {
          this.state.staker[index].value = await this.state.dbank.methods.getStakeBalanceOf(this.state.staker[index].account).call({from:this.state.account})}
        
        this.state.connect = true;
      } catch (e) {
            console.log('Error', e)
            window.alert('Contracts not deployed to the current network')
          }
    } else {
      window.alert('Please install MetaMask')
    }
  }
  
  async withstake(address) {
    if(this.state.dbank!=='undefined'){
      try{
        // dùng để lấy ether từ account đang liên kết vào tiền gửi
        await this.state.dbank.methods.withState(address).send({from: this.state.account})
        localStorage.setItem('modal',"WithStake successfully");
        window.location.reload()
      } catch (e) {
        // báo lỗi nếu việc lấy giá trị bị lỗi
        alert('ban khong co tien dat coc');
      }
    }
  }
  async withStateToken(address) {
    if(this.state.dbank!=='undefined'){
      try{
        // dùng để lấy ether từ account đang liên kết vào tiền gửi
        await this.state.dbank.methods.withStateToken(address).send({from: this.state.account})
        localStorage.setItem('modal',"With Stake successfully");
        window.location.reload()
      } catch (e) {
        // báo lỗi nếu việc lấy giá trị bị lỗi
        alert('ban khong co tien dat coc');
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
      staker: [],
      connect: false
    }
  }
  async ReceiveAddress(){
    this.props.socket.emit('admin','enter');
    this.props.socket.on('room', (message) => {
    console.log(message);
    user = message;
    console.log(user)
  })
  if(user != []){
    localStorage.setItem('modal',"You have a request");
  }
} 
  async Reload(){
    window.location.reload();
  }
  async SendRequest(amount,id){
    {this.props.socket.emit('userValue',{
    value : amount,
    id: id
    })};
    localStorage.setItem('modal',"You send successfully");
    window.location.reload();
  }

  render() {
    this.ReceiveAddress = this.ReceiveAddress.bind(this);
    return (<div>
      {modal !== '' && <ModalShow message = {modal} />}
      <div  className='text-monospace' >
        {this.state.connect == false && <div onLoad={this.loadBlockchainData(this.props.dispatch)}></div>}
        {this.state.connect == true && <div>
          <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow" onLoad={this.ReceiveAddress}>
            <a
              className="navbar-brand col-sm-3 col-md-2 mr-0"
              href="#"
              target="_blank"
              rel="noopener noreferrer"
            >
            <img src={dbank} className="App-logo" alt="logo" height="32"/>
              <b>d₿ank</b>
            </a>
          </nav>
          <div className="container-fluid mt-5 text-center">
            <br></br>
            <h1>Welcome to d₿ank</h1>
            <h2>{this.state.account}</h2>
            <br></br>
            <div className="row">
              <main role="main" className="col-lg-12 d-flex text-center">
                <div className="content mr-auto ml-auto">
                  <Tabs defaultActiveKey="profile" id="uncontrolled-tab-example">
                    <Tab eventKey='sendRequest' title ="Send Request">
                      <form >
                        {(user != []) && user.map(user => (
                          <div>
                            <div className='form-group mr-sm-2'>
                              <br></br>
                              <input 
                                type='text'
                                className="form-control form-control-md"
                                placeholder= {user.id}
                                disabled />
                              <br></br>
                              <input
                                id='ether'
                                type='number'
                                ref={(input) => { this.ether = input }}
                                className="form-control form-control-md"
                                placeholder='stake...'
                                required />
                            </div>
                            <button type='button' className='btn btn-primary' onClick={(e) =>{
                              let amount = this.ether.value
                              this.SendRequest(amount,user.id)
                            }} >Send</button></div>
                        ))}
                      <br></br>
                      <button type='button' onClick={this.Reload}  className='btn btn-primary' >Refresh</button>
                      </form>
                    </Tab>
                    {/* Chức năng withdraw */}
                    <Tab eventKey="withStake" title="WithStake">
                      {this.state.staker != [] && this.state.staker.map( staker => <div>
                        {(staker.value != 0) && 
                        <form>
                            <input
                              type='text'
                              value= {staker.account}
                              className="form-control form-control-md"
                              disabled/>
                            <br></br>
                            <input
                            type='number'
                            value= {staker.value}
                            className="form-control form-control-md"
                            disabled/>
                            <br></br>
                            <button type='button' className='btn btn-primary' onClick={(e) =>{
                              this.withstake(staker.account);}
                            }>Withstake</button>
                        </form>
                        }</div>)
                      }
                      <br></br>
                      <button type='button' className='btn btn-primary' onClick={this.Reload}>Refresh</button>
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


