import React from "react";
import axios from "axios";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import "./Profile.css";
import EditImageModal from "./EditImageModal";
import EditEmailModal from "./EditEmailModal";
import EditPasswordModal from "./EditPasswordModal";

function Profile() {
  const userData = useSelector((state) => state.login);
  const [user, setUser] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [showEmailEditModal, setShowEmailEditModal] = useState(false);
  const [showPasswordEditModal, setShowPasswordEditModal] = useState(false);
  useEffect(() => {
    async function getProfileDataRequest() {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + userData.token,
        },
      };
      const response = await axios.get("users/profile", config);
      if (response.request.status === 200) {
        setUser(response.data);
      }
    }

    async function getProfileAvatarRequest() {
      const config = {
        headers: {
          "Content-Type": "application/json",
          responseType: "arraybuffer",
          Authorization: "Bearer " + userData.token,
        },
      };
      const response = await axios.get("users/avatar", config);
      if (response.request.status === 200) {
        setAvatar(response.data);
      }
    }

    getProfileDataRequest();
    getProfileAvatarRequest();
  }, []);

  function imageEditHandler(e) {
    setUploadedImage(e.target.files[0]);
  }

  return (
    <div>
      {user ? (
        <div>
          <div className="h1-header">{user.username}</div>

          <div className="avatar-container">
            <img
              src={"data:image/png;base64," + avatar}
              className="avatar"
              alt={"Avatar"}
            />
            <label htmlFor="upload-avatar" className="upload-avatar-label">
              Upload Image
            </label>
            <input
              onChange={imageEditHandler}
              id="upload-avatar"
              type="file"
              className="upload-avatar"
            />
          </div>
          <div className="user-profile-data">
            <label>Email: </label>
            <div onClick={() => setShowEmailEditModal(!showEmailEditModal)}>
              {userData.email}
              <i className="far fa-edit" />
            </div>
          </div>
          <button
            onClick={() => setShowPasswordEditModal(!showPasswordEditModal)}
            className="change-pass-button"
          >
            Change password
          </button>

          <EditImageModal
            avatarSetter={setAvatar}
            file={uploadedImage}
            fileSetter={setUploadedImage}
          />
          <EditEmailModal
            showEmailEditSetter={setShowEmailEditModal}
            show={showEmailEditModal}
          />
          <EditPasswordModal
            showPasswordEditSetter={setShowPasswordEditModal}
            show={showPasswordEditModal}
          />
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}

export default Profile;
