import React, { useState } from "react";
import styled from "styled-components";
import { Link } from 'react-router-dom';

import { useNavigate } from "react-router-dom";
import MessagePopup from "./MessagePopup";

const StyledDropdown = styled.div`
  font-size: 0.9em;
  background-color: White;
  position: absolute;
  box-shadow: 0px 3px 3px grey;
  transform: ${props => (props.visible ? "scale(1)" : "scale(0)")};
  
  transform-origin: top right;
  height: 60vh;
  width: 40%;
  z-index: 999;
  top: 10px;
  right: 10px;
  padding: 10px;
  }

  button {
    background: none;
    border: 0;
    padding: 2px;
    color: inherit;
    font: inherit;
    line-height: normal;
    overflow: visible;
    user-select: none;
    border: 1px solid grey;
    border-radius: 2px;
    &:hover {
      cursor: pointer;
    }
  }
`;

const Dropdown = ({ dropdownIsVisible, toggleDropdown }) => {
  const Navigate = useNavigate();
  const [logoutPopup, setLogoutPopup] = useState("");
  return (
    <StyledDropdown visible={dropdownIsVisible}>




      <i className="fa fa-close" onClick={toggleDropdown} style={{ cursor: 'pointer' }}></i>
      <Link to='/admin/cases' ><h4>All Cases</h4></Link>
      <Link to='/admin/upcomingEmi' ><h4>Upcoming Emi</h4></Link>
      <Link to='/admin/allPayments' ><h4>All Payments</h4></Link>
      <Link to='/admin/allCustomers' ><h4>All Customers</h4></Link>

      <div
        
        onClick={() => {
          setLogoutPopup(true);
        }}
      >
        Logout
      </div>

      {logoutPopup ? (
        <MessagePopup
          onClose={() => {
            localStorage.clear();
            sessionStorage.clear();
            Navigate("/login");
            window.location.reload();
          }}
          onSave={() => setLogoutPopup(false)}
          message="Confirm Logout"
          button1="Logout"
          button2="Cancel"
        />
      ) : (
        ""
      )}
    </StyledDropdown>

  );
};

export default Dropdown;
