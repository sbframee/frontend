import React from "react";

const CaseAggrement = ({ selectedCase }) => {
  return (
    <table
      className="user-table"
      style={{
        width: "170mm",
        border: "1px solid black",
        pageBreakInside: "auto",
        display: "block",
        fontSize: "small",
        fontWeight: "bold",
      }}
    >
      <tbody className="tbody">
        <tr style={{ border: "none" }}>
          <td style={{ textAlign: "right", width: "60mm", border: "none" }}>
            Name of Customer:
          </td>
          <td
            style={{
              textAlign: "left",
              width: "110mm",
              borderBottom: "2px solod #000",
            }}
          >
            {selectedCase.customer_firstname +
              " " +
              selectedCase.customer_middlename +
              " " +
              selectedCase.customer_lastname}
          </td>
        </tr>
        <tr style={{ border: "none" }}>
          <td style={{ textAlign: "right", width: "60mm", border: "none" }}>
            Address:
          </td>
          <td
            style={{
              textAlign: "left",
              width: "110mm",
              borderBottom: "2px solod #000",
            }}
          >
            {selectedCase.address || ".................................."}
          </td>
        </tr>
        <tr style={{ border: "none" }}>
          <td style={{ textAlign: "right", width: "60mm", border: "none" }}>
            Phone/Mobile:
          </td>
          <td
            style={{
              textAlign: "left",
              width: "110mm",
              borderBottom: "2px solod #000",
            }}
          >
            {selectedCase?.mobile?.length
              ? selectedCase.mobile?.map((a, i) =>
                  i === 0 ? a.number : ", " + a.number
                )
              : ".................................."}
          </td>
        </tr>
        <tr colSpan={2} style={{ border: "none" }}>
          <td colSpan={2} style={{ border: "none" }}>
            <hr
              style={{
                height: "5px",
                padding: "0",
                backgroundColor: "#000",
                width: "160mm",
              }}
            />
          </td>
        </tr>

        <tr style={{ border: "none" }}>
          <td style={{ textAlign: "right", width: "60mm", border: "none" }}>
            Name of Customer:
          </td>
          <td
            style={{
              textAlign: "left",
              width: "110mm",
              borderBottom: "2px solod #000",
            }}
          >
            {selectedCase.guarantor_firstname +
              " " +
              selectedCase.guarantor_middlename +
              " " +
              selectedCase.guarantor_lastname}
          </td>
        </tr>
        <tr style={{ border: "none" }}>
          <td style={{ textAlign: "right", width: "60mm", border: "none" }}>
            Address:
          </td>
          <td
            style={{
              textAlign: "left",
              width: "110mm",
              borderBottom: "2px solod #000",
            }}
          >
            {selectedCase.guarantor_address ||
              ".................................."}
          </td>
        </tr>
        <tr style={{ border: "none" }}>
          <td style={{ textAlign: "right", width: "60mm", border: "none" }}>
            Phone/Mobile:
          </td>
          <td
            style={{
              textAlign: "left",
              width: "110mm",
              borderBottom: "2px solod #000",
            }}
          >
            {selectedCase?.guarantor_mobile?.length
              ? selectedCase.guarantor_mobile?.map((a, i) =>
                  i === 0 ? a.number : ", " + a.number
                )
              : ".................................."}
          </td>
        </tr>
        <tr style={{ border: "none" }}>
          <td colSpan={2} style={{ border: "none" }}>
            <hr
              style={{
                height: "5px",
                padding: "0",
                backgroundColor: "#000",
                width: "160mm",
              }}
            />
          </td>
        </tr>
        <tr style={{ border: "none" }}>
          <td style={{ textAlign: "right", width: "60mm", border: "none" }}>
            Dealer Name :
          </td>
          <td
            style={{
              textAlign: "left",
              width: "110mm",
              borderBottom: "2px solod #000",
            }}
          >
            {selectedCase.dealer_title || ".................................."}
          </td>
        </tr>

        <tr style={{ border: "none" }}>
          <td style={{ textAlign: "right", width: "60mm", border: "none" }}>
            Agent Name:
          </td>
          <td
            style={{
              textAlign: "left",
              width: "110mm",
              borderBottom: "2px solod #000",
            }}
          >
            {selectedCase?.agent_title || ".................................."}
          </td>
        </tr>
        <tr style={{ border: "none" }}>
          <td colSpan={2} style={{ border: "none" }}>
            <hr
              style={{
                height: "5px",
                padding: "0",
                backgroundColor: "#000",
                width: "160mm",
              }}
            />
          </td>
        </tr>
        <tr style={{ border: "none" }}>
          <td style={{ textAlign: "right", width: "60mm", border: "none" }}>
            Vehicle :
          </td>
          <td
            style={{
              textAlign: "left",
              width: "110mm",
              borderBottom: "2px solod #000",
            }}
          >
            New / Old
          </td>
        </tr>

        <tr style={{ border: "none" }}>
          <td style={{ textAlign: "right", width: "60mm", border: "none" }}>
            Type :
          </td>
          <td
            style={{
              textAlign: "left",
              width: "110mm",
              borderBottom: "2px solod #000",
            }}
          >
            ..................................
          </td>
        </tr>
        <tr style={{ border: "none" }}>
          <td style={{ textAlign: "right", width: "60mm", border: "none" }}>
            Make / Brand :
          </td>
          <td
            style={{
              textAlign: "left",
              width: "110mm",
              borderBottom: "2px solod #000",
            }}
          >
            ..................................
          </td>
        </tr>
        <tr style={{ border: "none" }}>
          <td style={{ textAlign: "right", width: "60mm", border: "none" }}>
            Year Of Mfg :
          </td>
          <td
            style={{
              textAlign: "left",
              width: "110mm",
              borderBottom: "2px solod #000",
            }}
          >
            ..................................
          </td>
        </tr>
        <tr style={{ border: "none" }}>
          <td style={{ textAlign: "right", width: "60mm", border: "none" }}>
            Color :
          </td>
          <td
            style={{
              textAlign: "left",
              width: "110mm",
              borderBottom: "2px solod #000",
            }}
          >
            ..................................
          </td>
        </tr>
        <tr style={{ border: "none" }}>
          <td style={{ textAlign: "right", width: "60mm", border: "none" }}>
            Regn. No. :
          </td>
          <td
            style={{
              textAlign: "left",
              width: "110mm",
              borderBottom: "2px solod #000",
            }}
          >
            ..................................
          </td>
        </tr>
        <tr style={{ border: "none" }}>
          <td colSpan={2} style={{ border: "none" }}>
            <hr
              style={{
                height: "5px",
                padding: "0",
                backgroundColor: "#000",
                width: "160mm",
              }}
            />
          </td>
        </tr>
        <tr style={{ border: "none" }}>
          <td style={{ textAlign: "right", width: "60mm", border: "none" }}>
            Loan Amt. Rs. :
          </td>
          <td
            style={{
              textAlign: "left",
              width: "110mm",
              borderBottom: "2px solod #000",
            }}
          >
            {selectedCase?.loan_amt || ".................................."}
          </td>
        </tr>

        <tr style={{ border: "none" }}>
          <td style={{ textAlign: "right", width: "60mm", border: "none" }}>
            Period (Months) :
          </td>
          <td
            style={{
              textAlign: "left",
              width: "110mm",
              borderBottom: "2px solod #000",
            }}
          >
            {selectedCase?.number_of_installment ||
              ".................................."}
          </td>
        </tr>
        <tr style={{ border: "none" }}>
          <td style={{ textAlign: "right", width: "60mm", border: "none" }}>
            Rate Of Interst :
          </td>
          <td
            style={{
              textAlign: "left",
              width: "110mm",
              borderBottom: "2px solod #000",
            }}
          >
            {selectedCase?.interest || ".................................."}
          </td>
        </tr>
        <tr style={{ border: "none" }}>
          <td style={{ textAlign: "right", width: "60mm", border: "none" }}>
            EMI Amount Rs. :
          </td>
          <td
            style={{
              textAlign: "left",
              width: "110mm",
              borderBottom: "2px solod #000",
            }}
          >
            {selectedCase?.Emi || ".................................."}
          </td>
        </tr>
        <tr style={{ border: "none" }}>
          <td style={{ textAlign: "right", width: "60mm", border: "none" }}>
            coll. Charges Rs. :
          </td>
          <td
            style={{
              textAlign: "left",
              width: "110mm",
              borderBottom: "2px solod #000",
            }}
          >
            {selectedCase?.charges || ".................................."}
          </td>
        </tr>
      </tbody>
    </table>
  );
};

export default CaseAggrement;
