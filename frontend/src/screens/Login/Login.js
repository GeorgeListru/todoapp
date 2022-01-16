import React from "react";
import "./Login.css";
import { Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
	loginUserRemember,
	loginUserForget,
} from "../../store/LoginUserReducer";
function Login() {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	function onLoginHandler(e) {
		e.preventDefault();
		const form = e.target;
		const username = form.username.value;
		const password = form.password.value;
		const remember_me = form.remember_me.checked;
		console.log(remember_me);
		async function loginRequest() {
			const config = {
				"Content-Type": "application/json",
			};
			const body = {
				username,
				password,
			};
			const response = await axios.post("users/login", body, config);
			if (response.request.status === 200) {
				const data = response.data;
				if (remember_me) {
					dispatch(
						loginUserRemember({
							username: data.username,
							email: data.email,
							isAdmin: data.isAdmin,
							access: data.access,
							refresh: data.refresh,
							token: data.token,
						})
					);
				} else {
					dispatch(
						loginUserForget({
							username: data.username,
							email: data.email,
							isAdmin: data.isAdmin,
							access: data.access,
							refresh: data.refresh,
							token: data.token,
						})
					);
				}
				navigate("/");
			}
		}

		loginRequest();
	}
	return (
		<div onSubmit={onLoginHandler}>
			<div className="h1-header">SIGN IN</div>
			<form className="auth-form">
				<label htmlFor="username" className="text-label">
					Username
				</label>
				<input
					name="username"
					id="username"
					placeholder="Your username"
					type="username"
					required
					className="text-input"
				/>
				<label htmlFor="password" className="text-label">
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
				<Row className="confirm-section">
					<Col md={6}>
						<div className="checkbox-container">
							<input
								name="remember_me"
								type="checkbox"
								id="remember-checkbox"
								className="remember-checkbox"
							/>
							<label htmlFor="remember-checkbox" className="remember-label">
								Remember Me
							</label>
						</div>
					</Col>
					<Col md={6}>
						<button className="auth_button">Log In</button>
					</Col>
				</Row>
			</form>
			<Link className="auth_redirect" to="/register">
				Do not have an account yet? Sign up
			</Link>
		</div>
	);
}

export default Login;
