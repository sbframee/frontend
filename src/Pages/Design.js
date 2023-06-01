import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";

import Header from "../components/Header";
import ChatScreenFooter from "../components/ChatScreenFooter";
import Navlink from "../components/Navlink";
import UpdatePopup from "../components/updatePopup";

const Design = () => {
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
        const cases = response.data.result;

        // Fetch customer details for each case
        const casesWithCustomerData = await Promise.all(
          cases.map(async (caseItem) => {
            try {
              const customerResponse = await axios.get(`/customers/getCustomerDetails/${caseItem.customer_uuid}`);
              const customerData = customerResponse.data.result;
              return {
                ...caseItem,
                customer_name: customerData.customer_name,
                mobile: customerData.mobile
              };
            } catch (error) {
              console.error(error);
              return caseItem; // Return case item without customer details on error
            }
          })
        );

        setItems(casesWithCustomerData);
      }
    } catch (error) {
      console.error(error);
    }
  };


  useEffect(() => {
    getCaseData();
  }, []);

  const itemsDetails = useMemo(() => items?.filter((item) => item?.case_type === "Designing"), [items]);

  const handleUpdateClick = (order) => {
    setSelectedOrder(order);
    setSelectedOrderId(order?.order_id);
    setUpdateForm(true);
  };

  const handleClosePopup = () => {
    setUpdateForm(false);
  };

  const handleSaveUpdate = (updatedData) => {
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
        <br />
        <div>
          <table
            className="user-table"
            style={{
              maxWidth: "100vw",
              height: "fit-content",
              overflowX: "scroll",
            }}
          >
            <tbody className="tbody">
              {itemsDetails?.map((item, i, array) => (
                <tr key={Math.random()} style={{ height: "30px" }}>
                  <td>{item?.order_id || ""}</td>
                  <td>{item?.customer_name || ""}</td>
                  <td>{item?.mobile || ""}</td>
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

export default Design;
