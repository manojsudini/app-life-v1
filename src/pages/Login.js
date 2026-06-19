import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import BloodDonationIllustration from "../components/BloodDonationIllustration";
import { useAuth } from "../context/AuthContext";

const initialForm = {
  email: "",
  password: "",
};

function Login() {
  const { currentUser, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = React.useState(initialForm);
  const [error, setError] = React.useState("");
  const [notice, setNotice] = React.useState(location.state?.from ? "Please login to continue." : "");
  const fromPath = location.state?.from?.pathname || "/dashboard";

  React.useEffect(() => {
    if (currentUser) {
      navigate("/dashboard", { replace: true });
    }
  }, [currentUser, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");
    setNotice("");

    try {
      login(form);
      navigate(fromPath, { replace: true });
    } catch (submissionError) {
      setError(submissionError.message);
    }
  };

  return (
    <section className="auth-section">
      <div className="site-shell">
        <div className="auth-grid">
          <div className="auth-copy card-panel">
            <span className="section-kicker">Welcome back</span>
            <h1>Login to continue blood search, donor tools, and patient requests.</h1>
            <p>
              Protected dashboard features, donor registration, and patient request creation all require a
              signed-in account with the correct role.
            </p>
            <BloodDonationIllustration />
            <div className="auth-badge-row">
              <span className="status-pill">JWT-style session</span>
              <span className="status-pill">Role based access</span>
              <span className="status-pill">Global search</span>
            </div>
          </div>

          <div className="auth-form-panel card-panel">
            <div className="section-heading compact">
              <div>
                <span className="section-kicker">Login</span>
                <h2>Access your dashboard</h2>
              </div>
            </div>

            {notice ? <p className="form-notice">{notice}</p> : null}
            {error ? <p className="form-error">{error}</p> : null}

            <form className="stack-form" onSubmit={handleSubmit}>
              <label className="field-group">
                <span className="field-label">Email</span>
                <input
                  className="text-field"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  required
                />
              </label>

              <label className="field-group">
                <span className="field-label">Password</span>
                <input
                  className="text-field"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  required
                />
              </label>

              <button className="button primary full-width" type="submit">
                Login
              </button>
            </form>

            <div className="auth-footnote">
              <span>New here?</span>
              <Link to="/register">Create an account</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Login;

