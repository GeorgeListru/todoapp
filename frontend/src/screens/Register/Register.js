import React from "react";
import "./Register.css";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
// import { useSelector, useDispatch } from "react-redux";
// import {
// 	loginUserRemember,
// 	loginUserForget,
// } from "../../store/LoginUserReducer";

function Register() {
	// const loginRedux = useSelector((state) => state.login);
	// const dispatch = useDispatch();

	const navigate = useNavigate();

	function registerHandler(e) {
		e.preventDefault();
		const form = e.target;
		const email = form.email.value;
		const username = form.username.value;
		const password = form.password.value;
		const confirm_password = form.confirm_password.value;

		async function registerRequest() {
			const config = {
				"Content-Type": "application/json",
			};
			const body = {
				email,
				username,
				password,
			};

			const response = await axios.post("users/register", body, config);
			// const data = await response.data;
			if (response.request.status === 200) {
				navigate("/");
			}
		}

		if (password !== confirm_password) {
			return;
		}

		registerRequest();
	}

	return (
		<div>
			<div className="h1-header">SIGN UP</div>
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
					name="password"
					id="password"
					placeholder="Your password"
					type="password"
					required
					className="text-input"
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
					className="text-input"
				/>

				<button className="auth_button register_btn">Register</button>
			</form>
			<Link className="auth_redirect" to="/login">
				Already have an account? Sign In
			</Link>
		</div>
	);
}

export default Register;
