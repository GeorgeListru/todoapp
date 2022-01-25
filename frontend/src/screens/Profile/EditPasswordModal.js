import React, { useEffect, useState } from "react";
import "./EditPasswordModal.css";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { logoutUser } from "../../store/LoginUserReducer";
import { useNavigate } from "react-router";

function EditPasswordModal({ show, showPasswordEditSetter }) {
  const userData = useSelector((state) => state.login);
  const [showModal, setShowModal] = useState("hidden");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  useEffect(() => {
    if (show) {
      setShowModal(!show ? "hidden" : "");
    }
    return () => {};
  }, [show]);

  function closeWindow() {
    showPasswordEditSetter(false);
    setShowModal("hidden");
    setNewPassword("");
    setNewPasswordConfirmation("");
    setOldPassword("");
  }

  function changePasswordHandler(e) {
    e.preventDefault();

    async function changePasswordRequest() {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + userData.token,
        },
      };
      const body = {
        oldPassword,
        newPassword,
      };
      const response = await axios.post("users/changepassword", body, config);
      if (response.request.status === 200) {
        closeWindow();
        dispatch(logoutUser());
        navigate("/");
      }
    }

    if (newPassword === newPasswordConfirmation) changePasswordRequest();
  }

  return (
    <div>
      <div onClick={closeWindow} className={"Overlay " + showModal} />
      <div
        className={
          "EditPasswordWindow " +
          (showModal.length !== 0 ? "Modal-Window-Hidden" : "")
        }
      >
        <form
          className="modal-change-password-form"
          onSubmit={changePasswordHandler}
        >
          <div className="form-group">
            <label className="password-modal-label">Old password:</label>
            <input
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder={"Enter your old password"}
              type="password"
              className="password-modal-input"
            />
          </div>
          <div className="form-group">
            <label className="password-modal-label">New password:</label>
            <input
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={"Enter your new password"}
              type="password"
              className="password-modal-input"
            />
          </div>
          <div className="form-group">
            <label className="password-modal-label">
              Confirm new password:
            </label>
            <input
              value={newPasswordConfirmation}
              onChange={(e) => setNewPasswordConfirmation(e.target.value)}
              placeholder={"Confirm your new password"}
              type="password"
              className="password-modal-input"
            />
          </div>
          <button className={"change-password-button "}>Change password</button>
          <div
            onClick={() => navigate("/passwordforgot")}
            className={"password-forgot-dialog"}
          >
            Forgot your password?
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditPasswordModal;
