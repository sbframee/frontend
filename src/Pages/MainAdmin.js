import React from "react";
import Header from "../components/Header";
import ChatScreenFooter from "../components/ChatScreenFooter";
import Navlink from "../components/Navlink";
import MobileHome from "../Pages/AddOrder/AddOrder";

type State = {
  viewState: string,
  chatScreenIsVisible: boolean,
  currentChatId: number,
  searchTerm: string,
  searchInputIsvisible: boolean,
  dropdownIsVisible: boolean
};

class MainAdminM extends React.Component<null, State> {
  state = {
    viewState: "2",
    chatScreenIsVisible: false,
    currentChatId: 0,
    searchTerm: "",
    searchInputIsvisible: false,
    dropdownIsVisible: false
  };

showSearchInput = () => {
    this.setState({ searchInputIsvisible: true, viewState: "2" });
  };

 closeSearchInput = () => {
    this.setState({ searchInputIsvisible: false, searchTerm: "" });
  };

 handleSearchtermChange = (event) => {
    this.setState({ searchTerm: event.target.value });
  };

 changeViewState = (event) => {
    const newState = event.target.dataset.nav;
    this.setState({ viewState: newState });
  };

 showChatScreen = (id) => {
    this.setState({ chatScreenIsVisible: true, currentChatId: id });
  };

 closeChatScreen = () => {
    this.setState({ chatScreenIsVisible: false, currentChatId: 0 });
  };

 toggleDropdown = () => {
    this.setState(prevState => {
      return { dropdownIsVisible: !prevState.dropdownIsVisible };
    });
  };

  render() {
  return (
    <>
      
      <div className="right-side">
      <Header searchTerm={this.state.searchTerm}
          handleSearchtermChange={this.handleSearchtermChange}
          showSearchInput={this.showSearchInput}
          closeSearchInput={this.closeSearchInput}
          searchInputIsvisible={this.state.searchInputIsvisible} 
          toggleDropdown={this.toggleDropdown}
          dropdownIsVisible={this.state.dropdownIsVisible} />   
           <Navlink
          viewState={this.state.viewState}
          changeViewState={this.changeViewState}
        />
        <MobileHome />
          <ChatScreenFooter />   
      </div>
    </>
  );
  };
};

export default MainAdminM;
