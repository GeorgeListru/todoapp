import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import "./ToDoList.css";
import { Row, Col } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import ToDoTask from "./ToDoTask";
import { Spinner } from "react-bootstrap";
import TaskShowModal from "./TaskShowModal";
import { setTasks } from "../../store/TasksListReducer";
import FormatDate from "../../functions/FormatDate";
function ToDoList() {
	const [isLoadingToDoList, setIsLoadingToDoList] = useState(false);
	const userData = useSelector((state) => state.login);
	const tasksList = useSelector((state) => state.tasks);
	const dispatch = useDispatch();
	function formatTaskData(task) {
		const date = new Date(task.createdAt);
		task.createdAt = FormatDate(task.createdAt);
		task = {
			...task,
			showDeleteBtn: false,
			changingStatus: false,
			showModal: false,
		};
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
				dispatch(setTasks(tasks));
			}
		}
		GetToDoListRequest();
	}, []);

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
				dispatch(setTasks([task, ...tasksList]));
				setEnteredTitle("");
			}
		}
		AddItemToDoListRequest();
	}

	const [tab, setTab] = useState("todo");
	function changeTabHandler() {
		if (tab == "todo") setTab("completed");
		else setTab("todo");
	}

	return (
		<div>
			<div className="h1-header">TO DO LIST</div>
			<TaskShowModal />
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
							return <ToDoTask key={task.id} taskID={task.id} task={task} />;
						} else if (tab == "completed" && task.isCompleted) {
							return <ToDoTask key={task.id} taskID={task.id} task={task} />;
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
							<i className="fas fa-arrow-up add-to-list-icon"></i>
						</Col>
					</Row>
				) : (
					<i className="fas fa-plus add-todo-item-icon"></i>
				)}
			</div>
		</div>
	);
}

export default ToDoList;
