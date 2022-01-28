import React from "react";
import "./PasswordForgot.css";
import {Link} from "react-router-dom";
import axios from "axios";
import {useSelector} from 'react-redux'
import isEmpty from '../../functions/IsEmpty'
import {useState} from 'react'
import ModalErrorMessage from '../../components/ModalErrorMessage/ModalErrorMessage'
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";

const PasswordForgot = () => {
	const userData = useSelector(state => state.login)
	const [isEmailSent, setIsEmailSent] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const [showErrorMessage, setShowErrorMessage] = useState(false)
	let showErrorTimeout

	function showErrorModalHandler(message) {
		setErrorMessage(message);
		setShowErrorMessage(true)
		showErrorTimeout = setTimeout(() => {
			setShowErrorMessage(false)
		}, 2500)
	}

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
			try {
				const response = await axios.post("users/passwordforgot", body, config);
				setIsEmailSent(true)
			} catch (e) {
				setIsEmailSent(false)
				if (e.response) showErrorModalHandler(e.response.data.detail)
			}

		}

		resetPasswordRequest();
	}

	return (
		<div>

			<div className="h1-header">FORGOT YOUR PASSWORD?</div>
			{!isEmailSent &&
				<div>
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
					{isEmpty(userData) && <Link to={"/login"} className={"auth_redirect"}>
						Go to Login
					</Link>}
				</div> ||
				<ErrorMessage>The email has been sent successfully. Check your inbox!</ErrorMessage>
			}

			<ModalErrorMessage show={showErrorMessage} text={errorMessage}/>
		</div>
	);
};

export default PasswordForgot;
