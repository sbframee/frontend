import axios from "axios";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { v4 as uuid } from "uuid";
import DatePicker from "react-datepicker";
import * as FileSaver from "file-saver";
import { useReactToPrint } from "react-to-print";
import pmt from "formula-pmt";
import Select from "react-select";

import * as XLSX from "xlsx";
import JsPDF from "jspdf";
import HeaderAdminM from "../../components/HeaderAdminM";

const fileType =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
const fileExtension = ".xlsx";
let date = new Date();
let initials = {
  startDate: date,
  endDate: date,
  invoiceNumberFilter: "",
  current_stage: "all",
  disbursal_status: "all",
};
const stages = [
  { value: 0, name: "Evaluation" },
  { value: 1, name: "Rejected" },
  { value: 2, name: "Processing" },
  { value: 3, name: "Ongoing" },
  { value: 4, name: "NPA" },
  { value: 5, name: "Completed" },
];
const AllCases = () => {
  const [searchData, setSearchData] = useState(initials);
  const [items, setItems] = useState([]);
  const [popupForm, setPopupForm] = useState(false);
  const [selectedCase, setSelectedCase] = useState();
  const componentRef = useRef(null);

  const reactToPrintContent = useCallback(() => {
    return componentRef.current;
  }, [selectedCase]);
  const handleFormPrint = useReactToPrint({
    content: reactToPrintContent,
    documentTitle: "Statement",
    removeAfterPrint: true,
  });
  const getCompleteOrders = async () => {
    let startDate = new Date(searchData.startDate).toDateString();
    startDate = new Date(startDate + " 00:00:00 AM");
    startDate = startDate.getTime();
    let endDate = new Date(searchData.endDate).toDateString();
    endDate = new Date(endDate + " 00:00:00 AM").getTime() + 86400000;
    const response = await axios({
      method: "post",
      url: "/cases/GetCasesList",
      data: {
        startDate,
        endDate,
        disbursal_status: searchData.disbursal_status,
        current_stage: searchData.current_stage,
      },

      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("activity", response);
    if (response.data.success) setItems(response.data.result);
    else setItems([]);
  };
  const GetCaseData = async (case_uuid) => {
    const response = await axios({
      method: "get",
      url: "/cases/GetCasesList/" + case_uuid,

      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("activity", response);
    if (response.data.success) {
      setSelectedCase(response.data.result);
      setTimeout(handleFormPrint, 3000);
    }
  };
  useEffect(() => {
    setSearchData(initials);
    // GetCaseData("08663dbe-fbd4-4f77-b0a6-30b64c3d7db1");
  }, []);

  let itemsDetails = useMemo(
    () =>
      items?.filter(
        (a) =>
          !searchData?.invoiceNumberFilter ||
          a?.name
            ?.toString()
            ?.toLocaleLowerCase()
            ?.includes(searchData?.invoiceNumberFilter.toLocaleLowerCase()) ||
          a?.case_number
            ?.toString()
            ?.includes(searchData?.invoiceNumberFilter.toLocaleLowerCase()) ||
          a?.mobileno?.filter((b) =>
            b?.number
              ?.toString()
              ?.includes(searchData?.invoiceNumberFilter.toLocaleLowerCase())
          )?.length
      ),
    [searchData, items]
  );
  let sheetData = useMemo(
    () =>
      itemsDetails.map((a) => {
        // console.log(a)
        return {
          "Created At": new Date(a?.created_at || "").toDateString(),
          "Case Number": a.case_number,
          Customer:
            a.name,
          Mobile:
            a.mobileno,
          Stage:
            stages?.find((b) => +b.value === +a?.current_stage)?.name || "",
          Progress: a.progress,
          "Disbursal Date": new Date(
            +a?.disbursal_date || a?.disbursal_date || ""
          ).toDateString(),
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
    FileSaver.saveAs(data, "CasesReport" + fileExtension);
  };
  const printDocument = () => {
    const report = new JsPDF("portrait", "pt", "a4");
    report.html(document.getElementById("daily-summary")).then(() => {
      report.save("CasesReport.pdf");
    });
  };

  return (
    <>
        <div>
      <HeaderAdminM />
   
        <div id="heading">
          <h2>All Cases</h2>
        </div>
        <div>
          <div
            style={{
              overflow: "visible",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              paddingLeft: '10px'
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
            </div>
        </div>
        <div>
        <div
            style={{
              
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "430px",
              paddingLeft: '10px'
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
            </div>
            </div>
            <div>
            <div
            style={{
              
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "430px",
              padding: '10px'
            }}
          >
            <label className="selectLabel">
              Disbursal Status:
              <select
                type="text"
                onChange={(e) =>
                  setSearchData((prev) => ({
                    ...prev,
                    disbursal_status: e.target.value,
                  }))
                }
                value={searchData?.disbursal_status}
                placeholder="Search User..."
                className="searchInput"
              >
                <option value="all">All</option>
                <option value={0}>Pending</option>
                <option value={1}>Completed</option>
              </select>
            </label>
            <label className="selectLabel">
              Stage:
              <select
                onChange={(e) => {
                  setSearchData((prev) => ({
                    ...prev,
                    current_stage: e.target.value,
                  }));
                }}
                value={searchData?.current_stage}
                placeholder="Search User..."
                className="searchInput"
              >
                <option value="all">All</option>
                <option value={0}>Evaluation</option>
                <option value={1}>Rejected</option>
                <option value={2}>Processing</option>
                <option value={3}>Ongoing</option>
                <option value={4}>NPA</option>
                <option value={4}>Completed</option>
              </select>
            </label>
            <button className="item-sales-search" onClick={getCompleteOrders}>
              Search
            </button>
            {itemsDetails?.length ? (
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
          style={{ minHeight: "70vh" }}
        >
          <Table
            completed={searchData.disbursal_status}
            itemsDetails={itemsDetails}
            setPopup={setPopupForm}
          />
        </div>
      </div>
      {popupForm ? (
        <NewUserForm
          onSave={() => {
            setPopupForm(false);
            getCompleteOrders();
          }}
          popupInfo={popupForm}
          GetCaseData={GetCaseData}
        />
      ) : (
        ""
      )}
      {selectedCase ? (
        <div
          style={{
            position: "fixed",
            top: -100,
            left: -180,
            zIndex: "-1000",
          }}
        >
          <div
            ref={componentRef}
            id="item-container"
            style={{
              // margin: "45mm 40mm 30mm 60mm",
              // textAlign: "center",
              height: "128mm",
              // padding: "10px"
            }}
          >
          </div>
        </div>
      ) : (
        ""
      )}
    </>
  );
};

export default AllCases;

function Table({ itemsDetails, setPopup }) {
  const [statementCase, setStatmentCAse] = useState();
  const componentRef = useRef(null);

  const reactToPrintContent = useCallback(() => {
    return componentRef.current;
  }, []);
  const handlePrint = useReactToPrint({
    content: reactToPrintContent,
    documentTitle: "Statement",
    removeAfterPrint: true,
  });
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
            <th>Created At</th>
            <th>Case Number</th>
            <th>Customer</th>

            <th>Mobile</th>
            <th>Stage</th>
            <th>Progress</th>
            <th>Disbursal Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody className="tbody">
          {itemsDetails?.map((item, i, array) => (
            <tr key={Math.random()} style={{ height: "30px" }}>
              <td>{i + 1}</td>
              <td>{new Date(item?.created_at || "").toDateString()}</td>
              <td>{item.case_number || 0}</td>

              <td>
                {(item?.name || "")}
              </td>

              <td>
                {item.mobileno}
              </td>

              <td>
                {stages.find((a) => +a.value === +item?.current_stage)?.name ||
                  ""}
              </td>
              <td>{item.progress}</td>
              <td>
                {new Date(
                  +item?.disbursal_date || item?.disbursal_date || ""
                ).toDateString()}
              </td>

              <td className="flex" style={{ justifyContent: "space-between" }}>
                {+item.current_stage === 0 ? (
                  <>
                    <button
                      type="button"
                      className="item-sales-search"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPopup({ type: "approved", data: item });
                      }}
                    >
                      Aproved
                    </button>

                    <button
                      type="button"
                      className="item-sales-search"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPopup({ type: "reject", data: item });
                      }}
                    >
                      Reject
                    </button>
                  </>
                ) : item.disbursal_status && +item.current_stage === 3 ? (
                  <button
                    type="button"
                    className="item-sales-search"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPopup({ type: "charges", data: item });
                    }}
                  >
                    Charges
                  </button>
                ) : +item.current_stage === 2 ? (
                  <button
                    type="button"
                    className="item-sales-search"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPopup({ type: "disbursed", data: item });
                    }}
                  >
                    Disbursed Now
                  </button>
                ) : (
                  ""
                )}

                <button
                  type="button"
                  className="item-sales-search"
                  onClick={(e) => {
                    e.stopPropagation();
                    setStatmentCAse(item);
                    setTimeout(handlePrint, 2000);
                  }}
                >
                  Statement
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
          fontSize: "5px",
        }}
      >
        <table id="daily-summary">
          <thead>
            <tr>
              <th>S.N</th>
              <th>Created At</th>
              <th>Case Number</th>
              <th>Customer</th>

              <th>Mobile</th>
              <th>Stage</th>
              <th>Progress</th>
              <th>Disbursal Date</th>
            </tr>
          </thead>
          <tbody>
            {itemsDetails?.map((item, i, array) => (
              <tr key={Math.random()} style={{ height: "30px" }}>
                <td>{i + 1}</td>
                <td>{new Date(item?.created_at || "").toDateString()}</td>
                <td>{item.case_number || 0}</td>

                <td>
                  {item.name}
                </td>

                <td>
                  {item.mobileno}
                </td>

                <td>
                  {stages.find((a) => +a.value === +item?.current_stage)
                    ?.name || ""}
                </td>
                <td>{item.progress}</td>
                <td>
                  {new Date(
                    +item?.disbursal_date || item?.disbursal_date || ""
                  ).toDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {statementCase?.case_uuid ? (
        <div
          style={{ position: "fixed", top: -100, left: -180, zIndex: "-1000" }}
        >
          <div
            ref={componentRef}
            style={{
              width: "21cm",
              height: "29.7cm",

              textAlign: "center",

              // padding: "100px",
              pageBreakInside: "auto",
            }}
          >
            <table style={{ margin: "10px" }}>
              <tr>
                <td
                  style={{
                    fontWeight: "600",
                    fontSize: "small",
                    textAlign: "left",
                  }}
                >
                  Case Number : {statementCase?.case_number}
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    fontWeight: "600",
                    fontSize: "small",
                    textAlign: "left",
                  }}
                >
                  Customer :{" "}
                  {(statementCase?.name || "")}
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    fontWeight: "600",
                    fontSize: "small",
                    textAlign: "left",
                  }}
                >
                  No Of Installments : {statementCase?.number_of_installment}
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    fontWeight: "600",
                    fontSize: "small",
                    textAlign: "left",
                  }}
                >
                  Stage : {statementCase?.current_stage}
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    fontWeight: "600",
                    fontSize: "small",
                    textAlign: "left",
                    width: "10cm",
                  }}
                >
                  Loan Amount : {statementCase?.loan_amt}
                </td>
                <td
                  style={{
                    fontWeight: "600",
                    fontSize: "small",
                    textAlign: "left",
                    width: "10cm",
                  }}
                >
                  Down Payment : {statementCase?.down_payment}
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    fontWeight: "600",
                    fontSize: "small",
                    textAlign: "left",
                    width: "10cm",
                  }}
                >
                  First Installment :
                  {statementCase?.first_installment_date
                    ? new Date(
                        +statementCase?.first_installment_date
                      ).toDateString()
                    : ""}
                </td>
                <td
                  style={{
                    fontWeight: "600",
                    fontSize: "small",
                    textAlign: "left",
                    width: "10cm",
                  }}
                >
                  Final Installment :
                  {statementCase?.final_installment_date
                    ? new Date(
                        statementCase?.final_installment_date
                      ).toDateString()
                    : ""}
                </td>
              </tr>
            </table>
            {statementCase?.installment_status?.length ? (
              <table style={{ margin: "10px", width: "100%" }}>
                <tr>
                  <th style={{ border: "1px solid #000" }}>Installment</th>
                  <th style={{ border: "1px solid #000" }}>Due Date</th>
                  <th style={{ border: "1px solid #000" }}>
                    Installment Amount
                  </th>
                  <th style={{ border: "1px solid #000" }}>Paid Amount</th>
                </tr>
                {statementCase?.installment_status.map((item) => (
                  <tr>
                    <td style={{ border: "1px solid #000" }}>
                      {item.installment_count}
                    </td>
                    <td style={{ border: "1px solid #000" }}>
                      {new Date(item.date).toDateString()}
                    </td>
                    <td style={{ border: "1px solid #000" }}>{item.amount}</td>
                    <td style={{ border: "1px solid #000" }}>
                      {item.paid_amount}
                    </td>
                  </tr>
                ))}
              </table>
            ) : (
              ""
            )}
          </div>
        </div>
      ) : (
        ""
      )}
    </>
  );
}
function NewUserForm({ onSave, popupInfo, GetCaseData }) {
  const [data, setdata] = useState({});
  const [form, setForm] = useState();
  const [formPopup, setFormPopup] = useState(false);
  const [formConfirm, setFormConfirm] = useState(false);
  const [skipPopup, setSkipPopup] = useState(false);
  const [emiType, setEmiType] = useState("flat");

  const getFormList = async (article_uuid) => {
    const response = await axios({
      method: "get",
      url: "/formList/GetForm/" + article_uuid,

      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) setForm(response.data.result);
  };
  console.log(form);
  useEffect(() => {
    if (popupInfo?.type === "disbursed")
      getFormList(popupInfo.data.article_uuid);
  }, [popupInfo.data.article_uuid, popupInfo?.type]);
  useEffect(() => {
    if (popupInfo?.type === "disbursed")
      setdata(() => {
        let date = new Date().getTime();
        let time = date + 2716200000;

        return {
          ...popupInfo.data,
          disbursal_date: date,
          first_installment_date: time,
        };
      });
    if (popupInfo?.type === "approved") setdata(popupInfo.data);
    if (popupInfo?.type === "reject") setdata(popupInfo.data);
    if (popupInfo?.type === "charges")
      setdata({
        title: "",
        amount: 0,
        status: 0,
        created_at: "",
        created_by: localStorage.getItem("user_uuid"),
        uuid: uuid(),
      });
  }, [popupInfo.data, popupInfo?.type]);
  //   console.log(data);
  const GETDiffernece = () => {
    let L = +data?.loan_amt || 0;
    let N = +data.number_of_installment || 0;
    let I = +data.interest || 0;
    let disbursal_date = new Date(data?.disbursal_date || 0);
    let first_installment_date = new Date(data?.first_installment_date || 0);
    let Days =
      data.disbursal_date && data.first_installment_date
        ? (first_installment_date.getMonth() - disbursal_date.getMonth() - 1) *
            30 +
          first_installment_date.getDate() -
          disbursal_date.getDate()
        : 0;

    let value = (Days * ((N * L * I) / (1200 * 365)) || 0).toFixed(2);
    setdata((prev) => ({
      ...prev,
      settlements: +value
        ? [
            {
              title: "Emi Date Difference",
              amount: value,
              clearance_status: 0,
            },
          ]
        : [],
    }));
    return value;
  };
  const Difference = useMemo(GETDiffernece, [
    data?.loan_amt,
    data.number_of_installment,
    data.interest,
    data.disbursal_date,
    data.first_installment_date,
  ]);
  const submitHandler = async (e) => {
    e?.preventDefault();
    // if (!formConfirm && form) {
    //   setSkipPopup(true);
    //   return;
    // }
    let obj = {};
    if (popupInfo?.type === "approved") {
      obj = {
        ...data,
        current_stage: 2,
        stage: [
          ...(data.stage || []),
          {
            stage_number: 2,
            timestamp: new Date().getTime(),
            user_uuid: localStorage.getItem("user_uuid"),
          },
        ],
      };
    } else if (popupInfo?.type === "reject") {
      obj = {
        ...data,
        current_stage: 1,
        stage: [
          ...(data.stage || []),
          {
            stage_number: 1,
            timestamp: new Date().getTime(),
            user_uuid: localStorage.getItem("user_uuid"),
          },
        ],
      };
    } else if (popupInfo?.type === "charges") {
      obj = {
        ...popupInfo.data,
        charge_uuid: data.uuid,
        charges: popupInfo?.data?.charges?.length
          ? [...popupInfo?.data?.charges, data]
          : [data],
      };
    } else if (popupInfo?.type === "disbursed") {
      obj = {
        ...data,
        disbursal_status: 1,
        current_stage: 3,
        stage: [
          ...(data.stage || []),
          {
            stage_number: 3,
            timestamp: new Date().getTime(),
            user_uuid: localStorage.getItem("user_uuid"),
          },
        ],
      };

      let installment_status = [];
      for (let i = 0; i < +obj.number_of_installment; i++) {
        var now = new Date(+obj.first_installment_date);

        let date = new Date(
          now.getFullYear(),
          now.getMonth() + i,
          now.getDate()
        ).getTime();

        console.log(date);
        let iObj = {
          installment_count: i + 1,
          amount: obj?.emi,
          status: 0,
          date,
        };
        installment_status.push(iObj);
      }
      obj = { ...obj, installment_status };
    }
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
      if (popupInfo?.type === "approved") {
        GetCaseData(obj.case_uuid);
      }
      onSave();
    }
  };
  const uploadForm = async (e) => {
    e?.preventDefault();
    const response = await axios({
      method: "post",
      url: "/formList/postFiledForm",
      data: { ...form, case_uuid: data.case_uuid },
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) {
      if (formConfirm) {
        setFormConfirm(true);
        submitHandler();
      } else setFormPopup(false);
    }
  };
  const EMI = useMemo(() => {
    let L = +data?.loan_amt || 0;
    let N = +data.number_of_installment || 0;
    let I = +data.interest || 0;
    let value =
      emiType === "flat"
        ? ((L + (N * L * I) / 1200) / (N || 1) || 0).toFixed(2)
        : (pmt(I / 1200, N, L) || 0).toFixed(2);
    setdata((prev) => ({ ...prev, emi: value }));
    return value;
  }, [data?.loan_amt, data.number_of_installment, data.interest, emiType]);

  return (
    <div className="overlay">
      <div
        className="modal"
        style={{ height: "fit-content", width: "fit-content" }}
      >
        {skipPopup ? (
          <div
            className="content"
            style={{
              height: "fit-content",
              padding: "20px",
              width: "fit-content",
            }}
          >
            <div style={{ overflowY: "scroll" }}>
              <form
                className="form"
                onSubmit={(e) => {
                  e.preventDefault();
                  setFormPopup(true);
                  setSkipPopup(false);
                }}
              >
                <div className="row">
                  <h1>Emty Form</h1>
                </div>

                <button
                  type="button"
                  className="submit"
                  onClick={() => {
                    setFormConfirm(true);
                    submitHandler();
                  }}
                >
                  Skip
                </button>
                <button type="submit" className="submit">
                  Form
                </button>
              </form>
            </div>
          </div>
        ) : formPopup ? (
          <div
            className="content"
            style={{
              height: "fit-content",
              padding: "20px",
              width: "fit-content",
            }}
          >
            <div style={{ overflowY: "scroll", paddingTop: "30px" }}>
              <form className="form" onSubmit={uploadForm}>
                <div className="row">
                  <h1>{form.form_title} </h1>
                </div>

                <div className="form">
                  {form?.feilds?.map((a) => (
                    <>
                      <div className="row">
                        <label className="selectLabel">
                          {a.title}
                          <input
                            type="number"
                            name="route_title"
                            className="numberInput"
                            value={
                              form.feilds.find((b) => b.uuid === a.uuid)?.value
                            }
                            onChange={(e) =>
                              setForm((prev) => ({
                                ...prev,
                                feilds: form.feilds.map((b) =>
                                  b.uuid === a.uuid
                                    ? { ...b, value: e.target.value }
                                    : b
                                ),
                              }))
                            }
                          />
                        </label>
                      </div>
                    </>
                  ))}
                </div>

                <button type="submit" className="submit">
                  Save
                </button>
              </form>
            </div>
            <button onClick={onSave} className="closeButton">
              x
            </button>
          </div>
        ) : (
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
                {popupInfo?.type === "approved" ||
                popupInfo?.type === "reject" ? (
                  <>
                    {" "}
                    <div className="row">
                      <h1>Confirm {popupInfo?.type} </h1>
                    </div>
                  </>
                ) : popupInfo?.type === "charges" ? (
                  <>
                    <div className="row">
                      <h1>Menual Charges </h1>
                    </div>
                    <div className="form">
                      <div className="row">
                        <label className="selectLabel">
                          Title
                          <input
                            type="text"
                            name="route_title"
                            className="numberInput"
                            value={data?.title}
                            onChange={(e) =>
                              setdata((prev) => ({
                                ...prev,
                                title: e.target.value,
                              }))
                            }
                          />
                        </label>
                      </div>
                      <div className="row">
                        <label className="selectLabel">
                          Amount
                          <input
                            type="number"
                            name="route_title"
                            className="numberInput"
                            value={data?.amount}
                            onChange={(e) =>
                              setdata((prev) => ({
                                ...prev,
                                amount: e.target.value,
                              }))
                            }
                          />
                        </label>
                      </div>
                    </div>
                  </>
                ) : popupInfo?.type === "disbursed" ? (
                  <>
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
                                  e.target.value?.length < 4
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
                                  e.target.value?.length < 10
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
                                  e.target.value?.length < 4
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
                          <DatePicker
                            id="date-from"
                            className="numberInput"
                            dateFormat="d/M/y"
                            selected={data.disbursal_date}
                            onChange={(e) =>
                              setdata((prev) => {
                                let time = new Date(e).getTime() + 2716200000;

                                return {
                                  ...prev,
                                  disbursal_date: new Date(e).getTime(),
                                  first_installment_date: new Date(
                                    time
                                  ).getTime(),
                                };
                              })
                            }
                            style={{ textAlign: "center" }}
                            wrapperClassName=""
                            shouldCloseOnSelect={false}
                            isCalendarOpen={true}
                          />
                        </label>
                        <label className="selectLabel" >
                          First Installment Date
                          <DatePicker
                            id="date-from"
                            className="numberInput"
                            dateFormat="d/M/y"
                            minDate={data?.disbursal_date}
                            selected={data?.first_installment_date}
                            onChange={(e) =>
                              setdata((prev) => ({
                                ...prev,
                                first_installment_date: new Date(e),
                              }))
                            }
                            style={{ textAlign: "center" }}
                            wrapperClassName=""
                            shouldCloseOnSelect={false}
                            isCalendarOpen={true}
                          />
                        </label>
                      </div>
                    </div>

                    <button
                      className="submit"
                      style={{ background: "none", color: "#000" }}
                      type="button"
                    >
                      Difference:{Difference}
                    </button>
                    <button
                      className="submit"
                      type="button"
                      style={{ background: "none", color: "#000" }}
                    >
                      EMI:{EMI}
                    </button>
                    <label className="selectLabel" style={{ width: "150px" }}>
                      <Select
                        options={[
                          { value: "flat", label: "Flat" },
                          { value: "reduceing", label: "Reducing" },
                        ]}
                        onChange={(doc) => {
                          setEmiType(doc.value);
                        }}
                        value={{
                          value: emiType,
                          label: emiType === "flat" ? "Flat" : "Reducing",
                        }}
                        openMenuOnFocus={true}
                        menuPosition="fixed"
                        menuPlacement="auto"
                        placeholder="Select"
                      />
                    </label>
                  </>
                ) : (
                  ""
                )}
                {popupInfo.type === "disbursed" ? (
                  <button
                    className="submit"
                    type="button"
                    style={{ width: "100px" }}
                    onClick={() => setFormPopup(true)}
                  >
                    Form
                  </button>
                ) : (
                  ""
                )}
                <button type="submit" className="submit">
                  {popupInfo?.type === "approved" ||
                  popupInfo?.type === "reject"
                    ? "Confirm"
                    : "Save changes"}
                </button>
              </form>
            </div>
            <button onClick={onSave} className="closeButton">
              x
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
