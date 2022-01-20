import React from "react";
import { Spinner } from "react-bootstrap";
import "./LoadingSpinner.css";
function LoadingSpinner() {
	return (
		<div className="Loading-Spinner">
			<Spinner animation="border" variant="warning" />
		</div>
	);
}

export default LoadingSpinner;
