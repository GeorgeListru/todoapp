import React from "react";
import "./Header-Styles.css";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { logoutUser } from "../../store/LoginUserReducer";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
function Header() {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const userData = useSelector((state) => state.login);
	const token = userData.token;
	const [userProfileName, setUserProfileName] = useState(null);

	useEffect(() => {
		async function getProfileDataRequest() {
			const config = {
				headers: {
					"Content-Type": "application/json",
					Authorization: "Bearer " + token,
				},
			};
			const response = await axios.get("users/profile", config);
			if (response.request.status === 200) {
				const data = response.data;
				setUserProfileName(data.username);
			} else {
				setUserProfileName(null);
			}
		}

		getProfileDataRequest();

		document.addEventListener("click", (e) => {
			if (e.target.closest("[data-dropdown]") == null) {
				setProfileDropdownStatus("");
				setProfileArrowStatus("");
			}
		});
	}, []);

	const [profileDropdownStatus, setProfileDropdownStatus] = useState("");
	const [profileArrowStatus, setProfileArrowStatus] = useState("");
	function onProfileClickHandler(e) {
		if (profileDropdownStatus.length > 0) {
			setProfileDropdownStatus("");
			setProfileArrowStatus("");
			return;
		}
		if (e.target.closest("[data-dropdown]") != null) {
			setProfileDropdownStatus("profile-dropdown-menu-active");
			setProfileArrowStatus("profile-arrow-active");
		}
	}

	function logoutHandler() {
		dispatch(logoutUser());
		setUserProfileName("");
		navigate("/");
	}

	return (
		<nav className="NavBar my-3">
			<Link to="/" className="Logo">
				<i className="fas fa-book-reader"></i> todoapp
			</Link>
			{(token && (
				<div className="profile-dropdown" data-dropdown>
					<a href="#" className="Profile-Link" onClick={onProfileClickHandler}>
						{userData.username}{" "}
						<i
							className={`fas fa-chevron-right profile-arrow ${profileArrowStatus}`}
						></i>
					</a>
					<div className={`profile-dropdown-menu ${profileDropdownStatus}`}>
						<Link to="profile" className="profile-dropdown-item">
							Profile
						</Link>
						<hr />
						<Link to="todolist" className="profile-dropdown-item">
							To Do List
						</Link>
						<hr />
						<div onClick={logoutHandler} className="profile-dropdown-item">
							Logout
						</div>
					</div>
				</div>
			)) || (
				<Link to="/login" className="Control-Link">
					<i className="fas fa-user"></i> Sign In
				</Link>
			)}
		</nav>
	);
}

export default Header;
