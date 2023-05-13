import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/solid";
import axios from "axios";
import "./styles.css";
import { v4 as uuid } from "uuid";
import { Add } from "@mui/icons-material";
const Forms = () => {
  const [itemsData, setItemsData] = useState([]);
  const [filterItemsData, setFilterItemsData] = useState([]);
  const [popupForm, setPopupForm] = useState(false);
  const [filterTitle, setFilterTitle] = useState("");

  const getItemsData = async () => {
    const response = await axios({
      method: "get",
      url: "/formList/GetFormList",

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
        .filter((a) => a.form_title)
        .filter(
          (a) =>
            !filterTitle ||
            a.form_title
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
          <h2>Agents</h2>
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
              placeholder="Search Form Title..."
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

export default Forms;
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
              <span>Form Title</span>
              <div className="sort-buttons-container">
                <button
                  onClick={() => {
                    setItems("form_title");
                    setOrder("asc");
                  }}
                >
                  <ChevronUpIcon className="sort-up sort-button" />
                </button>
                <button
                  onClick={() => {
                    setItems("form_title");
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

              <td colSpan={3}>{item.form_title}</td>
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
    if (popupInfo?.type === "edit")
      setdata({
        ...popupInfo.data,
        feilds: popupInfo?.data?.feilds.map((a) => ({ uuid: uuid(), ...a })),
      });
    else
      setdata({
        firm_uuid: localStorage.getItem("firm_uuid"),
        form_title: "",
        feilds: [{ uuid: uuid(), title: "" }],
      });
  }, [popupInfo.data, popupInfo?.type]);

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!data.form_title) {
      setErrorMassage("Please insert Form Title");
      return;
    }

    if (popupInfo?.type === "edit") {
      const response = await axios({
        method: "put",
        url: "/formList/putFormList",
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
        url: "/formList/postFormList",
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
                <h1>{popupInfo.type === "edit" ? "Edit" : "Add"} Agent</h1>
              </div>

              <div className="formGroup">
                <div className="row">
                  <label className="selectLabel">
                    Agent Title
                    <input
                      type="text"
                      name="route_title"
                      className="numberInput"
                      value={data?.form_title}
                      onChange={(e) =>
                        setdata({
                          ...data,
                          form_title: e.target.value,
                        })
                      }
                      maxLength={60}
                    />
                  </label>
                </div>
                <div className="row">
                  <label className="selectLabel" style={{ width: "100%" }}>
                    Feilds
                    {data?.feilds?.map((a, i) => (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          width: "100%",
                        }}
                      >
                        {i + 1})
                        <input
                          key={a.uuid}
                          type="text"
                          name="route_title"
                          className="numberInput"
                          placeholder="Title"
                          value={
                            data?.feilds.find((b) => b.uuid === a.uuid)?.title
                          }
                          onChange={(e) =>
                            setdata((prev) => ({
                              ...prev,
                              feilds: prev?.feilds?.map((b) =>
                                a.uuid === b.uuid
                                  ? { ...b, title: e.target.value }
                                  : b
                              ),
                            }))
                          }
                          maxLength={60}
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        setdata((prev) => ({
                          ...prev,
                          feilds: [...prev.feilds, { uuid: uuid(), title: "" }],
                        }))
                      }
                      className="item-sales-search"
                      style={{ width: "fit-content" }}
                    >
                      <Add />
                    </button>
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
