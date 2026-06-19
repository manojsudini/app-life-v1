import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import bloodDonation from "./images/bloof.png";
import { useAuth } from "../context/AuthContext";
import { getCountries, getStatesForCountry } from "../utils/appData";

const initialLoginForm = {
  email: "",
  password: "",
};

const initialRegisterForm = {
  name: "",
  email: "",
  password: "",
  homeCountry: "India",
  homeState: "Tamil Nadu",
};

const Content = () => {
  const texts = useMemo(() => ["Welcome!", "We connect lives.", "Donate & Save Lives"], []);
  const { currentUser, login, register } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const blockedPath = location.state?.from?.pathname || "";
  const blockedLabel = blockedPath === "/patients" ? "patient page" : "donor page";

  const [text, setText] = useState("");
  const [charIndex, setCharIndex] = useState(0);
  const [textIndex, setTextIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [mode, setMode] = useState("login");
  const [showAuthPanel, setShowAuthPanel] = useState(false);
  const [loginForm, setLoginForm] = useState(initialLoginForm);
  const [registerForm, setRegisterForm] = useState(initialRegisterForm);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const countries = getCountries();
  const registerStates = getStatesForCountry(registerForm.homeCountry);

  useEffect(() => {
    const speed = isDeleting ? 70 : 130;

    const timer = window.setTimeout(() => {
      const currentText = texts[textIndex];

      if (!isDeleting && charIndex < currentText.length) {
        setText(currentText.slice(0, charIndex + 1));
        setCharIndex((current) => current + 1);
        return;
      }

      if (!isDeleting && charIndex === currentText.length) {
        setIsDeleting(true);
        return;
      }

      if (isDeleting && charIndex > 0) {
        setText(currentText.slice(0, charIndex - 1));
        setCharIndex((current) => current - 1);
        return;
      }

      setIsDeleting(false);
      setTextIndex((current) => (current + 1) % texts.length);
    }, isDeleting && charIndex === texts[textIndex].length ? 900 : speed);

    return () => window.clearTimeout(timer);
  }, [charIndex, isDeleting, textIndex, texts]);

  useEffect(() => {
    if (blockedPath) {
      setMode("login");
      setShowAuthPanel(true);
    }
  }, [blockedPath]);

  const handleLoginChange = (event) => {
    const { name, value } = event.target;
    setLoginForm((current) => ({ ...current, [name]: value }));
  };

  const handleRegisterChange = (event) => {
    const { name, value } = event.target;

    setRegisterForm((current) => {
      if (name === "homeCountry") {
        const nextStates = getStatesForCountry(value);
        return {
          ...current,
          homeCountry: value,
          homeState: nextStates[0] || "",
        };
      }

      return { ...current, [name]: value };
    });
  };

  const finishAuth = () => {
    if (blockedPath) {
      navigate(blockedPath, { replace: true });
      return;
    }

    setNotice("Login successful. Donor and patient pages are now open.");
  };

  const handleLoginSubmit = (event) => {
    event.preventDefault();
    setError("");
    setNotice("");

    try {
      login(loginForm);
      finishAuth();
    } catch (submissionError) {
      setError(submissionError.message);
    }
  };

  const handleRegisterSubmit = (event) => {
    event.preventDefault();
    setError("");
    setNotice("");

    try {
      register(registerForm);
      finishAuth();
    } catch (submissionError) {
      setError(submissionError.message);
    }
  };

  return (
    <section className="home-section">
      <div className="main-container">
        <div className="image">
          <img src={bloodDonation} alt="Blood Donation" />
        </div>

        <div className="content">
          <div className="typewriter">
            I'm a <span className="typewriter-text">{text}</span>|
          </div>

          <p>
            <strong>Blood donors</strong> are lifesavers who selflessly give the gift of life by donating
            blood, helping patients in critical need. <strong>Recipients</strong> depend on these donations
            for survival, and one login on this homepage unlocks the donor and patient pages.
          </p>

          {blockedPath ? <p className="form-error">Please login first to open the {blockedLabel}.</p> : null}
          {notice ? <p className="form-success">{notice}</p> : null}
          {error ? <p className="form-error">{error}</p> : null}

          {currentUser ? (
            <div className="home-auth-box">
              <h3>Welcome, {currentUser.name}</h3>
              <p>Your account is active now. You can open the protected pages directly.</p>
              <div className="home-actions">
                <Link className="home-action-link" to="/donors">
                  <button type="button">Donors</button>
                </Link>
                <Link className="home-action-link" to="/patients">
                  <button type="button">Patient</button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="btn">
                <button
                  type="button"
                  onClick={() => {
                    setShowAuthPanel((current) => !current);
                    setMode("login");
                    setError("");
                  }}
                >
                  Login
                </button>
              </div>

              {showAuthPanel ? (
                <div className="home-auth-box" id="home-login">
                  <div className="auth-switch">
                    <button
                      className={mode === "login" ? "active" : ""}
                      type="button"
                      onClick={() => {
                        setMode("login");
                        setError("");
                      }}
                    >
                      Login
                    </button>
                    <button
                      className={mode === "register" ? "active" : ""}
                      type="button"
                      onClick={() => {
                        setMode("register");
                        setError("");
                      }}
                    >
                      Create Account
                    </button>
                  </div>

                  {mode === "login" ? (
                    <form className="form-stack" onSubmit={handleLoginSubmit}>
                      <label>
                        Email
                        <input
                          name="email"
                          type="email"
                          value={loginForm.email}
                          onChange={handleLoginChange}
                          placeholder="name@example.com"
                        />
                      </label>
                      <label>
                        Password
                        <input
                          name="password"
                          type="password"
                          value={loginForm.password}
                          onChange={handleLoginChange}
                          placeholder="Enter password"
                        />
                      </label>
                      <div className="btn auth-submit">
                        <button type="submit">Login</button>
                      </div>
                    </form>
                  ) : (
                    <form className="form-stack" onSubmit={handleRegisterSubmit}>
                      <label>
                        Full name
                        <input
                          name="name"
                          value={registerForm.name}
                          onChange={handleRegisterChange}
                          placeholder="Your name"
                        />
                      </label>
                      <label>
                        Email
                        <input
                          name="email"
                          type="email"
                          value={registerForm.email}
                          onChange={handleRegisterChange}
                          placeholder="name@example.com"
                        />
                      </label>
                      <label>
                        Password
                        <input
                          name="password"
                          type="password"
                          value={registerForm.password}
                          onChange={handleRegisterChange}
                          placeholder="Create password"
                        />
                      </label>
                      <div className="form-row">
                        <label>
                          Country
                          <select name="homeCountry" value={registerForm.homeCountry} onChange={handleRegisterChange}>
                            {countries.map((country) => (
                              <option key={country} value={country}>
                                {country}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label>
                          State
                          <select name="homeState" value={registerForm.homeState} onChange={handleRegisterChange}>
                            {registerStates.map((state) => (
                              <option key={state} value={state}>
                                {state}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                      <div className="btn auth-submit">
                        <button type="submit">Create Account</button>
                      </div>
                    </form>
                  )}
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default Content;
