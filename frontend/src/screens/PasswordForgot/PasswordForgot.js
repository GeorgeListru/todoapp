import React from "react";
import "./PasswordForgot.css";
import { Link } from "react-router-dom";
import axios from "axios";

const MyComponent = () => {
  function resetPasswordHandler(e) {
    e.preventDefault();
    const email = e.target.email.value;

    async function resetPasswordRequest() {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      const body = {
        frontend_website:
          window.location.protocol + "//" + window.location.host,
        email,
      };

      const response = await axios.post("users/passwordforgot", body, config);
      if (response.request.status === 200) {
        console.log("ok");
      }
    }

    resetPasswordRequest();
  }

  return (
    <div>
      <div className="h1-header">FORGOT YOUR PASSWORD?</div>
      <form className={"reset-password-form"} onSubmit={resetPasswordHandler}>
        <label htmlFor="email" className="text-label">
          Email
        </label>
        <input
          name="email"
          id="email"
          placeholder="Enter your account email"
          type="email"
          required
          className="text-input"
        />
        <button className={"reset-password-button"}>Send reset email</button>
      </form>
      <Link to={"/login"} className={"auth_redirect"}>
        Go to Login
      </Link>
    </div>
  );
};

export default MyComponent;
