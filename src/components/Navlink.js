import React, { useState, useEffect } from "react";
import { Box, Tabs, Tab } from "@mui/material";
import { styled } from "@mui/material/styles";
import {  useNavigate, useParams } from "react-router-dom";


const Navlink = () => {
  const [disabled, setDisabled] = useState(false);
  const [currPage, setCurrPage] = useState("/intro");
  const params = useParams();
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
    { index: 0, name: "NewOrder", url: "/newOrder" },
    { index: 1, name: "Design", url: "/design" },
    { index: 2, name: "PrintSk", url: "/printsk" },
    { index: 3, name: "PrintOther", url: "/printOther" },
    { index: 4, name: "Binding", url: "/binding" },
    { index: 5, name: "Fitting", url: "/fitting" },
  ];
 
  useEffect(() => {
    const controller = new AbortController();
    if (params.name?.includes("token-")) {
      localStorage.setItem("token", params.name);
    }
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
          
        </div>
      
    </>
  );
};

export default Navlink;
