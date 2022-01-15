import React from "react";
import "./Login.css";
import { Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
function Login() {
	return (
		<div>
			<div className="auth-header">SIGN IN</div>
			<form className="auth-form">
				<label for="email" className="text-label" for="email">
					Email
				</label>
				<input
					id="email"
					placeholder="Your email"
					type="email"
					required
					className="text-input"
				/>
				<label for="email" className="text-label" for="password">
					Password
				</label>
				<input
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
								type="checkbox"
								id="remember-checkbox"
								className="remember-checkbox"
							/>
							<label for="remember-checkbox" className="remember-label">
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
