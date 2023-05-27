import React,{useState,useEffect, useMemo} from 'react'
import axios from 'axios';

const OrderPopup = ()=> {
    const [items, setItems] = useState([]);
    
    const GetCaseData = async () => {
        const response = await axios.get("/cases/GetCaseList");
    console.log(response);
    if (response.data.success) setItems(response.data.result);
      };

      useEffect(() => {
        GetCaseData();
      }, []);

      let itemsDetails = useMemo(
        () =>
          items?.filter(
            (a) =>
              a?.order_id             
          ),
        [items]
      );

        return (
          <div className="overlay" style={{ }}>
            <div
              className="modal"  style={{ width:"90%", height: "100vh", left: "20px"}}
            >
              <div
                className="content"
              >
                <div>
                <table
        className="user-table"
        style={{
          maxWidth: "100vw",
          height: "fit-content",
          overflowX: "scroll",
        }}
      >
        <thead>
          <tr>
            <th style={{ width: "50px" }}>S.N</th>
            <th>Order ID</th>
          </tr>
        </thead>
        <tbody className="tbody">
          {itemsDetails?.map((item, i, array) => (
            <tr key={Math.random()} style={{ height: "30px" }}>
              <td>{i + 1}</td>
              <td>{(item?.order_id || "")}</td>
            </tr>
          ))}
        </tbody>
      </table>
                  
                </div>
               
              </div>
            </div>
          </div>
        );
      
      
}

export default OrderPopup