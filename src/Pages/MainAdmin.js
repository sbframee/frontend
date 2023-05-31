import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";

import Header from "../components/Header";
import ChatScreenFooter from "../components/ChatScreenFooter";
import Navlink from "../components/Navlink";
import UpdatePopup from "../components/updatePopup";

const MainAdmin = () => {
  const [items, setItems] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [viewState, setViewState] = useState("2");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInputIsvisible, setSearchInputIsvisible] = useState(false);
  const [dropdownIsVisible, setDropdownIsVisible] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [updateForm, setUpdateForm] = useState(false);

  const showSearchInput = () => {
    setSearchInputIsvisible(true);
    setViewState("2");
  };

  const closeSearchInput = () => {
    setSearchInputIsvisible(false);
    setSearchTerm("");
  };

  const handleSearchtermChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const changeViewState = (event) => {
    const newState = event.target.dataset.nav;
    setViewState(newState);
  };

  const toggleDropdown = () => {
    setDropdownIsVisible((prevState) => !prevState.dropdownIsVisible);
  };

  const getCaseData = async () => {
    try {
      const response = await axios.get("/cases/GetCaseList");
      console.log(response);
      if (response.data.success) {
        setItems(response.data.result);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getCaseData();
  }, []);

  const itemsDetails = useMemo(() => items?.filter((a) => a?.order_id), [items]);

  const handleUpdateClick = (order) => {
    setSelectedOrder(order);
    setSelectedOrderId(order?.order_id);
    setUpdateForm(true);
  };

  const handleClosePopup = () => {
    setUpdateForm(false);
  };

  const handleSaveUpdate = (updatedData) => {
    // Handle saving the updated data here
    console.log("Updated Data:", updatedData);
    handleClosePopup();
  };

  return (
    <>
      <div className="right-side">
        <Header
          searchTerm={searchTerm}
          handleSearchtermChange={handleSearchtermChange}
          showSearchInput={showSearchInput}
          closeSearchInput={closeSearchInput}
          searchInputIsvisible={searchInputIsvisible}
          toggleDropdown={toggleDropdown}
          dropdownIsVisible={dropdownIsVisible}
        />
        <Navlink viewState={viewState} changeViewState={changeViewState} />

        <div>
          <table
            className="user-table"
            style={{
              maxWidth: "100vw",
              height: "fit-content",
              overflowX: "scroll",
            }}
          >
            <thead>
              <tr>
                <th style={{ width: "50px" }}>S.N</th>
                <th>Order ID</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody className="tbody">
              {itemsDetails?.map((item, i, array) => (
                <tr key={Math.random()} style={{ height: "30px" }}>
                  <td>{i + 1}</td>
                  <td>{item?.order_id || ""}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => handleUpdateClick(item)}
                      className="item-sales-search"
                      style={{
                        width: "fit-content",
                        top: 0,
                      }}
                    >
                      Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ChatScreenFooter />
      </div>
      {updateForm && (
        <UpdatePopup
          onSave={handleSaveUpdate}
          selectedOrder={selectedOrder}
          selectedOrderId={selectedOrderId}
          onClose={handleClosePopup}
        />
      )}
    </>
  );
};

export default MainAdmin;
