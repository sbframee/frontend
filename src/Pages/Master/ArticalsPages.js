import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/solid";
import axios from "axios";
import Select from "react-select";
import "./styles.css";
import { Add } from "@mui/icons-material";
import { v4 as uuid } from "uuid";
const ArticalsPage = () => {
  const [itemsData, setItemsData] = useState([]);
  const [formList, setFormList] = useState([]);
  const [filterItemsData, setFilterItemsData] = useState([]);
  const [popupForm, setPopupForm] = useState(false);
  const [filterTitle, setFilterTitle] = useState("");

  const getFormList = async () => {
    const response = await axios({
      method: "get",
      url: "/formList/GetFormList",

      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) setFormList(response.data.result);
  };
  useEffect(() => {
    getFormList();
  }, []);
  const getItemsData = async () => {
    const response = await axios({
      method: "get",
      url: "/articals/GetArticalsList",

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
        .filter((a) => a.article_title)
        .filter(
          (a) =>
            !filterTitle ||
            a.article_title
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
          <h2>Article</h2>
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
          formList={formList}
        />
      ) : (
        ""
      )}
    </>
  );
};

export default ArticalsPage;
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
              <span>Article Title</span>
              <div className="sort-buttons-container">
                <button
                  onClick={() => {
                    setItems("article_title");
                    setOrder("asc");
                  }}
                >
                  <ChevronUpIcon className="sort-up sort-button" />
                </button>
                <button
                  onClick={() => {
                    setItems("article_title");
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

              <td colSpan={3}>{item.article_title}</td>
            </tr>
          ))}
      </tbody>
    </table>
  );
}
function NewUserForm({ onSave, popupInfo, setItemsData, formList }) {
  const [data, setdata] = useState({});

  const [errMassage, setErrorMassage] = useState("");

  useEffect(() => {
    if (popupInfo?.type === "edit")
      setdata({
        ...popupInfo.data,
      });
    else setdata({ firm_uuid: localStorage.getItem("firm_uuid") });
  }, [popupInfo.data, popupInfo?.type]);

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!data.article_title) {
      setErrorMassage("Please insert Artical Title");
      return;
    }

    if (popupInfo?.type === "edit") {
      const response = await axios({
        method: "put",
        url: "/articals/putArtical",
        data,
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.data.success) {
        onSave();
      }
    } else {
      const response = await axios({
        method: "post",
        url: "/articals/postArtical",
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
  console.log(data);
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
                <h1>{popupInfo.type === "edit" ? "Edit" : "Add"} Artical</h1>
              </div>

              <div className="formGroup">
                <div className="row">
                  <label className="selectLabel">
                    Articles Title
                    <input
                      type="text"
                      name="route_title"
                      className="numberInput"
                      value={data?.article_title}
                      onChange={(e) =>
                        setdata({
                          ...data,
                          article_title: e.target.value,
                        })
                      }
                      maxLength={60}
                    />
                  </label>
                  <label className="selectLabel" style={{ width: "200px" }}>
                    Customer
                    <Select
                      options={formList.map((a) => ({
                        value: a.form_uuid,
                        label: a.form_title,
                      }))}
                      onChange={(doc) => {
                        setdata((prev) => ({
                          ...prev,
                          form_uuid: doc.value,
                        }));
                      }}
                      value={
                        data?.form_uuid
                          ? {
                              value: data?.form_uuid,
                              label: formList?.find(
                                (j) => j.form_uuid === data.form_uuid
                              )?.form_title,
                            }
                          : ""
                      }
                      openMenuOnFocus={true}
                      menuPosition="fixed"
                      menuPlacement="auto"
                      placeholder="Select"
                    />
                  </label>
                </div>
                {data?.category?.map((a, i) => (
                  <div
                    className="row"
                    style={{ flexFlow: "row wrap", width: "700px" }}
                  >
                    <label className="selectLabel">
                      {i + 1}) Category Title
                      <input
                        type="text"
                        name="route_title"
                        className="numberInput"
                        value={a?.category_name}
                        onChange={(e) =>
                          setdata((prev) => ({
                            ...prev,
                            category: prev.category.map((b) =>
                              a.uuid === b.uuid
                                ? { ...b, category_name: e.target.value }
                                : b
                            ),
                          }))
                        }
                        maxLength={60}
                      />
                    </label>
                    {a?.sub_category?.map((b, index) => (
                      <label className="selectLabel" key={b.uuid}>
                        {index + 1}) Sub Category Title
                        <input
                          type="text"
                          name="route_title"
                          className="numberInput"
                          value={b?.sub_category_name}
                          onChange={(e) =>
                            setdata((prev) => ({
                              ...prev,
                              category: prev.category.map((c) =>
                                a.uuid === c.uuid
                                  ? {
                                      ...c,
                                      sub_category: c?.sub_category?.map((d) =>
                                        d.uuid === b.uuid
                                          ? {
                                              ...d,
                                              sub_category_name: e.target.value,
                                            }
                                          : d
                                      ),
                                    }
                                  : c
                              ),
                            }))
                          }
                          maxLength={60}
                        />
                      </label>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        setdata((prev) => ({
                          ...prev,
                          category: prev.category.map((b) =>
                            b.uuid === a.uuid
                              ? {
                                  ...b,
                                  sub_category: [
                                    ...(b.sub_category || []),
                                    {
                                      uuid: uuid(),

                                      sub_category_name: "",
                                    },
                                  ],
                                }
                              : b
                          ),
                        }))
                      }
                      className="item-sales-search"
                      style={{ width: "fit-content" }}
                    >
                      <Add />
                      Add Sub Category
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setdata((prev) => ({
                      ...prev,
                      category: [
                        ...(prev.category || []),
                        {
                          uuid: uuid(),
                          category_name: "",
                          sub_category: [],
                        },
                      ],
                    }))
                  }
                  className="item-sales-search"
                  style={{ width: "fit-content" }}
                >
                  <Add />
                  Add Category
                </button>
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
