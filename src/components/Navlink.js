//@flow

import React from "react";
import styled from "styled-components";

const StyledHeaderNav = styled.nav`
  background: green;
  position: sticky;
  background-color: #075e54;
  top: 0;
  z-index: 1;
  font-size: 0.9em;
  font-weight: 600;
  height: 45px;
  display: flex;
  letter-spacing: 0.4px;
  justify-content: space-between;
  color: white;
  text-transform: uppercase;
  box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.3);
  a {
    flex-grow: 2
    padding-top: 15px;
  }
  a:first-child {
    flex-grow: 1
    padding-top: 10px;
  }
`;

const StyledNavItem = styled.a`
  text-align: center;
  transition: background-color 1.5s;
  padding: 20px;
  color: ${props => (props.viewState === props.current ? "white" : "#83afaa")};
  border-bottom: ${props =>
    props.viewState === props.current ? "3px solid white" : "none"};
  &:active {
    background-color: lightgray;
    transition: background-color 1.5s;
    border-bottom: 3px solid white;
  }
  svg {
    fill: ${props => (props.viewState === props.current ? "white" : "#83afaa")};
  }
`;

type Props = {
  changeViewState: Function,
  viewState: string
};

const Navlink = ({ changeViewState, viewState }: Props) => {
  return (
    <StyledHeaderNav>
      <StyledNavItem
        data-nav="General"
        onClick={changeViewState}
        viewState={viewState}
        current="General"
      >
       General
      </StyledNavItem>
      <StyledNavItem
        data-nav="Products"
        onClick={changeViewState}
        viewState={viewState}
        current="Products"
      >
        Products
      </StyledNavItem>
      <StyledNavItem
        data-nav="Pricing"
        onClick={changeViewState}
        viewState={viewState}
        current="Pricing"
      >
       Pricing
      </StyledNavItem>
      <StyledNavItem
        data-nav="Contact"
        onClick={changeViewState}
        viewState={viewState}
        current="Contact"
      >
      Contact
      </StyledNavItem>
    </StyledHeaderNav>
  );
};

export default Navlink;
