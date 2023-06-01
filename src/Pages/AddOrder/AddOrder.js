import axios from "axios";
import { useEffect, useState, useMemo } from "react";
import "./index.css";
import Select from "react-select";
import { Add } from "@mui/icons-material";
import "react-datepicker/dist/react-datepicker.css";
import AddCustomerPopup from "../../components/AddCustomerPopup";

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

export default function AddOrder({ onSave }) {
  const [order, setOrder] = useState(initials);
  const [caseType, setCaseType] = useState("New Order");
  const [customersData, setCustomersData] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [priority, setPriority] = useState("");
  const [details, setDetails] = useState({ customers: [] });
  const [newCustomerForm, setNewCustomerForm] = useState(false);
  const [latestOrderId, setLatestOrderId] = useState(0);

  const fetchLatestOrderId = async () => {
    try {
      const response = await axios.get("http://localhost:5000/cases/GetCaseList");
      const orders = response.data.result;
      if (orders.length > 0) {
        const latestOrder = orders[orders.length - 1];
        const latestOrderId = latestOrder.order_id;
        setLatestOrderId(latestOrderId);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getItemsData = async () => {
    const response = await axios.get("/customers/GetCustomerList");
    console.log(response);
    if (response.data.success) setCustomersData(response.data.result);
  };

  useEffect(() => {
    getItemsData();
    fetchLatestOrderId();
  }, []);

  useEffect(() => {
    axios
      .get("http://localhost:5000/priority/getPriorities")
      .then((response) => setPriorities(response.data))
      .catch((error) => console.log(error));
  }, []);

  const onPriorityChange = (event) => {
    setPriority(event.target.value);
  };

  const customersOptions = useMemo(
    () =>
      customersData.map((a) => ({
        value: a.customer_uuid,
        label: a?.customer_name,
      })),
    [customersData]
  );

  const customerValue = useMemo(
    () =>
      order?.customer_uuid
        ? {
            value: order?.customer_uuid,
            label: (() => {
              let a = customersData?.find(
                (j) => j.customer_uuid === order.customer_uuid
              );
              return a?.customer_name;
            })(),
          }
        : "",
    [customersData, order]
  );

  const getDetails = async (type, customer_uuid) => {
    const response = await axios.get(`/documents/GetDocuments/${customer_uuid}`);
    if (response.data.success)
      setDetails((prev) => ({ ...prev, [type]: response.data.result }));
    else setDetails((prev) => ({ ...prev, [type]: [] }));
  };

  const onCustomerChange = (doc, value) => {
    if (value.name === "customer_uuid") getDetails("customers", doc.value);
    setOrder((prev) => ({
      ...prev,
      [value.name]: doc.value,
    }));
  };

  console.log(details);

  const onSubmit = (e) => {
    e.preventDefault();
    const newOrderId = latestOrderId + 1;

    const formData = {
      customer_uuid: customerValue.value,
      priority,
      case_type: caseType,
      order_id: newOrderId, // Include the new order ID
    };

    axios
      .post("http://localhost:5000/cases/postCase", formData)
      .then((response) => {
        console.log(response.data);
        window.location.assign("/order");
        setLatestOrderId(newOrderId); // Update the latest order ID in the state
        setOrder(initials); // Reset the form
        fetchLatestOrderId(); // Fetch the latest order ID from the API
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <>
      <div>
        <div
          className="modal"
          style={{ width:"90%", height: "100vh", left: "20px", bottom: "200px"}}
        >
          <div className="content">
            <div className="row">
              <h2 style={{ paddingRight: "100px" }}>Add Case</h2>
            </div>
            <div>
              <div>
                <label className="selectLabel">
                  Customer
                  <Select
                    name="customer_uuid"
                    options={customersOptions}
                    onChange={onCustomerChange}
                    value={customerValue}
                    openMenuOnFocus={true}
                    menuPosition="fixed"
                    menuPlacement="auto"
                    placeholder="Select"
                  />
                  <button
                    type="button"
                    onClick={() => setNewCustomerForm("Customer")}
                    className="item-sales-search"
                    style={{
                      width: "fit-content",
                      top: 0,
                    }}
                  >
                    <Add />
                  </button>
                </label>
              </div>

              <div className="row">
                <label className="selectLabel" style={{ width: "100%" }}>
                  Priority
                  <select
                    id="priority"
                    className="numberInput"
                    value={priority}
                    onChange={onPriorityChange}
                  >
                    <option value="">Select</option>
                    {priorities.map(({ name }) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="bottomContent" style={{ padding: "20px" }}>
                <button type="button" onClick={onSubmit}>
                  Save
                </button>
              </div>
              <button onClick={onSave} className="closeButton">
                x
              </button>
            </div>
          </div>
        </div>
      </div>
      {newCustomerForm ? (
        <AddCustomerPopup
          onSave={(data, condition) => {
            console.log(data);
            if (newCustomerForm === "Customer")
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
            setNewCustomerForm(false);
          }}
          name={newCustomerForm}
        />
      ) : (
        ""
      )}
    </>
  );
}
