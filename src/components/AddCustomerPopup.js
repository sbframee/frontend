import React,{useState,useEffect} from 'react'
import { v4 as uuid } from "uuid";
import { Add } from "@mui/icons-material";
import axios from 'axios';
const AddCustomerPopup = ({ onSave, popupInfo, name })=> {
        const [data, setdata] = useState({});
      
        const [errMassage, setErrorMassage] = useState("");
      
        useEffect(() => {
          if (popupInfo?.type === "edit")
            setdata({
              ...popupInfo?.data,
              mobile: popupInfo?.data?.mobile.map((a) => ({ uuid: uuid(), ...a })),
            });
          else
            setdata({
              customer_gender: "",
              customer_lastname: "",
              customer_middlename: "",
              customer_firstname: "",
              address: "",
              mobile: [{ uuid: uuid(), number: "", label: "" }],
            });
        }, [popupInfo?.data, popupInfo?.type]);
      
        const submitHandler = async (e) => {
          e.preventDefault();
      
          if (!data.customer_firstname) {
            setErrorMassage("Please insert User Title");
            return;
          }
      
          if (popupInfo?.type === "edit") {
            const response = await axios({
              method: "put",
              url: "/customers/putCustomers",
              data: [data],
              headers: {
                "Content-Type": "application/json",
              },
            });
            if (response.data.result[0].success) {
              
              onSave(data);
            }
          } else {
            const response = await axios({
              method: "post",
              url: "/customers/postCustomer",
              data,
              headers: {
                "Content-Type": "application/json",
              },
            });
            if (response.data.success) {
              onSave(response.data.result,1);
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
                      <h1>{popupInfo?.type === "edit" ? "Edit" : "Add"} {name}</h1>
                    </div>
      
                    <div className="formGroup">
                      <div className="row">
                        <label className="selectLabel">
                          First Name
                          <input
                            type="text"
                            name="route_title"
                            className="numberInput"
                            value={data?.customer_firstname}
                            onChange={(e) =>
                              setdata({
                                ...data,
                                customer_firstname: e.target.value,
                              })
                            }
                            maxLength={60}
                          />
                        </label>
      
                        <label className="selectLabel">
                          Middle Name
                          <input
                            type="text"
                            name="route_title"
                            className="numberInput"
                            value={data?.customer_middlename}
                            onChange={(e) =>
                              setdata({
                                ...data,
                                customer_middlename: e.target.value,
                              })
                            }
                            maxLength={60}
                          />
                        </label>
      
                        <label className="selectLabel">
                          Last Name
                          <input
                            type="text"
                            name="route_title"
                            className="numberInput"
                            value={data?.customer_lastname}
                            onChange={(e) =>
                              setdata({
                                ...data,
                                customer_lastname: e.target.value,
                              })
                            }
                            maxLength={60}
                          />
                        </label>
                      </div>
                      <div className="row">
                        <label className="selectLabel">
                          Gender
                          <select
                            type="text"
                            name="route_title"
                            className="numberInput"
                            value={data?.customer_gender}
                            onChange={(e) =>
                              setdata({
                                ...data,
                                customer_gender: e.target.value,
                              })
                            }
                            maxLength={60}
                          >
                            <option value="">None</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Others">Others</option>
                          </select>
                        </label>
                        <label className="selectLabel">
                          Date Of Birth
                          <input
                            type="date"
                            name="route_title"
                            className="numberInput"
                            value={data?.dob}
                            onChange={(e) =>
                              setdata({
                                ...data,
                                dob: e.target.value,
                              })
                            }
                            maxLength={60}
                          />
                        </label>
                        <label className="selectLabel">
                          Address
                          <input
                            type="text"
                            name="route_title"
                            className="numberInput"
                            value={data?.address}
                            onChange={(e) =>
                              setdata({
                                ...data,
                                address: e.target.value,
                              })
                            }
                            maxLength={60}
                          />
                        </label>
                      </div>
                      <div className="row">
                        <label className="selectLabel" style={{ width: "100%" }}>
                          Mobiles
                          {data?.mobile?.map((a) => (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                width: "100%",
                              }}
                            >
                              <input
                                key={a.uuid}
                                type="text"
                                name="route_title"
                                className="numberInput"
                                placeholder="Number"
                                value={
                                  data?.mobile.find((b) => b.uuid === a.uuid)?.number
                                }
                                onChange={(e) =>
                                  setdata((prev) => ({
                                    ...prev,
                                    mobile: prev?.mobile?.map((b) =>
                                      a.uuid === b.uuid
                                        ? { ...b, number: e.target.value }
                                        : b
                                    ),
                                  }))
                                }
                                maxLength={60}
                              />
                              <input
                                key={a.uuid}
                                type="text"
                                name="route_title"
                                className="numberInput"
                                placeholder="lable"
                                value={
                                  data?.mobile.find((b) => b.uuid === a.uuid)?.label
                                }
                                onChange={(e) =>
                                  setdata((prev) => ({
                                    ...prev,
                                    mobile: prev.mobile.map((b) =>
                                      a.uuid === b.uuid
                                        ? { ...b, label: e.target.value }
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
                                mobile: [
                                  ...prev.mobile,
                                  { uuid: uuid(), number: "", lable: "" },
                                ],
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

export default AddCustomerPopup