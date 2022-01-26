import React from "react";
import {useState} from 'react';
import "./Login.css";
import {Row, Col} from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate  } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import {
    loginUserRemember,
    loginUserForget,
} from "../../store/LoginUserReducer";
import ModalErrorMessage from '../../components/ModalErrorMessage/ModalErrorMessage'
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner'
import isEmpty from '../../functions/IsEmpty'
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage'
function Login() {
    const userData = useSelector(state=>state.login)
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState("");
    const [showErrorMessage, setShowErrorMessage] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    let showErrorTimeout
    function onLoginHandler(e) {
        e.preventDefault();
        const form = e.target;
        const username = form.username.value;
        const password = form.password.value;
        const remember_me = form.remember_me.checked;

        async function loginRequest() {
            setIsLoading(true)
            const config = {
                "Content-Type": "application/json",
            };
            const body = {
                username,
                password,
            };
            try {
                const response = await axios.post("users/login", body, config);
                const data = response.data;
                const login_data = {
                    username: data.username,
                    email: data.email,
                    isAdmin: data.isAdmin,
                    access: data.access,
                    refresh: data.refresh,
                    token: data.token,
                }
                if (remember_me) dispatch(loginUserRemember(login_data))
                else loginUserForget(login_data)
                navigate("/");
            }
            catch (e){
                if (e.response) {
                    setErrorMessage(e.response.data.detail);
                    setShowErrorMessage(true)
                    showErrorTimeout = setTimeout(()=>{setShowErrorMessage(false)}, 2500)
                }
            }
            setIsLoading(false)
        }

        loginRequest();

    }
    console.log(userData)
    return (
        <div >
            <div className="h1-header">SIGN IN</div>
            {
                isEmpty(userData) ? <div><form className="auth-form" onSubmit={onLoginHandler}>
                <label htmlFor="username" className="text-label">
                    Username
                </label>
                <input
                    name="username"
                    id="username"
                    placeholder="Your username"
                    type="username"
                    required
                    className="text-input"
                />
                <div className={"display-flex-inline"}>
                    <label htmlFor="password" className="text-label">
                        Password
                    </label>
                    <Link className={"reset_redirect"} to={"/passwordforgot"}>
                        forgot your password?
                    </Link>
                </div>
                <input
                    name="password"
                    id="password"
                    placeholder="Your password"
                    type="password"
                    required
                    className="text-input"
                />
                <Row className="row-fullwidth confirm-section">
                    <Col sm={12} md={12} lg={5} className={"col"}>
                        <div className="checkbox-container">
                            <input
                                name="remember_me"
                                type="checkbox"
                                id="checkbox"
                                className="checkbox"
                            />
                            <label htmlFor="checkbox" className="checkbox-label">
                                Remember Me
                            </label>
                        </div>
                    </Col>
                    <Col sm={12} md={12} lg={7} className={"col"}>
                        <button className="login-button">Log In</button>
                    </Col>
                </Row>
            </form>
                <Link className="login-redirect" to="/register">
                    Do not have an account yet? Sign up
                </Link>
                {
                    isLoading &&
                    <div className={"custom-Loading-Spinner"}>
                        <LoadingSpinner/>
                    </div>
                }
                <ModalErrorMessage show={showErrorMessage} text={errorMessage}/>
            </div>
                : <ErrorMessage>You are already logged in. Log out to view the page!</ErrorMessage>
            }
        </div>
    );
}

export default Login;
