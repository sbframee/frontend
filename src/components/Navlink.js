import React, { useState } from "react";
import { Box, Tabs, Tab } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import SwipeableViews from "react-swipeable-views";

const Navlink = () => {
  const [activeTab, setActiveTab] = useState(0);
  const navigate = useNavigate();
  const StyledTab = styled((props) => <Tab disableRipple {...props} />)(
    ({ theme }) => ({
      "&.Mui-selected": {
        color: "#4ac959",
        borderBottom: `2px solid #4ac959 `,
      },
    })
  );

  const panels = [
    { index: 0, name: "NewOrder", url: "/newOrder" },
    { index: 1, name: "Design", url: "/design" },
    { index: 2, name: "PrintSk", url: "/printsk" },
    { index: 3, name: "PrintOther", url: "/printOther" },
    { index: 4, name: "Binding", url: "/binding" },
    { index: 5, name: "Fitting", url: "/fitting" },
    { index: 3, name: "Ready", url: "/ready" },
    { index: 4, name: "HoldSK", url: "/holdSk" },
    { index: 5, name: "Customer", url: "/customer" },
  ];

  const handleChange = (event, newValue) => {
    setActiveTab(newValue);
    navigate(panels[newValue].url);
  };

  const handleTabClick = (index) => {
    setActiveTab(index);
    navigate(panels[index].url);
  };

  return (
    <>
      <Box>
        <Tabs
          value={activeTab}
          onChange={handleChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          {panels.map((item, i) => (
            <StyledTab
              key={i}
              label={item.name}
              onClick={() => handleTabClick(i)}
            />
          ))}
        </Tabs>
      </Box>

      <SwipeableViews
        axis="x"
        index={activeTab}
        onChangeIndex={handleChange}
        enableMouseEvents
      >
        {panels.map((item, i) => (
          <div key={i} style={{ height: "100%" }}>
            {/* Content for each tab */}
          </div>
        ))}
      </SwipeableViews>
    </>
  );
};

export default Navlink;
