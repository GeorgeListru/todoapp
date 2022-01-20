import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import { Row, Col } from "react-bootstrap";
import "./TaskShowModal.css";
import { useSelector, useDispatch } from "react-redux";
import { setShowModalStatus, setTaskTitle } from "../../store/TasksListReducer";
import FormatDate from "../../functions/FormatDate";
import FormatFileName from "../../functions/FormatFileName";
import FileDownload from "js-file-download";
function TaskShowModal() {
	const userData = useSelector((state) => state.login);
	const tasksList = useSelector((state) => state.tasks);
	const filteredTask = tasksList.filter((task) => task.showModal === true)[0];
	const [task, setTask] = useState(null);
	const [taskTitle, setTaskTitle] = useState("");
	const [taskIsCompleted, setTaskIsCompleted] = useState(false);
	const [taskCreatedAt, setTaskCreatedAt] = useState(null);
	const [taskCompletedAt, setTaskCompletedAt] = useState(null);
	const [existingFiles, setExistingFiles] = useState([]);
	const [newFiles, setNewFiles] = useState([]);

	useEffect(() => {
		async function getTaskDataRequest() {
			const config = {
				headers: {
					"Content-Type": "application/json",
					Authorization: "Bearer " + userData.token,
				},
			};
			const body = { id: filteredTask.id };
			const response = await axios.post("todolist/getitem", body, config);
			if (response.request.status === 200) {
				const data = response.data;
				setTask(data);
				setTaskTitle(data.title);
				setTaskIsCompleted(data.isCompleted);
				setTaskCreatedAt(FormatDate(data.createdAt));
				setTaskCompletedAt(FormatDate(data.completedAt));
				setExistingFiles(data.files);
			}
		}
		if (filteredTask) {
			getTaskDataRequest();
		}
	}, [filteredTask]);

	const dispatch = useDispatch();

	function toggleTaskModalStatus() {
		dispatch(setShowModalStatus(task.id));
		setTask(null);
		setNewFiles([]);
	}

	function setTitle(e) {
		setTaskTitle(e.target.value);
	}

	function toggleCompleteHandler(e) {
		const checked = e.target.checked;
		if (checked) setTaskCompletedAt(FormatDate(new Date()));
		else setTaskCompletedAt("");
		setTaskIsCompleted(checked);
	}

	function onAddFileHandler(e) {
		const new_file = {
			id: newFiles.length,
			file: e.target.value,
		};
		const file = e.target.files[0];
		async function AddFileRequest() {
			let data = new FormData();
			data.append("file", file);
			data.append("task_id", task.id);
			const config = {
				headers: {
					"Content-Type": "application/json",
					Authorization: "Bearer " + userData.token,
				},
			};
			const response = await axios.post("todolist/uploadfile", data, config);
			if (response.request.status === 200) {
				console.log("success");
				setNewFiles([...newFiles, new_file]);
			}
		}
		AddFileRequest();
	}

	function DownloadFileHandler(id) {
		async function DownloadFileRequest() {
			const config = {
				responseType: "arraybuffer",
				headers: {
					"Content-Type": "application/json",
					Authorization: "Bearer " + userData.token,
				},
			};
			const body = { file_id: id, task_id: task.id };
			const response = await axios.post("todolist/downloadfile", body, config);
			if (response.request.status === 200) {
				const url = window.URL.createObjectURL(new Blob([response.data]));
				const filename = response["headers"]["content-disposition"].replace(
					"attachment; filename=",
					""
				);
				const link = document.createElement("a");
				link.href = url;
				link.setAttribute("download", filename); //or any other extension
				document.body.appendChild(link);
				link.click();
			}
		}
		DownloadFileRequest();
	}

	function deleteDatabaseFileHandler(id) {
		async function deleteDatabaseFileRequest() {
			const config = {
				headers: {
					"Content-Type": "application/json",
					Authorization: "Bearer " + userData.token,
				},
			};
			const body = { file_id: id, task_id: task.id };
			const response = await axios.post("todolist/deletefile", body, config);
			if (response.request.status === 200) {
				setExistingFiles(existingFiles.filter((file) => file.id !== id));
			}
		}
		deleteDatabaseFileRequest();
	}

	return (
		<div className={`Task-Modal ${!task && "hidden"}`}>
			<div
				onClick={toggleTaskModalStatus}
				className={`Overlay ${!task && "hidden"}`}
			></div>
			<div className={`Modal-Window ${!task && "hiddenModal-Window"}`}>
				{task && (
					<>
						<i
							onClick={toggleTaskModalStatus}
							className="fas fa-times close-Modal"
						/>
						<div className="Modal_Content">
							<input
								placeholder="Enter the title of the task"
								value={taskTitle}
								onChange={setTitle}
								className="change-title_Modal"
							/>
							<Row>
								<Col md={6}>
									<div className="checkbox-container">
										<input
											onChange={toggleCompleteHandler}
											checked={taskIsCompleted}
											name="remember_me"
											type="checkbox"
											id="remember-checkbox"
											className="remember-checkbox"
										/>
										<label
											htmlFor="remember-checkbox"
											className="remember-label"
										>
											{taskIsCompleted ? "Completed" : "To Do"}
										</label>
									</div>
								</Col>
								<Col md={6}>
									<div className="Modal-dateInterval">{`${taskCreatedAt} ${
										taskCompletedAt ? " - " + taskCompletedAt : ""
									}`}</div>
								</Col>
							</Row>
							<Row>
								<Col md={8}>
									<textarea
										className="Modal-notesArea"
										placeholder="Your notes"
									/>
								</Col>
								<Col md={4}>
									<div className="Modal-FilesArea">
										<input
											id="Modal-addFile"
											type="file"
											className="Modal-AddFileInput"
											onChange={onAddFileHandler}
										/>
										<label htmlFor="Modal-addFile" className="Modal-AddFile">
											<i className="fas fa-paperclip Moodal-AddFile-Icon" />
											{"Choose File (<10MB)"}
										</label>
										<div className="Modal-FileList">
											{existingFiles.map((file) => {
												return (
													<div className="Modal-File">
														<Row>
															<Col
																onClick={() => DownloadFileHandler(file.id)}
																md={9}
															>
																{FormatFileName(file.file, "/")}
															</Col>
															<Col md={3}>
																<div className="Modal-File-Options">
																	<i
																		onClick={() =>
																			deleteDatabaseFileHandler(file.id)
																		}
																		className="fas fa-trash Modal-File-Option"
																	/>
																</div>
															</Col>
														</Row>
													</div>
												);
											})}
											{newFiles.map((file) => {
												return (
													<div className="Modal-File Modal-File-NotUploaded">
														{FormatFileName(file.file, "\\")}
													</div>
												);
											})}
										</div>
									</div>
								</Col>
							</Row>
						</div>
					</>
				)}
			</div>
		</div>
	);
}

export default TaskShowModal;
