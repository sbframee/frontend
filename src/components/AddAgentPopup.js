import axios from "axios";
import React, { useState, useEffect } from "react";

function AddAgentPopup({ onSave, popupInfo }) {
  const [data, setdata] = useState({});

  const [errMassage, setErrorMassage] = useState("");

  useEffect(() => {
    if (popupInfo?.type === "edit") setdata({ ...popupInfo?.data });
    else setdata({ firm_uuid: localStorage.getItem("firm_uuid") });
  }, [popupInfo?.data, popupInfo?.type]);

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!data.agent_title) {
      setErrorMassage("Please insert Route Title");
      return;
    }

    if (popupInfo?.type === "edit") {
      const response = await axios({
        method: "put",
        url: "/agents/putAgent",
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
        url: "/agents/postAgent",
        data,
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.data.success) {
        onSave(response.data.result, 1);
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
                <h1>{popupInfo?.type === "edit" ? "Edit" : "Add"} Agent</h1>
              </div>

              <div className="formGroup">
                <div className="row">
                  <label className="selectLabel">
                    Agent Title
                    <input
                      type="text"
                      name="route_title"
                      className="numberInput"
                      value={data?.agent_title}
                      onChange={(e) =>
                        setdata({
                          ...data,
                          agent_title: e.target.value,
                        })
                      }
                      maxLength={60}
                    />
                  </label>
                </div>
                <div className="row">
                  <label className="selectLabel">
                    Mobile
                    <input
                      type="number"
                      name="route_title"
                      className="numberInput"
                      value={data?.mobile}
                      onChange={(e) =>
                        setdata({
                          ...data,
                          mobile: e.target.value,
                        })
                      }
                      maxLength={60}
                    />
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

export default AddAgentPopup;
