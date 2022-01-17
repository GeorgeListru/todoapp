import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import "./ToDoList.css";
import { Row, Col } from "react-bootstrap";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import ToDoTask from "./ToDoTask";
import { Spinner } from "react-bootstrap";
import TaskShowModal from "./TaskShowModal";
function ToDoList() {
	const [tasksList, setTasksList] = useState([]);
	const [isLoadingToDoList, setIsLoadingToDoList] = useState(false);
	const userData = useSelector((state) => state.login);

	function formatTaskData(task) {
		const date = new Date(task.createdAt);
		task.createdAt = `${date.getDate()}/
		${date.getMonth() + 1}/${date.getFullYear()}`;
		task = { ...task, showDeleteBtn: false, changingStatus: false };
		return task;
	}

	useEffect(() => {
		async function GetToDoListRequest() {
			setIsLoadingToDoList(true);
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
					tasks[i] = formatTaskData(tasks[i]);
				}
				setIsLoadingToDoList(false);
				setTasksList(tasks);
			}
		}
		GetToDoListRequest();
	}, []);
	function setItemCompletedHandler(id) {
		async function changeCompletedStatusRequest() {
			const config = {
				headers: {
					"Content-Type": "application/json",
					Authorization: "Bearer " + userData.token,
				},
			};
			const body = { id };
			const response = await axios.post(
				"todolist/changecompleted",
				body,
				config
			);
			if (response.request.status == 200) {
				let copyTasksList = [...tasksList];
				for (let i = 0; i < copyTasksList.length; i++) {
					if (copyTasksList[i].id == id) {
						copyTasksList[i].changingStatus = true;
					}
				}
				setTasksList(copyTasksList);
				const setCompletedTimeout = setTimeout(() => {
					for (let i = 0; i < copyTasksList.length; i++) {
						if (copyTasksList[i].id == id) {
							copyTasksList[i].changingStatus = false;
							copyTasksList[i].isCompleted = !copyTasksList[i].isCompleted;
							copyTasksList[i].showDeleteBtn = false;
						}
					}
					setTasksList(copyTasksList);
				}, 500);
				return () => clearTimeout(setCompletedTimeout);
			}
		}
		changeCompletedStatusRequest();
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
				const task = formatTaskData(response.data);
				setTasksList([task, ...tasksList]);
				setEnteredTitle("");
			}
		}
		AddItemToDoListRequest();
	}

	function deleteItemHandler(id) {
		async function DeleteItemRequest() {
			const config = {
				headers: {
					"Content-Type": "application/json",
					Authorization: "Bearer " + userData.token,
				},
			};
			const body = { id };
			const response = await axios.post("todolist/delete", body, config);
			if (response.request.status == 200) {
				const filteredTasksList = tasksList.filter((task) => task.id != id);
				setTasksList(filteredTasksList);
			}
		}
		DeleteItemRequest();
	}
	const [tab, setTab] = useState("todo");
	function changeTabHandler() {
		if (tab == "todo") setTab("completed");
		else setTab("todo");
	}
	const [selectedToShowModal, setSelectedToShowModal] = useState(null);
	function selectTaskToShowModalHandler(id) {
		const task = tasksList.filter((task) => task.id == id)[0];
		setSelectedToShowModal(task);
	}
	return (
		<div>
			<div className="h1-header">TO DO LIST</div>
			<TaskShowModal className="hidden" task={selectedToShowModal} taskSetter={setSelectedToShowModal} />
			<div className="todolist-tabs">
				<div
					className={`tabline ${
						tab === "completed" ? "tabline-down" : "tabline-up"
					}`}
				></div>
				<div
					onClick={changeTabHandler}
					to="/todolist"
					className={`todolist-tab-page ${
						tab === "todo" ? "todolist-tabs-current-page" : ""
					}`}
				>
					To Do
				</div>
				<div
					onClick={changeTabHandler}
					className={`todolist-tab-page ${
						tab === "completed" ? "todolist-tabs-current-page" : ""
					}`}
					to="todolist/completed"
				>
					Completed
				</div>
			</div>
			<div className="todolist">
				{(isLoadingToDoList && (
					<div className="Loading-Spinner">
						<Spinner animation="border" variant="warning" />
					</div>
				)) ||
					tasksList.map((task) => {
						if (tab == "todo" && !task.isCompleted) {
							return (
								<ToDoTask
									task={task}
									showDeleteButtonHandler={showDeleteButtonHandler}
									hideDeleteButtonHandler={hideDeleteButtonHandler}
									setItemCompletedHandler={setItemCompletedHandler}
									deleteItemHandler={deleteItemHandler}
									selectTaskToShowModalHandler={selectTaskToShowModalHandler}
								/>
							);
						} else if (tab == "completed" && task.isCompleted) {
							return (
								<ToDoTask
									task={task}
									showDeleteButtonHandler={showDeleteButtonHandler}
									hideDeleteButtonHandler={hideDeleteButtonHandler}
									setItemCompletedHandler={setItemCompletedHandler}
									deleteItemHandler={deleteItemHandler}
									selectTaskToShowModalHandler={selectTaskToShowModalHandler}
								/>
							);
						}
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
								maxlength="64"
								autoFocus
								onKeyDown={(e) => {
									e.key === "Enter" && addItemHandler();
								}}
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
