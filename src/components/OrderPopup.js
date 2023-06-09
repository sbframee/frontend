import React, { useState, useEffect } from "react";
import axios from "axios";

const OrderPopup = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [latestOrderID, setLatestOrderID] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:5000/cases/latest")
      .then((response) => {
        setLatestOrderID(response.data.latestOrderID);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    window.location.assign("/admin");
  };

  if (!isOpen) {
    return null; // Don't render the popup if isOpen is false
  }

  return (
    <div className="overlay" style={{}}>
      <div className="modal" style={{ width: "90%", height: "100vh", left: "20px" }}>
        <div className="content">
          <div>
            <table
              className="user-table"
              style={{ maxWidth: "100vw", height: "fit-content", overflowX: "scroll" }}
            >
              <thead>
                <tr>
                  <th style={{ width: "50px" }}>S.N</th>
                  <th>Order ID</th>
                </tr>
              </thead>
              <tbody className="tbody">
                <tr>
                  <td>1</td>
                  <td>{latestOrderID || ""}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <button className="closeButton" onClick={handleClose}>
            X
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderPopup;
