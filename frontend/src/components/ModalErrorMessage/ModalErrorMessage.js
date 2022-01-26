import './ModalErrorMessage.css'
import React from 'react';

function ModalErrorMessage({show, text}) {
	return (
		<div className={"ErrorModalMessage " + (!show ? "NoErrorModalMessage":"")}>
			<div>{text}</div>
		</div>
	);
}

export default ModalErrorMessage;