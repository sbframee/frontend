import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import { AddCircle as AddIcon } from "@mui/icons-material";
import DatePicker from "react-datepicker";
import EditIcon from '@mui/icons-material/Edit';
import * as FileSaver from "file-saver";

import * as XLSX from "xlsx";
import JsPDF from "jspdf";
let initials = {
  invoiceNumberFilter: "",
};

const AllCustomers = () => {
  const [searchData, setSearchData] = useState({
    initials,
  });
  const [items, setItems] = useState([]);
  const [popupForm, setPopupForm] = useState(false);

  const fileType =
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
  const fileExtension = ".xlsx";
  const getCompleteOrders = async () => {
    const response = await axios({
      method: "get",
      url: "/customers/GetCustomersList",

      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("activity", response);
    if (response.data.success) setItems(response.data.result);
    else setItems([]);
  };

  useEffect(() => {
    setSearchData(initials);
    getCompleteOrders();
  }, []);
  let itemsDetails = useMemo(
    () =>
      items.filter(
        (a) =>
          !searchData.invoiceNumberFilter ||
          a.customer_firstname
            ?.toString()
            ?.includes(searchData.invoiceNumberFilter.toLocaleLowerCase()) ||
          a.customer_middlename
            ?.toString()
            ?.includes(searchData.invoiceNumberFilter.toLocaleLowerCase()) ||
          a.customer_lastname
            ?.toLocaleLowerCase()
            ?.includes(searchData.invoiceNumberFilter.toLocaleLowerCase()) ||
          a.mobile.filter((b) =>
            b.number
              ?.toString()
              ?.includes(searchData.invoiceNumberFilter.toLocaleLowerCase())
          ).length
      ),
    [searchData, items]
  );
  const handlePrint = async () => {
    // let sheetData = menuData.category_and_items.map(a=>a.menu_items.map(b=>({category_uuid:a.category_uuid,...b})))

    let sheetData = itemsDetails.map((a) => {
      // console.log(a)
      return {
        "First Name": a.customer_firstname,
        "Middle Name": a.customer_middlename,
        "Last Name": a.customer_lastname,
        Gender: a.customer_gender,
        "Date of Birth": new Date(a.dob).toDateString(),
        Address: a.address,
        Mobile:
          a.mobile.length > 1
            ? a.mobile
                .map((b, i) => (i === 0 ? b.number : ", " + b.number))
                ?.reduce((a, b) => a + b)
            : a.mobile.length
            ? a.mobile[0].number
            : "",
      };
    });
    // console.log(sheetData)
    const ws = XLSX.utils.json_to_sheet(sheetData);
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, "CustomerReport" + fileExtension);
  };
  const printDocument = () => {
    const report = new JsPDF("portrait", "pt", "a4");
    report.html(document.getElementById("daily-summary")).then(() => {
      report.save("Customer_report.pdf");
    });
  };
  return (
    <>
      <Sidebar />
      <Header />
      <div className="item-sales-container orders-report-container">
        <div id="heading">
          <h2>All Customers</h2>
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
            <label className="selectLabel">
              Customer
              <input
                type="text"
                onChange={(e) =>
                  setSearchData((prev) => ({
                    ...prev,
                    invoiceNumberFilter: e.target.value,
                  }))
                }
                value={searchData.invoiceNumberFilter}
                placeholder="Search Customer..."
                className="searchInput"
                onWheel={(e) => e.preventDefault()}
              />
            </label>
            <div className="flex">
              <button
                type="button"
                className="item-sales-search"
                onClick={handlePrint}
              >
                Excel
              </button>
              <button
                type="button"
                className="item-sales-search"
                onClick={printDocument}
              >
                PDF
              </button>
            </div>
          </div>
        </div>
        <div
          className="table-container-user item-sales-container"
          style={{ minHeight: "70vh" }}
        >
          <Table itemsDetails={itemsDetails} setPopup={setPopupForm} />
        </div>
      </div>
      {popupForm ? (
        <NewUserForm
          onSave={() => {
            setPopupForm(false);
            getCompleteOrders();
          }}
          popupInfo={popupForm}
        />
      ) : (
        ""
      )}
    </>
  );
};

export default AllCustomers;

function Table({ itemsDetails, setPopup }) {
  const [dropdown, setDropDown] = useState("");

  return (
    <>
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
            <th>First Name</th>
            <th>Middle Name</th>
            <th>Last Name</th>
            <th>Gender</th>
            <th>Date of Birth</th>
            <th>Address</th>
            <th>Mobile</th>
            <th></th>
          </tr>
        </thead>
        <tbody className="tbody">
          {itemsDetails?.map((item, i, array) => (
            <tr key={Math.random()} style={{ height: "30px" }}>
              <td>{i + 1}</td>
              <td>{item.customer_firstname}</td>
              <td>{item.customer_middlename}</td>
              <td>{item.customer_lastname}</td>
              <td>{item.customer_gender || ""}</td>

              <td>{new Date(item.dob).toDateString()}</td>
              <td>{item.address || ""}</td>

              <td
                colSpan={2}
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <div style={{ position: "relitive" }}>
                  <button
                    type="button"
                    className="item-sales-search"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDropDown(item.customer_uuid);
                    }}
                  >
                    Mobile
                  </button>

                  {dropdown === item.customer_uuid ? (
                    <div
                      id="customer-details-dropdown"
                      className={"page1 flex"}
                      style={{
                        top: "200px",
                        flexDirection: "column",
                        zIndex: "200",
                        right: "200px",
                      }}
                      onMouseLeave={() => setDropDown(false)}
                    >
                      <table className="user-table" style={{ width: "200px" }}>
                        <thead>
                          <tr>
                            <th>Type</th>
                            <th>Number</th>
                          </tr>
                          {item.mobile.map((a) => (
                            <tr>
                              <td>{a.label}</td>
                              <td>{a.number}</td>
                            </tr>
                          ))}
                        </thead>
                      </table>
                    </div>
                  ) : (
                    ""
                  )}
                </div>
              </td>
              <td>
                {" "}
                <button
                  type="button"
                  className="item-sales-search"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPopup({ type: "edit", data: item });
                  }}
                >
                  Documents
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div
        style={{
          // display: "none",
          position: "fixed",
          top: -100,
          left: -180,
          zIndex: "-1000",
        }}
      >
        <table id="daily-summary">
          <thead>
            <tr>
              <th>S.N</th>
              <th>First Name</th>
              <th>Middle Name</th>
              <th>Last Name</th>
              <th>Gender</th>
              <th>Date of Birth</th>
            </tr>
          </thead>
          <tbody>
            {itemsDetails?.map((item, i, array) => (
              <tr key={Math.random()}>
                <td>{i + 1}</td>
                <td>{item.customer_firstname}</td>
                <td>{item.customer_middlename}</td>
                <td>{item.customer_lastname}</td>
                <td>{item.customer_gender || ""}</td>

                <td>{new Date(item.dob).toDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function NewUserForm({ onSave, popupInfo }) {
  const [data, setdata] = useState("");
  const [documentsList, setDocumentList] = useState([]);
  const [documents, setDocuments] = useState([]);
  const getDocumentsList = async () => {
    const response = await axios({
      method: "get",
      url: "/documentsList/GetDocumentList",

      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("activity", response);
    if (response.data.success) setDocumentList(response.data.result);
    else setDocumentList([]);
  };
  const getDocuments = async (customer_uuid) => {
    const response = await axios({
      method: "get",
      url: "/documents/GetDocuments/" + customer_uuid,

      headers: {
        "Content-Type": "application/json",
      },
    });

    setDocuments(response?.data?.result || []);
  };
  useEffect(() => {
    getDocumentsList();
  }, []);
  useEffect(() => {
    getDocuments(popupInfo.data.customer_uuid);
  }, [data, popupInfo.data.customer_uuid]);

  const submitHandler = async (e) => {
    e.preventDefault();
    const response = await axios({
      method: "post",
      url: "/documents/postDocument",
      data,
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) setdata(false);
  };
  console.log(documents);
  return (
    <div className="overlay">
      {data ? (
        <div
          className="modal"
          style={{ height: "fit-content", width: "fit-content" }}
        >
          <div
            className="content"
            style={{
              height: "fit-content",
              padding: "20px",
              width: "fit-content",
            }}
          >
            <div style={{ overflowY: "scroll", paddingTop: "30px" }}>
              <form className="form" onSubmit={submitHandler}>
                <div className="row">
                  <h1>{data.document_title} </h1>
                </div>
                <div className="form">
                  <div className="row">
                    <label className="selectLabel">
                      Unique Id
                      <input
                        type="text"
                        name="route_title"
                        className="numberInput"
                        value={data?.unique_id}
                        onChange={(e) =>
                          setdata((prev) => ({
                            ...prev,
                            unique_id: e.target.value,
                          }))
                        }
                      />
                    </label>
                    <label className="selectLabel">
                      Date Of Birth
                      <DatePicker
                        id="date-from"
                        className="numberInput"
                        dateFormat="d/M/y"
                        selected={+data.dob}
                        onChange={(e) =>
                          setdata((prev) => ({
                            ...prev,
                            dob: new Date(e).getTime(),
                          }))
                        }
                        style={{ textAlign: "center" }}
                        wrapperClassName=""
                        shouldCloseOnSelect={false}
                        isCalendarOpen={true}
                      />
                      {console.log(data.disbursal_date)}
                    </label>
                  </div>
                  <div className="row">
                    <label className="selectLabel">
                      Address
                      <textarea
                        name="route_title"
                        className="numberInput"
                        style={{ height: "150px" }}
                        value={data?.address}
                        onChange={(e) =>
                          setdata((prev) => ({
                            ...prev,
                            address: e.target.value,
                          }))
                        }
                      />
                    </label>
                    <label className="selectLabel">
                      Remarks
                      <textarea
                        name="route_title"
                        className="numberInput"
                        style={{ height: "150px" }}
                        value={data?.remarks}
                        onChange={(e) =>
                          setdata((prev) => ({
                            ...prev,
                            remarks: e.target.value,
                          }))
                        }
                      />
                    </label>
                  </div>
                </div>

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
      ) : (
        <div
          className="modal"
          style={{ height: "fit-content", width: "fit-content" }}
        >
          <div
            className="content"
            style={{
              height: "fit-content",
              padding: "20px",
              width: "fit-content",
            }}
          >
            <div style={{ overflowY: "scroll", paddingTop: "30px" }}>
              <form className="form" onSubmit={submitHandler}>
                {documentsList
                  .sort((a, b) =>
                    a.document_title.localeCompare(b.document_title)
                  )
                  .map((a, i) => (
                    <div>
                      <div
                        className="flex"
                        style={{ justifyContent: "space-between" }}
                      >
                        <h2>
                          {i + 1}) {a.document_title}
                        </h2>
                        {documents.find(
                          (b) => b.document_uuid === a.document_uuid
                        ) ? (
                          <div
                            onClick={() =>
                              setdata(
                                documents.find(
                                  (b) => b.document_uuid === a.document_uuid
                                )
                              )
                            }
                          >
                            <EditIcon
                              sx={{ fontSize: 40 }}
                              style={{
                                background: "#4AC959",
                                cursor: "pointer",
                                color: "#fff",
                                borderRadius: "30px",
                                padding: "8px",
                                height: "35px",
                                width: "35px",
                              }}
                            />
                          </div>
                        ) : (
                          <div
                            onClick={() =>
                              setdata({
                                ...a,
                                customer_uuid: popupInfo?.data?.customer_uuid,
                              })
                            }
                          >
                            <AddIcon
                              sx={{ fontSize: 40 }}
                              style={{
                                color: "#4AC959",
                                cursor: "pointer",
                                height: "40px",
                                width: "40px",
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </form>
            </div>
            <button onClick={onSave} className="closeButton">
              x
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
