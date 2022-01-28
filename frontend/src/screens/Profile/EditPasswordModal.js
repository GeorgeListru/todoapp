import React, {useEffect, useState} from "react";
import "./EditPasswordModal.css";
import {useSelector, useDispatch} from "react-redux";
import axios from "axios";
import {logoutUser} from "../../store/LoginUserReducer";
import {useNavigate} from "react-router";
import {ValidatePassword} from '../../functions/Validators'

function EditPasswordModal({show, showPasswordEditSetter}) {
	const userData = useSelector((state) => state.login);
	const [showModal, setShowModal] = useState("hidden");
	const [oldPassword, setOldPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [newPasswordConfirmation, setNewPasswordConfirmation] = useState("");
	const [saveStatus, setSaveStatus] = useState("");
	const dispatch = useDispatch();
	const navigate = useNavigate();
	useEffect(() => {
		if (show) {
			setShowModal(!show ? "hidden" : "");
		}
		return () => {
		};
	}, [show]);

	function closeWindow() {
		showPasswordEditSetter(false);
		setShowModal("hidden");
		setNewPassword("");
		setNewPasswordConfirmation("");
		setOldPassword("");
		setSaveStatus("")
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
			try {
				const response = await axios.post("users/changepassword", body, config);
				setSaveStatus("Changes saved successfully")
				closeWindow();
				dispatch(logoutUser());
				navigate("/");
			} catch (e) {
				if (e.response) setSaveStatus(e.response.data.detail)
				else setSaveStatus("Failed to save your new email")
			}

		}

		if (newPassword === newPasswordConfirmation) {
			if (ValidatePassword(newPassword)) changePasswordRequest()
			else setSaveStatus("8 characters (including 1 digit) required")
		} else setSaveStatus("The password fields must be identical")
	}

	return (
		<div>
			<div onClick={closeWindow} className={"Overlay " + showModal}/>
			<div
				className={
					"EditPasswordWindow " +
					(showModal.length !== 0 ? "Modal-Window-Hidden" : "")
				}
			><i onClick={closeWindow} className="fas fa-times close-Modal"/>
				<form
					className="modal-change-password-form"
					onSubmit={changePasswordHandler}
				>
					<label className="password-modal-label">Old password:</label>
					<input
						value={oldPassword}
						onChange={(e) => setOldPassword(e.target.value)}
						placeholder={"Enter your old password"}
						type="password"
						className="password-modal-input"
					/>
					<label className="password-modal-label">New password:</label>
					<input
						value={newPassword}
						onChange={(e) => setNewPassword(e.target.value)}
						placeholder={"Enter your new password"}
						type="password"
						className="password-modal-input"
					/>
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
					<button className={"change-password-button "}>Change password</button>
					<div
						onClick={() => navigate("/passwordforgot")}
						className={"password-forgot-dialog"}
					>
						Forgot your password?
					</div>
					<div className="Modal-ChangesLoading">
						<i>{saveStatus}</i>
					</div>
				</form>
			</div>
		</div>
	);
}

export default EditPasswordModal;
