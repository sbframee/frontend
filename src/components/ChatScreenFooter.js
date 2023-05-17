import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import AddCasePopup from "./AddCasePopup"
import './style.css';
import axios from "axios";

let initials = {
  case_uuid: "",
  customer_uuid: "",
  article_uuid: "",
  agent_uuid: "",
  firm_uuid: localStorage.getItem("firm_uuid"),
  created_by: localStorage.getItem("user_uuid"),
  disbursal_date: "",
  // emi_date: "",
  interest: "",
  loan_amt: "",
  disbursal_status: 0,
  first_installment_date: "",
  number_of_installment: "",
  down_payment: "",
  stage: "",
  case_number: "",
  current_stage: 0,
  article_category: "",
  article_category_uuid: "",
  article_sub_category: "",
  guarantor_uuid: "",
  dealer_uuid: "",
};


export default function ChatScreenFooter() {
  const [order, setOrder] = useState(initials);
  const [newCaseForm, setNewCaseForm] = useState(false);
  const [customersData, setCustomersData] = useState([]);

  const getItemsData = async () => {
    const response = await axios({
      method: "get",
      url: "/customers/GetCustomersList",

      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log(response);
    if (response.data.success) setCustomersData(response.data.result);
  };
  useEffect(() => {
    getItemsData();
  }, []);

  const customersOptions = useMemo(
    () =>
      customersData.map((a) => ({
        value: a.customer_uuid,
        label:
          a?.customer_firstname +
          " " +
          a?.customer_middlename +
          " " +
          a?.customer_lastname +
          (a?.mobile.length
            ? ", " +
              a?.mobile.map((a, i) => (i === 0 ? a.number : ", " + a.number))
            : ""),
      })),
    [customersData]
  );
 
    return (
        <>  
          <span className="input-addon">

          </span>
          <span className="golden-btn">
          <Link style={{ textDecoration: 'none',  color: 'rgb(120,50,5)' }} > <i className="fa fa-plus in-float" onClick={() => setNewCaseForm("Case")}></i></Link>
          </span>
          {newCaseForm ? (
      <AddCasePopup
        onSave={(data, condition) => {
          console.log(data);
          if (newCaseForm === "Case")
            setOrder((prev) => ({
              ...prev,
              customer_uuid: data?.customer_uuid,
            }));
          else
            setOrder((prev) => ({
              ...prev,
              guarantor_uuid: data?.customer_uuid,
            }));
          getItemsData();
          setNewCaseForm(false);
        }}
        // popupInfo={popupForm}
        name={newCaseForm}
      />
    ) : (
      ""
    )}
  
       </>
       
    );
}
   