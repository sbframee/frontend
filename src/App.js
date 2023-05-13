import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import axios from "axios";
import MainAdmin from "./Pages/MainAdmin";
import AgentsPage from "./Pages/Master/AgentsPage";
import ArticalsPage from "./Pages/Master/ArticalsPages";
import UsersPage from "./Pages/Master/UsersPage";
import LoginPage from "./LoginPage";
import { useEffect, useState } from "react";
import CustomerPage from "./Pages/Master/CustomersPage";
import AddOrder from "./Pages/AddOrder/AddOrder";
import AllCases from "./Pages/Reports/AllCases";
import UpcomingEmi from "./Pages/Reports/UpcomingEmi";
import AllPayments from "./Pages/Reports/AllPayments";
import ChargesPage from "./Pages/Master/ChargesPage";
import AllCustomers from "./Pages/Reports/AllCustomers";
import Forms from "./Pages/Master/Forms";
import DealerPage from "./Pages/Master/Dealer";

function App() {
  const [userType, setUserType] = useState(sessionStorage.getItem("userType"));
  //axios.defaults.baseURL = "http://3.7.152.69:9000/";
  axios.defaults.baseURL = "http://localhost:5000";

  const getUserType = async () => {
    let user_uuid = localStorage.getItem("user_uuid");
    if (user_uuid) {
      const response = await axios({
        method: "get",
        url: "users/GetUser/" + user_uuid,

        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(response.data.result.user_type);
      if (response.data.success)
        setUserType(response.data.result.user_type || false);
      sessionStorage.setItem("userType", response.data.result.user_type);
    }
  };
  useEffect(() => {
    document.title = localStorage.getItem("firm_title") || "Firm";
    if (userType === "1") return;
    getUserType();
  }, [userType]);
  console.log(userType);
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Navigate replace to={"/admin"} />} />

          {userType === "1" ? (
            <>
              <Route path="/admin" element={<MainAdmin />} />
              <Route path="*" element={<Navigate replace to={"/admin"} />} />
              <Route path="/admin/agents" element={<AgentsPage />} />
              <Route path="/admin/articals" element={<ArticalsPage />} />
              <Route path="/admin/customers" element={<CustomerPage />} />
              <Route path="/admin/addCase" element={<AddOrder />} />
              <Route path="/admin/cases" element={<AllCases />} />
              <Route path="/admin/upcomingEmi" element={<UpcomingEmi />} />
              <Route path="/admin/allPayments" element={<AllPayments />} />
              <Route path="/admin/charges" element={<ChargesPage />} />
              <Route path="/admin/allCustomers" element={<AllCustomers />} />
              <Route path="/admin/forms" element={<Forms />} />
              <Route path="/admin/dealer" element={<DealerPage />} />
              <Route path="/admin/users" element={<UsersPage />} />
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
