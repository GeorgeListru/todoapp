import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import "./ToDoList.css";
import { Row, Col } from "react-bootstrap";
import { useSelector } from "react-redux";

function ToDoList() {
	const [tasksList, setTasksList] = useState([]);
	const userData = useSelector((state) => state.login);
	useEffect(() => {
		async function GetToDoListRequest() {
			const config = {
				headers: {
					"Content-Type": "application/json",
					Authorization: "Bearer " + userData.token,
				},
			};
			const response = await axios.get("todolist/getlist", config);
			if (response.request.status === 200) {
				let tasks = response.data;
				for (let i = 0; i < tasks.length; i++) {
					const date = new Date(tasks[i].createdAt);
					tasks[i].createdAt = `${date.getDate()}/${
						date.getMonth() + 1
					}/${date.getFullYear()}`;
					tasks[i] = { ...tasks[i], showDeleteBtn: true };
				}
				setTasksList(tasks);
			}
		}
		GetToDoListRequest();
	}, []);

	function setItemCompletedHandler(id) {
		let copyTasksList = [...tasksList];
		for (let i = 0; i < copyTasksList.length; i++) {
			if (copyTasksList[i].id == id) {
				copyTasksList[i].isCompleted = true;
			}
		}
		setTasksList(copyTasksList);
		console.log("modified");
	}

	function showDeleteButtonHandler(id) {
		let copyTasksList = [...tasksList];
		for (let i = 0; i < copyTasksList.length; i++) {
			if (copyTasksList[i].id == id) {
				copyTasksList[i].showDeleteBtn = true;
			}
		}
		setTasksList(copyTasksList);
	}
	function hideDeleteButtonHandler(id) {
		let copyTasksList = [...tasksList];
		for (let i = 0; i < copyTasksList.length; i++) {
			if (copyTasksList[i].id == id) {
				copyTasksList[i].showDeleteBtn = false;
			}
		}
		setTasksList(copyTasksList);
	}

	const [enterItemMode, setEnterItemMode] = useState(false);
	function enterItemHandler() {
		setEnterItemMode(true);
	}
	const [enteredTitle, setEnteredTitle] = useState("");
	function addItemHandler() {
		async function AddItemToDoListRequest() {
			const config = {
				headers: {
					"Content-Type": "application/json",
					Authorization: "Bearer " + userData.token,
				},
			};
			const body = {
				title: enteredTitle,
			};
			const response = await axios.post("todolist/additem", body, config);
			if (response.request.status == 200) {
				setEnterItemMode(false);
			}
		}
		AddItemToDoListRequest();
	}
	return (
		<div>
			<div className="h1-header">TO DO LIST</div>
			<div className="todolist">
				{tasksList.map((task) => {
					return (
						<div
							className="todolist-item"
							onClick={() => setItemCompletedHandler(task.id)}
							onMouseEnter={() => showDeleteButtonHandler(task.id)}
							onMouseLeave={() => hideDeleteButtonHandler(task.id)}
						>
							<Row className="row-fullwidth">
								<Col md={1} className="col">
									{(task.isCompleted && (
										<i class="fas fa-check-circle todolist-item-circle"></i>
									)) || <i class="fas fa-circle todolist-item-circle"></i>}
								</Col>
								<Col md={8} className="col">
									<div
										class={`todolist-item-title ${
											task.isCompleted ? "strike" : ""
										}`}
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
										className={`fas fa-trash todolist-item-trashcan ${
											task.showDeleteBtn ? "trashcan-hover" : ""
										}`}
									></i>
								</Col>
							</Row>
						</div>
					);
				})}
			</div>
			<div
				className={`add-to-do-item-button ${
					enterItemMode ? "enter-item-box" : ""
				}`}
				onClick={enterItemHandler}
			>
				{enterItemMode ? (
					<Row className="row-fullwidth">
						<Col md={11} className="col">
							<input
								placeholder="Enter your task"
								type="text"
								name="entered-task"
								className="enter-task-input"
								value={enteredTitle}
								onChange={(e) => setEnteredTitle(e.target.value)}
								maxlength="48"
							/>
						</Col>
						<Col md={1} className="col" onClick={addItemHandler}>
							<i class="fas fa-arrow-up add-to-list-icon"></i>
						</Col>
					</Row>
				) : (
					<i class="fas fa-plus add-todo-item-icon"></i>
				)}
			</div>
		</div>
	);
}

export default ToDoList;
