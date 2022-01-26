import React from 'react';
import './ErrorMessage.css'
function ErrorMessage({children}) {
	return (
		<div className={"ErrorMessage"}>{children}</div>
	);
}

export default ErrorMessage;