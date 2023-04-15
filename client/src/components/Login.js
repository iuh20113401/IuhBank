import React, {Component, useState} from "react";
import {
    BrowserRouter,
    Route,
    Link,
    Navigate 
}from "react-router-dom";
import dbank from '../iuh.png';
import Token from '../abis/Token.json';
import dBank from '../abis/dBank.json';
import Web3 from 'web3';
let role =JSON.parse(localStorage.getItem('role'))|| ('');  
export default class Connect extends Component{
  async componentDidMount(dispatch) {
  if(typeof window.ethereum !== 'undefined'){
    const web3 = new Web3(window.ethereum)
    await window.ethereum.enable();
    const netId = await web3.eth.net.getId()
    const accounts = await web3.eth.getAccounts()
    if(typeof accounts[0] !== 'undefined'){
      const balance = await web3.eth.getBalance(accounts[0])
      this.setState({account: accounts[0], balance: balance, web3: web3})
    } else {
      window.alert('Please login with MetaMask')
    }
    const token = new web3.eth.Contract(Token.abi, Token.networks[netId].address)
    const dbank = new web3.eth.Contract(dBank.abi, dBank.networks[netId].address)
    const dBankAddress = dBank.networks[netId].address
    this.setState({token: token, dbank: dbank, dBankAddress: dBankAddress})
    this.state.connect = true;
  }else {
    window.alert('Please install MetaMask')
  }}
  constructor(props) {
    super(props)
    this.state = {
      web3: 'undefined',
      account: '',
      token: null,
      dbank: null,
      balance: 0,
      dBankAddress: null,
      connect: false
    }}
  login = (e) => {
    e.preventDefault();
    let account = this.state.account;
    return fetch('https://iuh-bank-server.onrender.com/login', {
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
      localStorage.setItem("role",data);
      window.location.reload();
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}; 
    render(){
      if(role === 1) {
        return (<Navigate to ='/user'/>)};
      if(role === 2) {
          return (<Navigate to ='/admin'/>)}
      return (
          <div>
            <nav className="navbar navbar-primary fixed-top bg-primary flex-md-nowrap p-0 ">
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
              <h4>Tài khoản của bạn là</h4>
              <input
                type='text'
                className="form-control form-control-md"
                placeholder= {this.state.account}
                disabled
              />
              <br></br>
              <button type="button" className="btn-primary btn" onClick={this.login}>Login</button>
            </div>
          </div>
        )
    }
}
