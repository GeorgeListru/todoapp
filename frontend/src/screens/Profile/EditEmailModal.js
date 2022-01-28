import React from "react";
import {useState, useEffect} from "react";
import {useSelector, useDispatch} from "react-redux";
import {changeUserEmail} from "../../store/LoginUserReducer";
import "./EditEmailModal.css";
import axios from "axios";
import {ValidateEmail} from '../../functions/Validators'

function EditEmailModal({showEmailEditSetter, show}) {
	const userData = useSelector((state) => state.login);
	const [showModal, setShowModal] = useState("hidden");
	const [newEmail, setNewEmail] = useState("");
	const [newEmailConfirm, setnewEmailConfirm] = useState("");
	const [password, setPassword] = useState("");
	const [saveStatus, setSaveStatus] = useState("");
	const dispatch = useDispatch();
	useEffect(() => {
		if (show) {
			setShowModal(!show ? "hidden" : "");
		}
	}, [show]);

	function closeWindow() {
		showEmailEditSetter(false);
		setShowModal("hidden");
		setNewEmail("");
		setnewEmailConfirm("");
		setPassword("");
		setSaveStatus("")
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
			try {
				const response = await axios.post("users/changeemail", body, config);
				setNewEmail("");
				setnewEmailConfirm("");
				setPassword("");
				dispatch(changeUserEmail(response.data.email));
				setSaveStatus("Changes saved successfully")
				closeWindow();
			} catch (e) {
				if (e.response) setSaveStatus(e.response.data.detail)
				else setSaveStatus("Failed to save your new email")
			}
		}

		if (newEmail === newEmailConfirm) {
			if (ValidateEmail(newEmail)) changeEmailRequest()
			else setSaveStatus("The email is invalid")
		} else setSaveStatus("The email fields must be identical")
	}

	return (
		<div>
			<div onClick={closeWindow} className={"Overlay " + showModal}/>
			<div
				className={
					"EditEmailWindow " +
					(showModal.length !== 0 ? "Modal-Window-Hidden" : "")
				}
			><i onClick={closeWindow} className="fas fa-times close-Modal"/>
				<form className="modal-change-email-form" onSubmit={changeEmailHandler}>
					<label className="email-modal-label">New Email:</label>
					<input
						value={newEmail}
						onChange={(e) => setNewEmail(e.target.value)}
						placeholder={"Enter your new email"}
						type="email"
						className="email-modal-input"
					/>
					<label className="email-modal-label">Confirm Email:</label>
					<input
						value={newEmailConfirm}
						onChange={(e) => setnewEmailConfirm(e.target.value)}
						placeholder={"Re-enter your new email"}
						type="email"
						className="email-modal-input"
					/>
					<label className="email-modal-label">Password:</label>
					<input
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						placeholder={"Enter your password"}
						type="password"
						className="email-modal-input"
					/>
					<button className={"change-email-button "}>Change email</button>
					<div className="Modal-ChangesLoading">
						<i>{saveStatus}</i>
					</div>
				</form>
			</div>
		</div>
	);
}

export default EditEmailModal;
