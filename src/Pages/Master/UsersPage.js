import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/solid";
import axios from "axios";
import "./styles.css";
const UsersPage = () => {
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
      url: "/users/GetUsersList",

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
        .filter((a) => a.user_title)
        .filter(
          (a) =>
            !filterTitle ||
            a.user_title
              .toLocaleLowerCase()
              .includes(filterTitle.toLocaleLowerCase())
        )
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
          <h2>Users</h2>
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

export default UsersPage;
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
              <span>Users Title</span>
              <div className="sort-buttons-container">
                <button
                  onClick={() => {
                    setItems("user_title");
                    setOrder("asc");
                  }}
                >
                  <ChevronUpIcon className="sort-up sort-button" />
                </button>
                <button
                  onClick={() => {
                    setItems("user_title");
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

              <td colSpan={3}>{item.user_title}</td>
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
    else
      setdata({
        firm_uuid: localStorage.getItem("firm_uuid"),
        user_type: 1,
        user_id: "",
        user_password: "",
        user_title: "",
      });
  }, [popupInfo.data, popupInfo?.type]);

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!data.user_title) {
      setErrorMassage("Please insert User Title");
      return;
    }

    if (popupInfo?.type === "edit") {
      const response = await axios({
        method: "put",
        url: "/users/putUser",
        data: [data],
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.data.result[0].success) {
        setItemsData((prev) =>
          prev.map((i) => (i.user_uuid === data.user_uuid ? data : i))
        );
        onSave();
      }
    } else {
      const response = await axios({
        method: "post",
        url: "/users/postUser",
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
                <h1>{popupInfo.type === "edit" ? "Edit" : "Add"} User</h1>
              </div>

              <div className="formGroup">
                <div className="row">
                  <label className="selectLabel">
                    User Title
                    <input
                      type="text"
                      name="route_title"
                      className="numberInput"
                      value={data?.user_title}
                      onChange={(e) =>
                        setdata({
                          ...data,
                          user_title: e.target.value,
                        })
                      }
                      maxLength={60}
                    />
                  </label>
                </div>
                <div className="row">
                  <label className="selectLabel">
                    User Id
                    <input
                      type="text"
                      name="route_title"
                      className="numberInput"
                      value={data?.user_id}
                      onChange={(e) =>
                        setdata({
                          ...data,
                          user_id: e.target.value,
                        })
                      }
                      maxLength={60}
                    />
                  </label>
                </div>
                <div className="row">
                  <label className="selectLabel">
                    User Password
                    <input
                      type="text"
                      name="route_title"
                      className="numberInput"
                      value={data?.user_password}
                      onChange={(e) =>
                        setdata({
                          ...data,
                          user_password: e.target.value,
                        })
                      }
                      maxLength={60}
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
