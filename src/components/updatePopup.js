import axios from "axios";
import { useEffect, useState } from "react";
import "../index.css";

export default function UpdatePopup({ onSave, selectedOrderId, onClose }) {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [data, setData] = useState({ case_type: "", case_name: "" });
  const [errMessage, setErrorMessage] = useState("");
  const [priorities, setPriorities] = useState([]);
  const [priorityName, setPriorityName] = useState([]);
  const [customerDetails, setCustomerDetails] = useState({});

  useEffect(() => {
    fetchCaseTypes();
    fetchCaseNames();
    fetchCaseDetails();
  }, [selectedOrderId]);

  const fetchCaseTypes = () => {
    axios
      .get("http://localhost:5000/priority/getCaseType")
      .then((response) => setPriorities(response.data))
      .catch((error) => console.error(error));
  };

  const fetchCaseNames = () => {
    axios
      .get("http://localhost:5000/priority/getCaseName")
      .then((response) => setPriorityName(response.data))
      .catch((error) => console.error(error));
  };

  const fetchCaseDetails = async () => {
    if (selectedOrderId) {
      try {
        const orderResponse = await axios.get(`http://localhost:5000/cases/GetCaseDetails/${selectedOrderId}`);
        const orderData = orderResponse.data.result;
        console.log("Order Data:", orderData);
        setSelectedOrder(orderData);
        console.log("Customer UUID:", orderData.customer_uuid);
  
        setData((prevState) => ({
          ...prevState,
          case_type: orderData.case_type,
          case_name: orderData.case_name,
        }));
  
        // Fetch customer details based on customer_uuid
        try {
          const customerResponse = await axios.get(`http://localhost:5000/customers/getCustomerDetails/${orderData.customer_uuid}`);
          const customerData = customerResponse.data.result;
          console.log("Customer Data:", customerData);
          setCustomerDetails(customerData);
        } catch (error) {
          console.error(error);
          setCustomerDetails({});
        }
      } catch (error) {
        console.error(error);
      }
    }
  };
   
  const onPriorityChange = (event) => {
    const selectedCaseType = event.target.value;
    setData((prevState) => ({
      ...prevState,
      case_type: selectedCaseType,
    }));
  };

  const onNameChange = (event) => {
    const selectedCaseName = event.target.value;
    setData((prevState) => ({
      ...prevState,
      case_name: selectedCaseName,
    }));
  };

  const submitHandler = async (e) => {

    if (!data.case_type) {
      setErrorMessage("Please select a case type");
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:5000/cases/putCases/${selectedOrderId}`,
        {
          case_type: data.case_type,
          case_name: data.case_name,
        }
      );

      if (response.data.success) {
        const updatedOrder = { ...selectedOrder, ...data };
        onSave(updatedOrder);
        onClose();
      } else {
        setErrorMessage("Failed to update case");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <div>
        <div
          className="modal"
          style={{
            width: "90%",
            height: "100vh",
            left: "20px",
            bottom: "100px",
          }}
        >
          <div className="content">
            <div className="row">
              <h2 style={{ paddingRight: "100px" }}>Update</h2>
            </div>
            <div>
              <form>
              {customerDetails && customerDetails.customer_name && (
  <div>
    <label className="selectLabel">
      Name
      <input type="text" value={customerDetails.customer_name} readOnly />
    </label>
  </div>
)}
{customerDetails && customerDetails.mobile && (
  <div>
    <label className="selectLabel">
      Mobile Number
      <input type="text" value={customerDetails.mobile} readOnly />
    </label>
  </div>
)}


                <div className="row">
                  <label className="selectLabel" style={{ width: "100%" }}>
                    Select type
                    <select
                      id="priority"
                      value={data.case_type}
                      onChange={onPriorityChange}
                    >
                      <option value="">Select</option>
                      {priorities.map((caseType) => (
                        <option key={caseType} value={caseType}>
                          {caseType}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="row">
                  <label className="selectLabel" style={{ width: "100%" }}>
                    Select name
                    <select
                      id="priorityName"
                      value={data.case_name}
                      onChange={onNameChange}
                    >
                      <option value="">Select</option>
                      {priorityName.map((caseName) => (
                        <option key={caseName} value={caseName}>
                          {caseName}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                {errMessage && <p>{errMessage}</p>}

                <div className="bottomContent" style={{ padding: "20px" }}>
                  <button type="submit" onClick={() => { submitHandler(); onClose(); }}>
                    Update
                  </button>
                </div>
                <button onClick={onClose} className="closeButton">
                x
              </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
