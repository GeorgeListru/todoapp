import React from "react";
import "./Header-Styles.css";
import { Link } from "react-router-dom";
function Header() {
	return (
		<nav className="NavBar my-3">
			<Link to="/" className="Logo">
				<i className="fas fa-book-reader"></i> todoapp
			</Link>
			<Link to="/login" className="Control-Link">
				<i className="fas fa-user"></i> Sign In
			</Link>
		</nav>
	);
}

export default Header;
