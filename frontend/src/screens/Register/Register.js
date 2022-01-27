import React, {useState} from "react";
import "./Register.css";
import {Link} from "react-router-dom";
import {useNavigate} from "react-router";
import axios from "axios";
import ModalErrorMessage from "../../components/ModalErrorMessage/ModalErrorMessage";
import {useSelector} from "react-redux";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import isEmpty from "../../functions/IsEmpty";
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";
import {ValidateUsername, ValidatePassword, ValidateEmail} from "../../functions/Validators";

function Register() {
	const userData = useSelector((state) => state.login);
	const [errorMessage, setErrorMessage] = useState("");
	const [showErrorMessage, setShowErrorMessage] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	let showErrorTimeout
	const [password, setPassword] = useState("")

	function showErrorModalHandler(message) {
		setErrorMessage(message);
		setShowErrorMessage(true)
		showErrorTimeout = setTimeout(() => {
			setShowErrorMessage(false)
		}, 2500)
	}


	const navigate = useNavigate();

	function registerHandler(e) {
		e.preventDefault();
		const form = e.target;
		const email = form.email.value;
		const username = form.username.value;
		const password = form.password.value;
		const confirm_password = form.confirm_password.value;

		async function registerRequest() {
			setIsLoading(true)
			const config = {
				"Content-Type": "application/json",
			};
			const body = {
				email,
				username,
				password,
			};
			try {
				const response = await axios.post("users/register", body, config);
				navigate("/");
			} catch (e) {
				if (e.response) {
					showErrorModalHandler(e.response.data.detail)
				}
			}
			setIsLoading(false)
		}

		if (password !== confirm_password) {
			showErrorModalHandler("The password fields must be identical")
			return
		}
		if (!ValidatePassword(password)) {
			showErrorModalHandler("The password must contain 8 characters (including 1 digit)")
			return
		}
		if (!ValidateUsername(username)) {
			showErrorModalHandler("The username must contain 4 characters and no spaces or symbols")
			return
		}
		if (!ValidateEmail(email)) {
			showErrorModalHandler("The email is invalid")
			return
		}


		registerRequest();
	}

	return (
		<div>
			<div className="h1-header">SIGN UP</div>
			{
				isEmpty(userData) ?
					<div>
						<form className="auth-form" onSubmit={registerHandler}>
							<label htmlFor="email" className="text-label">
								Email
							</label>
							<input
								name="email"
								id="email"
								placeholder="Your email"
								type="email"
								required
								className="text-input"
							/>
							<label htmlFor="username" className="text-label">
								Username
							</label>
							<input
								name="username"
								id="username"
								placeholder="Your Username"
								required
								className="text-input"
							/>
							<label className="text-label" htmlFor="password">
								Password
							</label>
							<input
								onChange={e => setPassword(e.target.value)}
								name="password"
								id="password"
								placeholder="Your password"
								type="password"
								required
								className={`password-input ${password.length > 0 && (ValidatePassword(password) ?
									"green-right-border" : "yellow-right-border") || ""}`}
							/>
							<label htmlFor="confirm-password" className="text-label">
								Confirm Password
							</label>
							<input
								name="confirm_password"
								id="confirm-password"
								placeholder="Confirm your password"
								type="password"
								required
								className={`text-input`}
							/>

							<button className="green-button register_btn">Register</button>
						</form>
						<Link className="register-redirect" to="/login">
							Already have an account? Sign In
						</Link>
						{
							isLoading &&
							<div className={"custom-Loading-Spinner"}>
								<LoadingSpinner/>
							</div>
						}
						<ModalErrorMessage show={showErrorMessage} text={errorMessage}/>
					</div>
					:
					<ErrorMessage>You are already logged in. Log out to view the page!</ErrorMessage>
			}
		</div>
	);
}

export default Register;
