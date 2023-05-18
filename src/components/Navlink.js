import React, { useState, useEffect, useMemo } from "react";

import { motion } from "framer-motion";
import { Box, Tabs, Typography, Tab } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { v4 as uuid } from "uuid";

const Navlink = () => {
  const [disabled, setDisabled] = useState(false);
  const [currPage, setCurrPage] = useState("/intro");
  const [oneTime, setOneTime] = useState(true);
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const StyledTab = styled((props) => <Tab disableRipple {...props} />)(
    ({ theme }) => ({
      "&.Mui-selected": {
        color: "#4ac959",
        borderBottom: `2px solid #4ac959 `,
      },
    })
  );
  function checkScrollDirectionIsUp(event) {
    if (event.wheelDelta) {
      return event.wheelDelta > 0;
    }
    return event.deltaY < 0;
  }
  const panels = [
    { index: 0, name: "NewOrder", url: "/admin" },
    { index: 1, name: "Design", url: "/design" },
    { index: 2, name: "PrintSk", url: "/printsk" },
    { index: 3, name: "PrintOther", url: "/printOther" },
    { index: 4, name: "Binding", url: "/binding" },
    { index: 5, name: "Fitting", url: "/fitting" },
  ];
  const pages = useMemo(() => {
    let page1 = [
      {
        index: 0,
        name: "card1",
        
        url: "/admin",
      },
      {
        index: 1,
        name: "card2",
       
        url: "/AnyWhere",
      },
      {
        index: 2,
        name: "devices",
       
        url: "/OurClients",
      },
      {
        index: 3,
        name: "ourClients",
      
        url: "/OutletType",
      },
      {
        index: 4,
        name: "index",
       
        url: "/index",
      },
    ];
    let page2 = [
      {
        index: 0,
        name: "card1",
        
        url: "/Billing",
      },
      {
        index: 1,
        name: "card2",
       
        url: "/Integrations",
      },
      {
        index: 2,
        name: "devices",
      
        url: "/WaiterOrdering",
      },
      {
        index: 3,
        name: "ourClients",
    
        url: "/MultiUsers",
      },
      {
        index: 4,
        name: "ourClients",
       
        url: "/OrderingSite",
      },
      {
        index: 5,
        name: "ourClients",
     
        url: "/QROrdering",
      },
      {
        index: 6,
        name: "ourClients",
       
        url: "/PaymentGateway",
      },
      {
        index: 7,
        name: "ourClients",
        
        url: "/KDS",
      },
      {
        index: 8,
        name: "index",
      
        url: "/index",
      },
    ];

    let page3 = [
      {
        index: 0,
        name: "card1",
       
        url: "/pricing",
      },

      {
        index: 1,
        name: "card2",
        
        url: "/faq",
      },

      {
        index: 2,
        name: "index",
     
        url: "/index",
      },
    ];
    let page4 = [
      {
        index: 0,
        name: "card1",
       
        url: "/PartnerForm",
      },

      {
        index: 1,
        name: "index",
        
        url: "/index",
      },
    ];
    let page5 = [
      {
        index: 0,
        name: "card1",
       
      },
    ];
    // console.log(location);
    if (
      location.pathname?.includes("PartnerFormSuccess")||
      location.pathname?.includes("SignupSuccessful")||
      location.pathname?.includes("redirect")
    ) {
      return page5;
    } else if (
      location.pathname?.includes("admin") ||
      location.pathname?.includes("AnyWhere") ||
      location.pathname?.includes("OurClients") ||
      location.pathname?.includes("OutletType") ||
      (location.pathname?.includes("index") && currPage === "/intro")
    ) {
      return page1;
    } else if (
      location.pathname?.includes("Billing") ||
      location.pathname?.includes("Integrations") ||
      location.pathname?.includes("WaiterOrdering") ||
      location.pathname?.includes("MultiUsers") ||
      location.pathname?.includes("OrderingSite") ||
      location.pathname?.includes("QROrdering") ||
      location.pathname?.includes("PaymentGateway") ||
      location.pathname?.includes("KDS") ||
      (location.pathname?.includes("index") && currPage === "/Billing")
    ) {
      return page2;
    } else if (
      location.pathname?.includes("pricing") ||
      location.pathname?.includes("faq") ||
      (location.pathname?.includes("index") && currPage === "/pricing")
    ) {
      return page3;
    } else if (
      location.pathname?.includes("PartnerForm") ||
      (location.pathname?.includes("index") && currPage === "/PartnerForm")
    ) {
      return page4;
    } else {
      navigate("/intro/" + (localStorage.getItem("token") || ""));
      return [];
    }
  }, [location, navigate, currPage]);
  useEffect(() => {
    setCurrPage(pages[0]?.url);
  }, [pages]);

  const updateUrl = () => {
    console.count(2);

   
  };
  
  const newEntity = async (newPersone, controller) => {
   
    if (params.token?.includes("token-")) {
      localStorage.setItem("token", params.token);
    }

    if (!oneTime) {
      return;
    }
    setOneTime(false);
    const response = await axios({
      method: "post",
      url: "/Details/newEntry",
      signal: controller?.signal,
      data: { newPersone, location: location.pathname },
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) {
      if (newPersone) {
        let visitor_uuid = uuid();
        localStorage.setItem("visitor_uuid", visitor_uuid);
      }
      if (!localStorage.getItem("first_source"))
        localStorage.setItem(
          "first_source",

          location.pathname
        );
    }
  };
  useEffect(() => {
    const controller = new AbortController();
    if (params.name?.includes("token-")) {
      localStorage.setItem("token", params.name);
    }
    setTimeout(
      () => newEntity(!localStorage.getItem("visitor_uuid"), controller),
      1000
    );
    return () => {
      controller.abort();
    };
  }, []);

 
  const handleChange = (e, value) => {
    navigate(value.url + "/" + (localStorage.getItem("token") || ""));
    
  };
  function a11yProps(index) {
    return {
      id: index,
      "aria-controls": panels.find((a) => a.url === index),
      value: panels.find((a) => a.url === index),
    };
  }
  return (
    <>
      <Box>
        <Tabs
          value={panels.find((a) => a.url === currPage)}
          onChange={handleChange}
         
        >
          {panels.map((item, i) => {
            return (
              <StyledTab key={i} label={item.name} {...a11yProps(item.url)} />
            );
          })}
        </Tabs>
      </Box>

      
        <Box
          sx={{
            width: "100%",
            height: "calc(100vh - 1rem)",
            maxHeight: "calc(100vh - 64px)",
            overflow: "hidden",
            background: "white",
            paddingTop: "20px",
          }}
        >
          <div className="row">
            {pages.map((page, i) => (
              <motion.div
                key={i}
                className="container"
                initial={{ rotate: 1 }}
                
                transition={{
                  type: "tween",
                  bounceStifafness: 260,
                  bounceDamping: 20,
                }}
                style={{ height: "calc(80vh - 1rem)" }}
              >
                {page.component}
              </motion.div>
            ))}
            <div id="scroll-btns-container">
              {pages?.length > 1
                ? pages.map((page, i) => (
                    <button
                      key={i}
                      
                      onClick={(e) => {
                        updateUrl(i);
                      }}
                    />
                  ))
                : ""}
            </div>
          </div>
        </Box>
      
        <div
          
          className="row"
          onWheel={(e) => {
            if (disabled) {
              return;
            } else {
              if (checkScrollDirectionIsUp(e)) {
                console.log("UP");
               
                setDisabled(true);
                setTimeout(() => setDisabled(false), 500);
              } else {
                console.log("Down");
                
                setDisabled(true);
                setTimeout(() => setDisabled(false), 500);
              }
            }
          }}
        >
          {pages.map((page, i) => (
            <motion.div
              key={i}
              className="container"
              initial={{ rotate: 1 }}
              
              transition={{
                type: "tween",
                bounceStifafness: 260,
                bounceDamping: 20,
              }}
            >
              {page.component}
            </motion.div>
          ))}
          <div id="scroll-btns-container">
            {pages?.length > 1
              ? pages.map((page, i) => (
                  <button
                    key={i}
                    
                    onClick={(e) => {
                      updateUrl(i);                    
                    }}
                  />
                ))
              : ""}
          </div>
        </div>
      
    </>
  );
};

export default Navlink;
