import React from "react";
import "./TaskShowModal.css";
function TaskShowModal({ task, taskSetter }) {
	return (
		<div className={`Task-Modal ${!task && "hidden"}`}>
			<div
				onClick={() => taskSetter(null)}
				className={`Overlay ${!task && "hidden"}`}
			></div>
			<div className={`Modal-Window ${!task && "hiddenModal-Window"}`}>
				asfasf
			</div>
		</div>
	);
}

export default TaskShowModal;
