import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import HeaderAdminM from "../../components/HeaderAdminM";
import DatePicker from "react-datepicker";
import * as FileSaver from "file-saver";

import * as XLSX from "xlsx";
import JsPDF from "jspdf";

const fileType =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
const fileExtension = ".xlsx";
let date = new Date();
let initials = {
  startDate: date,
  endDate: date,
  invoiceNumberFilter: "",
};
const AllPayments = () => {
  const [searchData, setSearchData] = useState(initials);
  const [items, setItems] = useState([]);
  const [popupForm, setPopupForm] = useState(false);

  const getCompleteOrders = async () => {
    let startDate = new Date(searchData.startDate).toDateString();
    startDate = new Date(startDate + " 00:00:00 AM");
    startDate = startDate.getTime();
    let endDate = new Date(searchData.endDate).toDateString();
    endDate = new Date(endDate + " 00:00:00 AM").getTime() + 86400000;
    const response = await axios({
      method: "post",
      url: "/payments/GetPaymentsList",
      data: { startDate, endDate },
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("activity", response);
    if (response.data.success) setItems(response.data.result);
    else setItems([]);
  };

  let itemsDetails = useMemo(
    () => items.sort((a, b) => a.time - b.time),
    [items]
  );
  useEffect(() => {
    setSearchData(initials);
  }, []);
  let sheetData = useMemo(
    () =>
      itemsDetails.map((a) => {
        // console.log(a)
        return {
          Date: new Date(a?.time || "").toDateString(),
          User: a.user_title,
          Amount: a.amount,
        };
      }),
    [itemsDetails]
  );
  const handlePrint = async () => {
    // let sheetData = menuData.category_and_items.map(a=>a.menu_items.map(b=>({category_uuid:a.category_uuid,...b})))

    // console.log(sheetData)
    const ws = XLSX.utils.json_to_sheet(sheetData);
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, "PaymentsReport" + fileExtension);
  };
  const printDocument = () => {
    const report = new JsPDF("portrait", "pt", "a4");
    report.html(document.getElementById("daily-summary")).then(() => {
      report.save("PaymentsReport.pdf");
    });
  };
  return (
    <>
      <HeaderAdminM />
      <div>
        <div id="heading">
          <h2>All Payments</h2>
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
              Start Date
              <DatePicker
                id="date-from"
                className="numberInput"
                dateFormat="d/M/y"
                selected={searchData?.startDate || ""}
                maxDate={searchData?.endDate || ""}
                onChange={(e) =>
                  setSearchData((prev) => ({
                    ...prev,
                    startDate: new Date(e),
                  }))
                }
                style={{ textAlign: "center" }}
                wrapperClassName=""
                shouldCloseOnSelect={false}
                isCalendarOpen={true}
              />
            </label>
            <label className="selectLabel">
              End Date
              <DatePicker
                id="date-from"
                className="numberInput"
                dateFormat="d/M/y"
                selected={searchData?.endDate || ""}
                minDate={searchData?.startDate || ""}
                onChange={(e) =>
                  setSearchData((prev) => ({
                    ...prev,
                    endDate: new Date(e),
                  }))
                }
                style={{ textAlign: "center" }}
                wrapperClassName=""
                shouldCloseOnSelect={false}
                isCalendarOpen={true}
              />
            </label>
            <button className="item-sales-search" onClick={getCompleteOrders}>
              Search
            </button>
            {itemsDetails.length ? (
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
            ) : (
              ""
            )}
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

export default AllPayments;

function Table({ itemsDetails, setPopup }) {
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
            <th>S.N</th>
            <th colSpan={2}>Date</th>
            <th colSpan={2}>User</th>
            <th colSpan={2}>Amount</th>
          </tr>
        </thead>
        <tbody className="tbody">
          {itemsDetails?.map((item, i, array) => (
            <tr key={Math.random()} style={{ height: "30px" }}>
              <td>{i + 1}</td>
              <td colSpan={2}>{new Date(+item.time).toDateString()}</td>

              <td colSpan={2}>{item.user_title || 0}</td>

              <td colSpan={2}>{item.amount || ""}</td>
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
          fontSize: "5px",
        }}
      >
        <table id="daily-summary">
          <thead>
            <tr>
              <th>S.N</th>
              <th style={{width:"200px"}}>Date</th>
              <th style={{width:"100px"}}>User</th>
              <th style={{width:"100px"}}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {itemsDetails?.map((item, i, array) => (
              <tr key={Math.random()}>
                <td>{i + 1}</td>
                <td style={{width:"200px"}}>{new Date(+item.time).toDateString()}</td>

                <td style={{width:"100px"}}>{item.user_title || 0}</td>

                <td style={{width:"100px"}}>{item.amount || ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
function NewUserForm({ onSave, popupInfo }) {
  const [data, setdata] = useState({});

  useEffect(() => {
    if (popupInfo?.type === "edit") setdata(popupInfo.data);
  }, [popupInfo.data, popupInfo?.type]);
  console.log(data);
  const submitHandler = async (e) => {
    e.preventDefault();

    let obj = { ...data, disbursal_status: 1 };
    let L = +obj?.loan_amt || 0;
    let N = +obj.number_of_installment || 0;
    let I = +obj.interest || 0;
    let amount = ((L + (N * L * I) / 1200) / (N || 1) || 0).toFixed(2);
    let installment_status = [];
    for (let i = 0; i < +obj.number_of_installment; i++) {
      let date = new Date(
        new Date(obj.first_installment_date).getTime() + i * 2716200000
      ).setHours(0, 0, 0, 0);
      let iObj = { installment_count: i + 1, amount, status: 0, date };
      installment_status.push(iObj);
    }
    obj = { ...obj, installment_status };
    console.log(obj);
    const response = await axios({
      method: "put",
      url: "/cases/putCase",
      data: obj,
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) {
      onSave();
    }
    // }
  };
  const EMI = useMemo(() => {
    let L = +data?.loan_amt || 0;
    let N = +data.number_of_installment || 0;
    let I = +data.interest || 0;
    let value = ((L + (N * L * I) / 1200) / (N || 1) || 0).toFixed(2);
    return value;
  }, [data?.loan_amt, data.number_of_installment, data.interest]);
  return (
    <div className="overlay">
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
          <div style={{ overflowY: "scroll" }}>
            <form className="form" onSubmit={submitHandler}>
              <div className="row">
                <h1>Disbursed Now </h1>
              </div>

              <div className="form">
                <div className="row">
                  <label className="selectLabel">
                    Interst
                    <input
                      type="number"
                      name="route_title"
                      className="numberInput"
                      value={data?.interest}
                      onChange={(e) =>
                        setdata((prev) => ({
                          ...prev,
                          interest:
                            e.target.value.length < 4
                              ? e.target.value
                              : prev.interest,
                        }))
                      }
                    />
                  </label>
                  <label className="selectLabel">
                    Loan Amount
                    <input
                      type="number"
                      name="route_title"
                      className="numberInput"
                      value={data?.loan_amt}
                      onChange={(e) =>
                        setdata((prev) => ({
                          ...prev,
                          loan_amt:
                            e.target.value.length < 10
                              ? e.target.value
                              : prev.loan_amt,
                        }))
                      }
                    />
                  </label>
                </div>
                <div className="row">
                  <label className="selectLabel">
                    Number of Installment
                    <input
                      type="number"
                      name="route_title"
                      className="numberInput"
                      value={data?.number_of_installment}
                      onChange={(e) =>
                        setdata((prev) => ({
                          ...prev,
                          number_of_installment:
                            e.target.value.length < 4
                              ? e.target.value
                              : prev.number_of_installment,
                        }))
                      }
                      maxLength={3}
                    />
                  </label>
                </div>
                <div className="row">
                  <label className="selectLabel">
                    Disbursal Date
                    <input
                      type="date"
                      name="route_title"
                      className="numberInput"
                      value={data?.disbursal_date}
                      pattern="dd/mm/yy"
                      onChange={(e) =>
                        setdata((prev) => {
                          let time =
                            new Date(e.target.value).getTime() + 2716200000;
                          let date = "yy-mm-dd"
                            ?.replace(
                              "mm",
                              (
                                "00" +
                                (new Date(time)?.getMonth() + 1)?.toString()
                              )?.slice(-2)
                            )
                            ?.replace(
                              "yy",
                              (
                                "0000" +
                                new Date(time)?.getFullYear()?.toString()
                              )?.slice(-4)
                            )
                            ?.replace(
                              "dd",
                              (
                                "00" + new Date(time)?.getDate()?.toString()
                              )?.slice(-2)
                            );
                          console.log(date);

                          return {
                            ...prev,
                            disbursal_date: e.target.value,
                            first_installment_date: date,
                          };
                        })
                      }
                    />
                  </label>
                  <label className="selectLabel">
                    First Installment Date
                    <input
                      type="date"
                      pattern="dd/mm/yy"
                      name="route_title"
                      className="numberInput"
                      value={data?.first_installment_date}
                      onChange={(e) =>
                        setdata((prev) => ({
                          ...prev,
                          first_installment_date: e.target.value,
                        }))
                      }
                    />
                  </label>
                </div>
              </div>

              <button
                className="submit"
                style={{ background: "none", color: "#000" }}
              >
                EMI:{EMI}
              </button>
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
