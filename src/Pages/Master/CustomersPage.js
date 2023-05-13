import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/solid";
import axios from "axios";
import "./styles.css";
import AddCustomerPopup from "../../components/AddCustomerPopup";

const CustomerPage = () => {
  const [itemsData, setItemsData] = useState([]);
  const [filterItemsData, setFilterItemsData] = useState([]);
  const [popupForm, setPopupForm] = useState(false);
  const [filterTitle, setFilterTitle] = useState("");

  //   const getItemCategories = async () => {
  //     const response = await axios({
  //       method: "get",
  //       url: "/itemCategories/GetItemCategoryList",

  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //     });
  //     if (response.data.success) setItemCategories(response.data.result);
  //   };
  const getItemsData = async () => {
    const response = await axios({
      method: "get",
      url: "/customers/GetCustomersList",

      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log(response);
    if (response.data.success) setItemsData(response.data.result);
  };
  useEffect(() => {
    getItemsData();
  }, [popupForm]);
  useEffect(() => {
    setFilterItemsData(
      itemsData
      //   .filter((a) => a.user_title)
      //   .filter(
      //     (a) =>
      //       !filterTitle ||
      //       a.user_title
      //         .toLocaleLowerCase()
      //         .includes(filterTitle.toLocaleLowerCase())
      //   )
    );
  }, [itemsData, filterTitle]);
  //   const getCompanies = async () => {
  //     const response = await axios({
  //       method: "get",
  //       url: "/companies/getCompanies",

  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //     });
  //     if (response.data.success) setCompanies(response.data.result);
  //   };
  //   useEffect(() => {
  //     getCompanies();
  //     getItemCategories();
  //   }, []);
  return (
    <>
      <Sidebar />
      <Header />
      <div className="item-sales-container orders-report-container">
        <div id="heading">
          <h2>Customers</h2>
        </div>
        <div id="item-sales-top">
          <div
            id="date-input-container"
            style={{
              overflow: "visible",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <input
              type="text"
              onChange={(e) => setFilterTitle(e.target.value)}
              value={filterTitle}
              placeholder="Search Item Title..."
              className="searchInput"
            />

            <div>Total Items: {filterItemsData.length}</div>
            <button
              className="item-sales-search"
              onClick={() => setPopupForm(true)}
            >
              Add
            </button>
          </div>
        </div>
        <div className="table-container-user item-sales-container">
          <Table itemsDetails={filterItemsData} setPopupForm={setPopupForm} />
        </div>
      </div>
      {popupForm ? (
        <AddCustomerPopup
          onSave={(data, condition) => {
            if (condition) setItemsData((prev) => [...prev, data]);
            else
              setItemsData((prev) =>
                prev.map((i) => (i.user_uuid === data.user_uuid ? data : i))
              );
            setPopupForm(false);
          }}
          popupInfo={popupForm}
          name="Customer"
        />
      ) : (
        ""
      )}
    </>
  );
};

export default CustomerPage;
function Table({ itemsDetails, setPopupForm }) {
  const [items, setItems] = useState("sort_order");
  const [order, setOrder] = useState("");

  console.log(items);
  return (
    <table
      className="user-table"
      style={{ maxWidth: "100vw", height: "fit-content", overflowX: "scroll" }}
    >
      <thead>
        <tr>
          <th>S.N</th>

          <th colSpan={2}>
            <div className="t-head-element">
              <span>Firstname</span>
              <div className="sort-buttons-container">
                <button
                  onClick={() => {
                    setItems("customer_firstname");
                    setOrder("asc");
                  }}
                >
                  <ChevronUpIcon className="sort-up sort-button" />
                </button>
                <button
                  onClick={() => {
                    setItems("customer_firstname");
                    setOrder("desc");
                  }}
                >
                  <ChevronDownIcon className="sort-down sort-button" />
                </button>
              </div>
            </div>
          </th>
          <th colSpan={2}>
            <div className="t-head-element">
              <span>Middlename</span>
              <div className="sort-buttons-container">
                <button
                  onClick={() => {
                    setItems("customer_middlename");
                    setOrder("asc");
                  }}
                >
                  <ChevronUpIcon className="sort-up sort-button" />
                </button>
                <button
                  onClick={() => {
                    setItems("customer_middlename");
                    setOrder("desc");
                  }}
                >
                  <ChevronDownIcon className="sort-down sort-button" />
                </button>
              </div>
            </div>
          </th>
          <th colSpan={2}>
            <div className="t-head-element">
              <span>Lastname</span>
              <div className="sort-buttons-container">
                <button
                  onClick={() => {
                    setItems("customer_lastname");
                    setOrder("asc");
                  }}
                >
                  <ChevronUpIcon className="sort-up sort-button" />
                </button>
                <button
                  onClick={() => {
                    setItems("customer_lastname");
                    setOrder("desc");
                  }}
                >
                  <ChevronDownIcon className="sort-down sort-button" />
                </button>
              </div>
            </div>
          </th>
          <th colSpan={2}>
            <div className="t-head-element">
              <span>Address</span>
              <div className="sort-buttons-container">
                <button
                  onClick={() => {
                    setItems("address");
                    setOrder("asc");
                  }}
                >
                  <ChevronUpIcon className="sort-up sort-button" />
                </button>
                <button
                  onClick={() => {
                    setItems("address");
                    setOrder("desc");
                  }}
                >
                  <ChevronDownIcon className="sort-down sort-button" />
                </button>
              </div>
            </div>
          </th>
        </tr>
      </thead>
      <tbody className="tbody">
        {itemsDetails
          .sort((a, b) =>
            order === "asc"
              ? typeof a[items] === "string"
                ? a[items].localeCompare(b[items])
                : a[items] - b[items]
              : typeof a[items] === "string"
              ? b[items].localeCompare(a[items])
              : b[items] - a[items]
          )
          ?.map((item, i) => (
            <tr
              key={Math.random()}
              style={{ height: "30px" }}
              onClick={() => setPopupForm({ type: "edit", data: item })}
            >
              <td>{i + 1}</td>

              <td colSpan={2}>{item.customer_firstname}</td>
              <td colSpan={2}>{item.customer_middlename}</td>
              <td colSpan={2}>{item.customer_lastname}</td>
              <td colSpan={2}>{item.address || ""}</td>
            </tr>
          ))}
      </tbody>
    </table>
  );
}
