import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/solid";
import axios from "axios";
import "./styles.css";
const DealerPage = () => {
  const [itemsData, setItemsData] = useState([]);
  const [filterItemsData, setFilterItemsData] = useState([]);
  const [popupForm, setPopupForm] = useState(false);
  const [filterTitle, setFilterTitle] = useState("");

  const getItemsData = async () => {
    const response = await axios({
      method: "get",
      url: "/dealers/GetDealersList",

      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) setItemsData(response.data.result);
  };
  useEffect(() => {
    getItemsData();
  }, [popupForm]);
  useEffect(() => {
    setFilterItemsData(
      itemsData
        .filter((a) => a.dealer_title)
        .filter(
          (a) =>
            !filterTitle ||
            a.dealer_title
              .toLocaleLowerCase()
              .includes(filterTitle.toLocaleLowerCase())
        )
    );
  }, [itemsData, filterTitle]);

  return (
    <>
      <Sidebar />
      <Header />
      <div className="item-sales-container orders-report-container">
        <div id="heading">
          <h2>Dealers</h2>
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
              placeholder="Search Dealer Title..."
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
        <NewUserForm
          onSave={() => setPopupForm(false)}
          setItemsData={setItemsData}
          popupInfo={popupForm}
        />
      ) : (
        ""
      )}
    </>
  );
};

export default DealerPage;
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

          <th colSpan={3}>
            <div className="t-head-element">
              <span>Dealer Title</span>
              <div className="sort-buttons-container">
                <button
                  onClick={() => {
                    setItems("agent_title");
                    setOrder("asc");
                  }}
                >
                  <ChevronUpIcon className="sort-up sort-button" />
                </button>
                <button
                  onClick={() => {
                    setItems("agent_title");
                    setOrder("desc");
                  }}
                >
                  <ChevronDownIcon className="sort-down sort-button" />
                </button>
              </div>
            </div>
          </th>
          <th colSpan={3}>
            <div className="t-head-element">
              <span>Mobile</span>
              <div className="sort-buttons-container">
                <button
                  onClick={() => {
                    setItems("mobile");
                    setOrder("asc");
                  }}
                >
                  <ChevronUpIcon className="sort-up sort-button" />
                </button>
                <button
                  onClick={() => {
                    setItems("mobile");
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

              <td colSpan={3}>{item.dealer_title}</td>
              <td colSpan={3}>
                {item.mobile.length
                  ? item?.mobile?.map((a, i) => (i === 0 ? a : ", " + a))
                  : ""}
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  );
}
function NewUserForm({ onSave, popupInfo, setItemsData }) {
  const [data, setdata] = useState({});

  const [errMassage, setErrorMassage] = useState("");

  useEffect(() => {
    if (popupInfo?.type === "edit") setdata({ ...popupInfo.data });
    else setdata({ firm_uuid: localStorage.getItem("firm_uuid") });
  }, [popupInfo.data, popupInfo?.type]);

  const submitHandler = async (e) => {
    e.preventDefault();
    console.log(data);
    if (!data.dealer_title) {
      setErrorMassage("Please insert Dealer Title");
      return;
    }

    if (popupInfo?.type === "edit") {
      const response = await axios({
        method: "put",
        url: "/dealers/putDealer",
        data: [data],
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.data.result[0].success) {
        setItemsData((prev) =>
          prev.map((i) => (i.agent_uuid === data.agent_uuid ? data : i))
        );
        onSave();
      }
    } else {
      const response = await axios({
        method: "post",
        url: "/dealers/postDealer",
        data,
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.data.success) {
        setItemsData((prev) => [...prev, data]);
        onSave();
      }
    }
  };

  return (
    <div className="overlay">
      <div
        className="modal"
        style={{ height: "fit-content", width: "fit-content", padding: "20px" }}
      >
        <div
          className="content"
          style={{
            height: "fit-content",
            padding: "20px",
            width: "fit-content",
          }}
        >
          <div style={{ overflowY: "scroll" }}>
            <form className="form" onSubmit={submitHandler}>
              <div className="row">
                <h1>{popupInfo.type === "edit" ? "Edit" : "Add"} Dealer</h1>
              </div>

              <div className="formGroup">
                <div className="row">
                  <label className="selectLabel">
                    Dealer Title
                    <input
                      type="text"
                      name="route_title"
                      className="numberInput"
                      value={data?.dealer_title}
                      onChange={(e) =>
                        setdata({
                          ...data,
                          dealer_title: e.target.value,
                        })
                      }
                      maxLength={60}
                    />
                  </label>
                </div>
                <div className="row">
                  <label className="selectLabel">
                    Bank Account Name
                    <input
                      type="text"
                      name="route_title"
                      className="numberInput"
                      value={data?.bank_account_name}
                      onChange={(e) =>
                        setdata({
                          ...data,
                          bank_account_name: e.target.value,
                        })
                      }
                      maxLength={60}
                    />
                  </label>
                </div>
                <div className="row">
                  <label className="selectLabel">
                    Bank Account Number
                    <input
                      type="number"
                      name="route_title"
                      className="numberInput"
                      value={data?.bank_account_number}
                      onChange={(e) =>
                        setdata({
                          ...data,
                          bank_account_number: e.target.value,
                        })
                      }
                      maxLength={60}
                    />
                  </label>
                </div>
                <div className="row">
                  <label className="selectLabel">
                    IFSC Code
                    <input
                      type="number"
                      name="route_title"
                      className="numberInput"
                      value={data?.ifsc_code}
                      onChange={(e) =>
                        setdata({
                          ...data,
                          ifsc_code: e.target.value,
                        })
                      }
                      maxLength={60}
                    />
                  </label>
                </div>
                <div className="row">
                  <label className="selectLabel" style={{ width: "100%" }}>
                    Mobile
                    <textarea
                      type="number"
                      onWheel={(e) => e.target.blur()}
                      name="sort_order"
                      className="numberInput"
                      rows={7}
                      cols={12}
                      value={data?.mobile?.toString()?.replace(/,/g, "\n")}
                      style={{ height: "100px" }}
                      onChange={(e) =>
                        setdata({
                          ...data,
                          mobile: e.target.value.split("\n"),
                        })
                      }
                    />
                  </label>

                  <label className="selectLabel" style={{ width: "100%" }}>
                    Remarks
                    <textarea
                      name="sort_order"
                      className="numberInput"
                      rows={7}
                      cols={12}
                      value={data?.remarks}
                      style={{ height: "100px" }}
                      onChange={(e) =>
                        setdata({
                          ...data,
                          remarks: e.target.value,
                        })
                      }
                    />
                  </label>
                </div>
              </div>
              <i style={{ color: "red" }}>
                {errMassage === "" ? "" : "Error: " + errMassage}
              </i>

              <button type="submit" className="submit">
                Save changes
              </button>
            </form>
          </div>
          <button onClick={onSave} className="closeButton">
            x
          </button>
        </div>
      </div>
    </div>
  );
}
