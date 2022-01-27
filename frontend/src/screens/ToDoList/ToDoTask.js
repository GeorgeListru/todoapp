import React, {useState} from "react";
import axios from "axios";
import {Row, Col} from "react-bootstrap";
import {useSelector, useDispatch} from "react-redux";
import {
	setChangingStatus,
	setIsCompletedStatus,
	setShowDeleteButtonStatus,
	deleteTask,
	setShowModalStatus,
} from "../../store/TasksListReducer";
import "./ToDoList.css";

function ToDoTask({task}) {
	const userData = useSelector((state) => state.login);
	const [errorMessage, setErrorMessage] = useState("");
	const [showErrorMessage, setShowErrorMessage] = useState(false)
	let showErrorTimeout
	const dispatch = useDispatch();

	function showErrorModalHandler(message) {
		setErrorMessage(message);
		setShowErrorMessage(true)
		showErrorTimeout = setTimeout(() => {
			setShowErrorMessage(false)
		}, 2500)
	}

	function showDeleteButtonHandler(id) {
		dispatch(setShowDeleteButtonStatus({id, status: true}));
	}

	function hideDeleteButtonHandler(id) {
		dispatch(setShowDeleteButtonStatus({id, status: false}));
	}

	function setItemCompletedHandler(id) {
		async function changeCompletedStatusRequest() {
			const config = {
				headers: {
					"Content-Type": "application/json",
					Authorization: "Bearer " + userData.token,
				},
			};
			const body = {id};
			try {
				const response = await axios.post("todolist/changecompleted", body, config);
				dispatch(setChangingStatus({id, status: true}));
				const setCompletedTimeout = setTimeout(() => {
					dispatch(setChangingStatus({id, status: false}));
					dispatch(setIsCompletedStatus(id));
					dispatch(setShowDeleteButtonStatus({id, status: false}));
				}, 500);
				return () => clearTimeout(setCompletedTimeout);
			} catch (e) {
				if (e.response) showErrorModalHandler(e.response.data.detail)
			}
		}

		changeCompletedStatusRequest();
	}

	function deleteItemHandler(id) {
		async function DeleteItemRequest() {
			const config = {
				headers: {
					"Content-Type": "application/json",
					Authorization: "Bearer " + userData.token,
				},
			};
			const body = {id};
			const response = await axios.post("todolist/delete", body, config);
			if (response.request.status === 200) {
				dispatch(deleteTask(id));
			}
		}

		DeleteItemRequest();
	}

	function toggleTaskModalStatus() {
		dispatch(setShowModalStatus(task.id));
	}

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
					<Col lg={1} md={1} className="col">
						{(((!task.isCompleted && task.changingStatus) ||
							(task.isCompleted && !task.changingStatus)) && (
							<i
								onClick={() => {
									!task.changingStatus && setItemCompletedHandler(task.id);
								}}
								className={`fas fa-check-circle todolist-item-circle ${
									task.changingStatus && "disable-cursor"
								}`}
							/>
						)) || (
							<i
								onClick={() => {
									!task.changingStatus && setItemCompletedHandler(task.id);
								}}
								className={`fas fa-circle todolist-item-circle ${
									task.changingStatus && "disable-cursor"
								}`}
							/>
						)}
					</Col>
					<Col lg={8} md={8} className="col" onClick={toggleTaskModalStatus}>
						<div
							className={`todolist-item-title ${
								(task.isCompleted && task.changingStatus && "strike-reverse") ||
								(task.isCompleted && "striked-text")
							} ${task.changingStatus && !task.isCompleted && "strike"}`}
						>
							{task.title}
						</div>
					</Col>
					<Col lg={3} md={3} className="col right-section">
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
						/>
					</Col>
				</Row>
			</div>
		</div>
	);
}

export default ToDoTask;
