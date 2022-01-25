import React from "react";
import { useState, useEffect } from "react";
import "./EditImageModal.css";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import axios from "axios";
import Cropper from "react-cropper";
import { useSelector } from "react-redux";
import "cropperjs/dist/cropper.min.css";

function EditImageModal({ avatarSetter, file, fileSetter }) {
	const userData = useSelector((state) => state.login);
	const [showModal, setShowModal] = useState("hidden");
	const [editingAvatar, setEditingAvatar] = useState(null);
	const image = React.createRef();
	const [croppingData, setCroppingData] = useState({});
	useEffect(() => {
		if (file) {
			setShowModal(!file ? "hidden" : "");
			convertTo64String();
		}
		return () => {};
	}, [file]);

	function closeWindow() {
		setShowModal("hidden");
		fileSetter(null);
	}

	function convertTo64String() {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => {
			setEditingAvatar(reader.result);
		};
	}

	function onCrop(e) {
		setCroppingData({
			cropX: e.detail.x,
			cropY: e.detail.y,
			cropWidth: e.detail.width,
			cropHeight: e.detail.height,
		});
	}

	function SaveImageDataHandler() {
		async function SaveImageDataRequest() {
			const config = {
				headers: {
					"Content-Type": "application/json",
					Authorization: "Bearer " + userData.token,
				},
			};
			const body = {
				image: editingAvatar,
				...croppingData,
			};

			const response = await axios.post("users/saveavatar", body, config);

			if (response.request.status === 200) {
				avatarSetter(response.data);
				closeWindow();
			}
		}
		SaveImageDataRequest();
	}

	return (
		<div className={"EditImageModal " + showModal}>
			<div onClick={closeWindow} className={"Overlay " + showModal} />
			<div
				className={
					"EditImageWindow " +
					(showModal.length !== 0 ? "Modal-Window-Hidden" : "")
				}
			>
				<i onClick={closeWindow} className="fas fa-times close-Modal" />
				<div className="Image-Cropper-Container">
					<Cropper
						src={editingAvatar}
						style={{ width: "25rem", margin: "0 auto" }}
						aspectRatio={1 / 1}
						guides={false}
						crop={onCrop}
						ref={image}
						zoomable={false}
						center={true}
					/>
				</div>
				<button className="save-avatar-button" onClick={SaveImageDataHandler}>
					Save avatar
				</button>
			</div>
		</div>
	);
}

export default EditImageModal;
