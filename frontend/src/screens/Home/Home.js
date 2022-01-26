import React from "react";
import "./Home.css";
import { useNavigate } from "react-router-dom";
import BookPage from "../../images/BookPage.png";

function Home() {
	const navigate = useNavigate();

	function getStartedHandler() {
		navigate("/register");
	}

	return (
		<div className="Home">
			<div className="Message">
				Your success is important. <br />
				todoapp helps you to focus on it.
			</div>
			<button onClick={getStartedHandler} className="get-started_button">
				Get Started
			</button>
			<img src={BookPage} className="book-page" />
		</div>
	);
}

export default Home;
