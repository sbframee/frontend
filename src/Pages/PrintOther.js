import React, { useState } from "react";

const PrintOther = () => {
    const [isOpen, setIsOpen] = useState(true);
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
            <h1>Print Other</h1>
          </div>
          <button className="closeButton" onClick={handleClose}>
            X
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrintOther;
