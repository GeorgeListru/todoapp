import React from "react";
import { Row, Col } from "react-bootstrap";
import "./ToDoList.css";
function ToDoTask({
	task,
	showDeleteButtonHandler,
	hideDeleteButtonHandler,
	setItemCompletedHandler,
	deleteItemHandler,
	selectTaskToShowModalHandler,
}) {
	return (
		<div>
			<div
				className={`todolist-item ${
					task.changingStatus && "todolist-item-changing"
				}`}
				onMouseEnter={() => showDeleteButtonHandler(task.id)}
				onMouseLeave={() => hideDeleteButtonHandler(task.id)}
			>
				<Row className="row-fullwidth">
					<Col md={1} className="col">
						{(((!task.isCompleted && task.changingStatus) ||
							(task.isCompleted && !task.changingStatus)) && (
							<i
								onClick={() => {
									!task.changingStatus && setItemCompletedHandler(task.id);
								}}
								className={`fas fa-check-circle todolist-item-circle ${
									task.changingStatus && "disable-cursor"
								}`}
							></i>
						)) || (
							<i
								onClick={() => {
									!task.changingStatus && setItemCompletedHandler(task.id);
								}}
								className={`fas fa-circle todolist-item-circle ${
									task.changingStatus && "disable-cursor"
								}`}
							></i>
						)}
					</Col>
					<Col
						md={8}
						className="col"
						onClick={() => {
							selectTaskToShowModalHandler(task.id);
						}}
					>
						<div
							className={`todolist-item-title ${
								(task.isCompleted && task.changingStatus && "strike-reverse") ||
								(task.isCompleted && "striked-text")
							} ${task.changingStatus && !task.isCompleted && "strike"}`}
						>
							{task.title}
						</div>
					</Col>
					<Col md={3} className="col right-section">
						<div
							className={`todolist-item-created-date ${
								task.showDeleteBtn ? "date-hover" : ""
							}`}
						>
							{task.createdAt}
						</div>
						<i
							onClick={() => deleteItemHandler(task.id)}
							className={`fas fa-trash todolist-item-trashcan ${
								task.showDeleteBtn ? "trashcan-hover" : ""
							}`}
						></i>
					</Col>
				</Row>
			</div>
		</div>
	);
}

export default ToDoTask;
