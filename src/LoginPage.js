import axios from "axios";
import React, { useState } from "react";


const LoginPage = ({setUserType}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState({
    login_username: "",
    login_password: "",
  });

  // const Navigate = useNavigate();
  const loginHandler = async () => {
    try {
      setIsLoading(true);

      // if (userData.login_username === id) {
      //   localStorage.setItem("user_uuid", id);
      //   localStorage.setItem("firm_uuid", "Admin");
      //   window.location.assign("/admin");
      //   return;
      // }
      const response = await axios({
        method: "post",
        url: "/users/loginUser",
        data: userData,
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status !== 200) return setIsLoading(false);

      
      if (response.status !== 200) return setIsLoading(false);

      if (response.data.success) {
        let data = response.data.result;
        localStorage.setItem("user_uuid", data.user_uuid);
        localStorage.setItem("user_title", data.user_title);
     
        localStorage.setItem("firm_uuid",data.firm_uuid);
        localStorage.setItem("firm_title",data.firm_title);
        setUserType(data.user_type || false);
        sessionStorage.setItem("userType", data.user_type);
        if (+data.user_type===1) {
          window.location.assign("/admin");
          return;
        }}
    } catch (error) {
      setIsLoading(false);
    }
  };
  return (
    <div
      id="login-container"
      onKeyDown={(e) => (e.key === "Enter" ? loginHandler() : "")}
    >
      {/* <div className="foodDoAdmin"><img src={foodDoAdmin} alt="" /></div> */}

      <div className="form">
        <h1>Sign In</h1>
        <div className="input-container">
          <label htmlFor="username" className="form-label">
            Username
          </label>
          <input
            type="username"
            className="form-input"
            name="username"
            id="username"
            value={userData?.user_id}
            onChange={(e) =>
              setUserData((prev) => ({
                ...prev,
                user_id: e.target.value,
              }))
            }
            autoComplete="off"
            required
          />
        </div>

        <div className="input-container">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            type="password"
            className="form-input"
            name="password"
            id="password"
            value={userData.user_password}
            onChange={(e) =>
              setUserData((prev) => ({
                ...prev,
                user_password: e.target.value,
              }))
            }
            minLength="5"
            autoComplete="off"
            required
          />
        </div>

        {!isLoading ? (
          <button className="submit-btn" onClick={loginHandler}>
            Log In
          </button>
        ) : (
          <button className="submit-btn" id="loading-screen">
            <svg viewBox="0 0 100 100">
              <path
                d="M10 50A40 40 0 0 0 90 50A40 44.8 0 0 1 10 50"
                fill="#ffffff"
                stroke="none"
              >
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  dur="1s"
                  repeatCount="indefinite"
                  keyTimes="0;1"
                  values="0 50 51;360 50 51"
                ></animateTransform>
              </path>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
