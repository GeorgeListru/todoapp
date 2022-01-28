import React, {useEffect, useState} from "react";
import "./PasswordReset.css";
import {useParams} from "react-router";
import {Link} from "react-router-dom";
import axios from "axios";
import {useDispatch} from "react-redux";
import {logoutUser} from "../../store/LoginUserReducer";
import {useNavigate} from 'react-router'
import ModalErrorMessage from "../../components/ModalErrorMessage/ModalErrorMessage";
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";
import {ValidatePassword} from "../../functions/Validators"

function PasswordReset() {
	const {uid, token} = useParams();
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const [isPassword, setIsPassword] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const [showErrorMessage, setShowErrorMessage] = useState(false)
	let showErrorTimeout, redirectToLoginTImeout

	function showErrorModalHandler(message) {
		setErrorMessage(message);
		setShowErrorMessage(true)
		showErrorTimeout = setTimeout(() => {
			setShowErrorMessage(false)
		}, 2500)
	}

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
			try {
				const response = await axios.post("/users/passwordreset", body, config);
				setIsPassword(true)
				dispatch(logoutUser());
				redirectToLoginTImeout = setTimeout(() => {
					navigate('/login');
				}, 3000)
			} catch (e) {
				setIsPassword(false)
				if (e.response) showErrorModalHandler(e.response.data.detail)
			}
		}

		if (password === confirm_password) {
			if (ValidatePassword(password)) resetPasswordRequest();
			else showErrorModalHandler("The password must contain 8 characters (including 1 digit)")
		} else showErrorModalHandler("Password fields must be the same")
	}

	return (
		<div>
			<div className="h1-header">RESET YOUR PASSWORD</div>
			{!isPassword &&
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
				</form> || <ErrorMessage>Password updated successfully. Now you can Log In</ErrorMessage>
			}
			<ModalErrorMessage show={showErrorMessage} text={errorMessage}/>
		</div>
	);
}

export default PasswordReset;
