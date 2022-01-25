import React, { useEffect } from "react";
import "./PasswordReset.css";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { logoutUser } from "../../store/LoginUserReducer";

function PasswordReset() {
  const { uid, token } = useParams();
  const dispatch = useDispatch();

  function resetPasswordHandler(e) {
    e.preventDefault();
    const form = e.target;
    const password = form.password.value;
    const confirm_password = form.confirm_password.value;

    async function resetPasswordRequest() {
      const config = {
        "Content-Type": "application/json",
      };
      const body = {
        password,
        uid,
        token,
      };
      const response = await axios.post("/users/passwordreset", body, config);
      if (response.request.status === 200) {
        dispatch(logoutUser());
      }
    }

    if (password === confirm_password) resetPasswordRequest();
  }

  return (
    <div>
      <div className="h1-header">RESET YOUR PASSWORD</div>
      <form className={"reset-password-form"} onSubmit={resetPasswordHandler}>
        <label htmlFor="password" className="text-label">
          Password
        </label>
        <input
          name="password"
          id="password"
          placeholder="Enter your new password"
          type="password"
          required
          className="text-input"
        />
        <label htmlFor="confirm_password" className="text-label">
          Confirm password
        </label>
        <input
          name="confirm_password"
          id="confirm_password"
          placeholder="Confirm your new password"
          type="password"
          required
          className="text-input"
        />
        <button className={"reset-password-button"}>Reset my password</button>
      </form>
      {/*<Link to={"/login"} className={"auth_redirect"}>*/}
      {/*  Go to Login*/}
      {/*</Link>*/}
    </div>
  );
}

export default PasswordReset;
