//@flow

import React, { Component } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import './style.css';

const StyledChatScreenFooter = styled.footer`
  background: #ece5dd;
  position: fixed;
  bottom: 0;
  height: 50px;
  width: 100%;
  max-width: 450px;
  padding: 5px;
`;

const StyledForm = styled.form`
  display: flex;
  justify-content: flex-start;
  
  .input-addon {
    height: 40px;
    text-align: center;
    width: 100%;
  
  }

  input {
    flex: 1 1 auto;
    min-width: 0;
    appearance:none
    height: 40px;
    border: 0px;
    background-color: #fff;
    font-size: 1em;
  }
`;


type Props = {
  addMessage: Function
};

type State = {
  formValue: string
};

class ChatScreenFooter extends Component<Props, State> {
  state = {
    formValue: ""
  };

  handleChange = (event: SyntheticInputEvent<HTMLInputElement>) => {
    this.setState({ formValue: event.target.value });
  };

  handleSubmit = (event: Event) => {
    event.preventDefault();
    this.props.addMessage(this.state.formValue);
    this.setState({ formValue: "" });
  };

  addEmoji = () => {
    this.setState({ formValue: "😎" });
  };

  render() {
    return (
      <StyledChatScreenFooter>
        <StyledForm onSubmit={this.handleSubmit}>
          <span className="input-addon" >
            <Link to='/admin/cases' style={{ textDecoration: 'none', color: 'black' }}>All Cases</Link>
          </span>
          <span className="input-addon">
            <Link to='/admin/upcomingEmiM' style={{ textDecoration: 'none', color: 'black' }}>Upcoming EMI</Link>
          </span>
          <span className="input-addon">

          </span>
          <span className="golden-btn">
          <Link to='/admin/addCaseM' style={{ textDecoration: 'none',  color: 'rgb(120,50,5)' }} > <i className="fa fa-plus in-float"></i></Link>
          </span>
          <span className="input-addon">
            <Link to='/admin/allPaymentsM' style={{ textDecoration: 'none', color: 'black' }}>All Payments</Link>
          </span>
          <span className="input-addon">
            <Link to='/admin/allCustomersM' style={{ textDecoration: 'none', color: 'black' }}>All Customers</Link>
          </span>

        </StyledForm>
      </StyledChatScreenFooter>
    );
  }
}

export default ChatScreenFooter;
