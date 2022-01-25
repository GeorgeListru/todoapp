import React from "react";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { changeUserEmail } from "../../store/LoginUserReducer";
import "./EditEmailModal.css";
import axios from "axios";

function EditEmailModal({ showEmailEditSetter, show }) {
  const userData = useSelector((state) => state.login);
  const [showModal, setShowModal] = useState("hidden");
  const [newEmail, setNewEmail] = useState("");
  const [newEmailConfirm, setnewEmailConfirm] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  useEffect(() => {
    if (show) {
      setShowModal(!show ? "hidden" : "");
    }
    return () => {};
  }, [show]);

  function closeWindow() {
    showEmailEditSetter(false);
    setShowModal("hidden");
    setNewEmail("");
    setnewEmailConfirm("");
    setPassword("");
  }

  function changeEmailHandler(e) {
    e.preventDefault();

    async function changeEmailRequest() {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + userData.token,
        },
      };
      const body = {
        newEmail,
        password,
      };

      const response = await axios.post("users/changeemail", body, config);
      if (response.request.status === 200) {
        setNewEmail("");
        setnewEmailConfirm("");
        setPassword("");
        dispatch(changeUserEmail(response.data.email));
        closeWindow();
      }
    }

    if (newEmail === newEmailConfirm) changeEmailRequest();
  }

  return (
    <div>
      <div onClick={closeWindow} className={"Overlay " + showModal} />
      <div
        className={
          "EditEmailWindow " +
          (showModal.length !== 0 ? "Modal-Window-Hidden" : "")
        }
      >
        <form className="modal-change-email-form" onSubmit={changeEmailHandler}>
          <div className="form-group">
            <label className="email-modal-label">New Email:</label>
            <input
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder={"Enter your new email"}
              type="email"
              className="email-modal-input"
            />
          </div>
          <div className="form-group">
            <label className="email-modal-label">Confirm Email:</label>
            <input
              value={newEmailConfirm}
              onChange={(e) => setnewEmailConfirm(e.target.value)}
              placeholder={"Re-enter your new email"}
              type="email"
              className="email-modal-input"
            />
          </div>
          <div className="form-group">
            <label className="email-modal-label">Password:</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={"Enter your password"}
              type="password"
              className="email-modal-input"
            />
          </div>
          <button className={"change-email-button "}>Change email</button>
        </form>
      </div>
    </div>
  );
}

export default EditEmailModal;
