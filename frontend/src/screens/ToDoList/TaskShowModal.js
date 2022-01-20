import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import { Row, Col } from "react-bootstrap";
import "./TaskShowModal.css";
import { useSelector, useDispatch } from "react-redux";
import { setShowModalStatus, replaceTask } from "../../store/TasksListReducer";
import FormatDate from "../../functions/FormatDate";
import FormatFileName from "../../functions/FormatFileName";
import FileDownload from "js-file-download";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
function TaskShowModal() {
	const userData = useSelector((state) => state.login);
	const tasksList = useSelector((state) => state.tasks);
	const filteredTask = tasksList.filter((task) => task.showModal === true)[0];
	const [task, setTask] = useState(null);
	const [taskTitle, setTaskTitle] = useState("");
	const [taskNotes, setTaskNotes] = useState(" ".trim());
	const [taskIsCompleted, setTaskIsCompleted] = useState(false);
	const [taskCreatedAt, setTaskCreatedAt] = useState(null);
	const [taskCompletedAt, setTaskCompletedAt] = useState(null);
	const [filesList, setFilesList] = useState([]);
	const [areChangesLoading, setAreChangesLoading] = useState("");
	const [isWindowLoading, setisWindowLoading] = useState(true);

	useEffect(() => {
		async function getTaskDataRequest() {
			setisWindowLoading(true);
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
				setTaskCreatedAt(data.createdAt);
				setTaskCompletedAt(data.completedAt);
				setFilesList(data.files);
				setTaskNotes(data.notes !== null ? data.notes : "");
				setTaskIsCompleted(data.isCompleted);
				setAreChangesLoading("");
				setisWindowLoading(false);
			}
		}
		if (filteredTask) {
			getTaskDataRequest();
		}
	}, [filteredTask]);

	const dispatch = useDispatch();

	function toggleCompleteHandler(e) {
		const checked = e.target.checked;
		if (checked) setTaskCompletedAt(new Date());
		else setTaskCompletedAt("");
		setTaskIsCompleted(checked);
	}

	function onAddFileHandler(e) {
		const file = e.target.files[0];
		async function AddFileRequest() {
			setAreChangesLoading("Uploading file...");
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
				setFilesList([...filesList, response.data]);
				setAreChangesLoading("File uploaded successfully");
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
			setAreChangesLoading("Deleting file...");
			const config = {
				headers: {
					"Content-Type": "application/json",
					Authorization: "Bearer " + userData.token,
				},
			};
			const body = { file_id: id, task_id: task.id };
			const response = await axios.post("todolist/deletefile", body, config);
			if (response.request.status === 200) {
				setFilesList(filesList.filter((file) => file.id !== id));
				setAreChangesLoading("File deleted successfully");
			}
		}
		deleteDatabaseFileRequest();
	}

	useEffect(() => SaveEverythingHandler(), [taskIsCompleted]);

	function SaveEverythingHandler() {
		let new_task = { ...task };
		new_task.title = taskTitle;
		new_task.notes = taskNotes;
		new_task.isCompleted = taskIsCompleted;

		async function SaveEverythingRequest() {
			setAreChangesLoading("Saving changes...");
			const config = {
				headers: {
					"Content-Type": "application/json",
					Authorization: "Bearer " + userData.token,
				},
			};
			const response = await axios.post(
				"todolist/replaceitem",
				new_task,
				config
			);
			if (response.request.status === 200) {
				setAreChangesLoading("All changes saved");
			}
		}
		if (task) SaveEverythingRequest();
	}

	function closeWindowHandler() {
		SaveEverythingHandler();
		let copyTask = { ...filteredTask };
		copyTask.title = taskTitle;
		copyTask.notes = taskNotes;
		copyTask.isCompleted = taskIsCompleted;
		copyTask.showModal = false;
		setFilesList([]);
		setTask(null);
		dispatch(replaceTask(copyTask));
		setAreChangesLoading("");
	}

	return (
		<div className={`Task-Modal ${!filteredTask && "hidden"}`}>
			<div
				onClick={closeWindowHandler}
				className={`Overlay ${!filteredTask && "hidden"}`}
			></div>
			<div
				className={`Modal-Window ${!filteredTask ? "hiddenModal-Window" : ""}`}
			>
				{(isWindowLoading && <LoadingSpinner />) ||
					(task && (
						<>
							<i
								onClick={closeWindowHandler}
								className="fas fa-times close-Modal"
							/>
							<div className="Modal_Content">
								<input
									placeholder="Enter the title of the task"
									value={taskTitle}
									onChange={(e) => setTaskTitle(e.target.value)}
									onBlur={(e) => SaveEverythingHandler()}
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
										<div className="Modal-dateInterval">{`${FormatDate(
											taskCreatedAt
										)} ${
											taskCompletedAt ? " - " + FormatDate(taskCompletedAt) : ""
										}`}</div>
									</Col>
								</Row>
								<Row>
									<Col md={8}>
										<textarea
											onBlur={(e) => SaveEverythingHandler()}
											value={taskNotes}
											onChange={(e) => setTaskNotes(e.target.value)}
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
												{filesList.map((file) => {
													return (
														<div className="Modal-File" key={file.id}>
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
											</div>
										</div>
									</Col>
								</Row>
								<button onClick={closeWindowHandler} className="Submit_btn">
									Close
								</button>
								<div className="Modal-ChangesLoading">
									<i>{areChangesLoading}</i>
								</div>
							</div>
						</>
					))}
			</div>
		</div>
	);
}

export default TaskShowModal;
