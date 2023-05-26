import React, { useState } from "react";
import { Link } from "react-router-dom";
import AddOrder from "../Pages/AddOrder/AddOrder";
import './style.css';


export default function ChatScreenFooter() {
  const [newCaseForm, setNewCaseForm] = useState(false);
 
    return (
        <>  
          <span className="input-addon">

          </span>
          <span className="golden-btn">
          <Link style={{ textDecoration: 'none',  color: 'rgb(120,50,5)' }} > <i className="fa fa-plus in-float" onClick={() => setNewCaseForm("Case")}></i></Link>
          </span>
          {newCaseForm ? (
      <AddOrder
        onSave={(data, condition) => {
          console.log(data);
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
   