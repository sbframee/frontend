import React from "react";
import "./style.css";
import NavLink from "./Navlink";
import { AutoAwesomeMosaicOutlined as MasterIcon } from "@mui/icons-material";
import AssessmentIcon from "@mui/icons-material/Assessment";
import AddIcon from "@mui/icons-material/Add";

const Sidebar = () => {
  return (
    <div className="left-panel" style={{ position: "relative" }}>
      <div className="nav" style={{ height: "100vh", paddingTop: "80px" }}>
        <NavLink
          title="New"
          icon={<AddIcon sx={{ fontSize: 50 }} />}
          // href="/admin/addOrder"
          isActive={false}
          menuList={[
            {
              name: "Add Case",
              link: "/admin/addCase",
            },
            {
              name: "Add Customer",
              link: "/admin/customers",
            },
          ]}
        />
        <NavLink
          title={"Master"}
          icon={<MasterIcon sx={{ fontSize: 50 }} />}
          isActive={true}
          menuList={[
            {
              name: "Agents",
              link: "/admin/agents",
            },
            {
              name: "Articles",
              link: "/admin/articals",
            },
            {
              name: "Users",
              link: "/admin/users",
            },
            {
              name: "Charges",
              link: "/admin/charges",
            },
            {
              name: "Dealers",
              link: "/admin/dealer",
            },
            {
              name: "Forms",
              link: "/admin/forms",
            },
          ]}
        />

        <NavLink
          title={"Report"}
          icon={<AssessmentIcon sx={{ fontSize: 50 }} />}
          isActive={false}
          menuList={[
            {
              name: "All Cases",
              link: "/admin/cases",
            },
            {
              name: "Upcoming EMI",
              link: "/admin/upcomingEmi",
            },
            {
              name: "All Payments",
              link: "/admin/allPayments",
            },
            {
              name: "All Customers",
              link: "/admin/allCustomers",
            },
            
          ]}
        />
        
      </div>
    </div>
  );
};

export default Sidebar;
