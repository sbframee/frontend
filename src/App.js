import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import axios from "axios";
import MainAdmin from "./Pages/MainAdmin";
import LoginPage from "./LoginPage";
import {  useState } from "react";
import AddOrder from "./Pages/AddOrder/AddOrder";
import AllCases from "./Pages/Reports/AllCases";
import UpcomingEmi from "./Pages/Reports/UpcomingEmi";
import AllPayments from "./Pages/Reports/AllPayments";
import ChargesPage from "./Pages/Master/ChargesPage";
import AllCustomers from "./Pages/Reports/AllCustomers";
import OrderPopUp from "./components/OrderPopup";
import Design from "./Pages/Design";
import PrintSk from "./Pages/PrintSk";
import PrintOther from "./Pages/PrintOther";
import Binding from "./Pages/binding";
import Fitting from "./Pages/fitting";
import Ready from "./Pages/ready";
import HoldSK from "./Pages/HoldSk";
import Customer from "./Pages/Customer";

function App() {
  const [userType, setUserType] = useState(sessionStorage.getItem("userType"));
  //axios.defaults.baseURL = "http://43.205.62.206:5000";
  axios.defaults.baseURL = "http://localhost:5000";

  
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Navigate replace to={"/admin"} />} />

          {userType === "1" ? (
            <>
              <Route path="/admin" element={<MainAdmin />} />
              <Route path="*" element={<Navigate replace to={"/admin"} />} />
              <Route path="/admin/addCase" element={<AddOrder />} />
              <Route path="/admin/cases" element={<AllCases />} />
              <Route path ="/design" element={<Design />} />
              <Route path ="/printsk" element={<PrintSk />} />
              <Route path ="/printOther" element={<PrintOther />} />
              <Route path="/binding" element={<Binding />} />
              <Route path ="/fitting" element={<Fitting />} />
              <Route path ="/ready" element={<Ready />} />
              <Route path="/holdSk" element={<HoldSK />} />
              <Route path ="/customer" element={<Customer />} />
              <Route path ="/order" element={<OrderPopUp />} />
              <Route path="/admin/upcomingEmi" element={<UpcomingEmi />} />
              <Route path="/admin/allPayments" element={<AllPayments />} />
              <Route path="/admin/charges" element={<ChargesPage />} />
              <Route path="/admin/allCustomers" element={<AllCustomers />} />
            </>
          ) : (
            <>
              <Route path="*" element={<Navigate replace to={"/login"} />} />
              <Route
                path="/login"
                element={<LoginPage setUserType={setUserType} />}
              />
            </>
          )}
        </Routes>
      </Router>
    </div>
  );
}

export default App;
