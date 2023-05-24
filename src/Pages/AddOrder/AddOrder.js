/* eslint-disable react-hooks/exhaustive-deps */
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
export default function AddOrder({onSave}) {
  const [order, setOrder] = useState(initials);
  const [customersData, setCustomersData] = useState([]);
  const [mobileno, setMobileNo] = useState('');
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState('');
  const [states, setStates] = useState([]);
  const [state, setState] = useState('');
  const [cities, setCities] = useState([]);
  const [city, setCity] = useState('');
  const [image, setImage] = useState(null);
  const [details, setDetails] = useState({ customers: [] });
  const [newCustomerForm, setNewCustomerForm] = useState(false);

  const getItemsData = async () => {
    const response = await axios({
      method: "get",
      url: "/customers/GetCustomerList",

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

  useEffect(() => {
    axios.get('http://localhost:5000/country/getCountries')
      .then(response => setCountries(response.data))
      .catch(error => console.log(error));
  }, []);

  const onCountryChange = event => {
    setCountry(event.target.value);
    setState('');
    setCity('');
    axios.get(`http://localhost:5000/state/getStates?country=${event.target.value}`)
      .then(response => setStates(response.data))
      .catch(error => console.log(error));
  };


  const onStateChange = event => {
    setState(event.target.value);
    setCity('');
    axios.get(`http://localhost:5000/city/getCities?country=${country}&state=${event.target.value}`)
      .then(response => setCities(response.data))
      .catch(error => console.log(error));
  };

  const onCityChange = event => {
    setCity(event.target.value);
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const customersOptions = useMemo(
    () =>
      customersData.map((a) => ({
        value: a.customer_uuid,
        label:
          a?.customer_name,
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
              return (
                a?.customer_name 
              );
            })(),
          }
        : "",
    [customersData, order]
  );

  const getDetails = async (type, customer_uuid) => {
    const response = await axios({
      method: "get",
      url: "/documents/GetDocuments/" + customer_uuid,

      headers: {
        "Content-Type": "application/json",
      },
    });
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
    const formData = new FormData();
    formData.append('mobileno', mobileno);
    formData.append('country', country);
    formData.append('state', state);
    formData.append('city', city);
    formData.append('image', image);

      if(mobileno.length < 10) {
        alert("Mobile number shoild be at least 10 digits ")
        return;
      }
      else if(mobileno.length > 10) {
        alert("Mobile number shoild be at least 10 digits ")
        return;
      }
    axios.post("http://localhost:5000/cases/postCase", formData).then((response) => {
      console.log(response.data);
      if (response.data.success) {
        setOrder(initials);
      }
    });
  };
  
  return (
    <>
    
          <div className="overlay">
           
            <div className="modal"
              style={{  right: "125px"}}>
            <div className="content">
              <div className="row">
                <h2>Add Case </h2>
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
                        width:"fit-content",
                          top: 0,
                      }}
                    >
                      <Add />
                    </button>
                    
                </label>
              </div>
              <br />
              <div className="row">
                <label className="selectLabel" style={{ width: "100%" }}>
                  Mobile No
                  <input
                    type="text"
                    name="mobileno"
                    className="numberInput"
                    value={mobileno}
                    onChange={event => setMobileNo(event.target.value)}
                  />
                </label>
              </div>
              <div className="row">
                <label className="selectLabel" style={{ width: "100%" }}>
                  Country
                  <select id="country" className="numberInput" value={country} onChange={onCountryChange}>
          <option value="">Select a country</option>
          {countries.map(({ name }) => <option key={name} value={name}>{name}</option>)}
        </select>
                </label>  
                </div>
                <div className="row"> 
                {country ? (
                  <label className="selectLabel" style={{ width: "100%" }}>
                    State
                    <select id="state" className="numberInput" value={state} onChange={onStateChange} disabled={!country}>
          <option value="">Select a state</option>
          {states.map(({ name }) => <option key={name} value={name}>{name}</option>)}
        </select>     
                  </label>
                ) : (
                  ""
                )}
                 </div>
                 <div className="row"> 
{state ? (
                  <label className="selectLabel" style={{ width: "100%" }}>
                    City
                    <select id="city" value={city} className="numberInput" onChange={onCityChange} disabled={!state}>
          <option value="">Select a city</option>
          {cities.map(({ name }) => <option key={name} value={name}>{name}</option>)}
        </select>
                  </label>
                ) : (
                  ""
                )}
                        
                        </div>
                        <div className="row">
                <label className="selectLabel">
                  Image:
                   <input type="file" accept="image/*" onChange={handleImageChange} />
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
          // popupInfo={popupForm}
          name={newCustomerForm}
        />
      ) : (
        ""
      )}
      
    </>
  );
}

