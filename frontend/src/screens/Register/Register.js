import React from "react";
import "./Register.css";
import { Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
function Register() {
	return (
		<div>
			<div className="auth-header">SIGN UP</div>
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
				<label for="username" className="text-label">
					Username
				</label>
				<input
					id="username"
					placeholder="Your Username"
					required
					className="text-input"
				/>
				<label className="text-label" for="password">
					Password
				</label>
				<input
					id="password"
					placeholder="Your password"
					type="password"
					required
					className="text-input"
				/>
				<label for="confirm-password" className="text-label">
					Confirm Password
				</label>
				<input
					id="confirm-password"
					placeholder="Confirm your password"
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
						<button className="auth_button">Register</button>
					</Col>
				</Row>
			</form>
			<Link className="auth_redirect" to="/login">
				Already have an account? Sign In
			</Link>
		</div>
	);
}

export default Register;
