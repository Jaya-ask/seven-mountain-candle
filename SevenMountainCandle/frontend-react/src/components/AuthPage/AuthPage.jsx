import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./AuthPage.scss";

const loginInitialForm = {
  email: "",
  password: ""
};

const registerInitialForm = {
  name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  password: "",
  confirmPassword: ""
};

function isValidEmail(email) {
  return typeof email === "string" && email.includes("@") && email.includes(".");
}

export default function AuthPage({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState("login");
  const [loginForm, setLoginForm] = useState(loginInitialForm);
  const [registerForm, setRegisterForm] = useState(registerInitialForm);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTarget = useMemo(() => {
    const requestedPath = searchParams.get("redirect");
    return requestedPath && requestedPath.startsWith("/") ? requestedPath : "/shop";
  }, [searchParams]);

  function handleModeChange(nextMode) {
    setMode(nextMode);
    setError("");
    setSuccessMessage("");
  }

  function handleLoginChange(event) {
    const { name, value } = event.target;
    setLoginForm((current) => ({ ...current, [name]: value }));
    setError("");
  }

  function handleRegisterChange(event) {
    const { name, value } = event.target;
    setRegisterForm((current) => ({ ...current, [name]: value }));
    setError("");
  }

  async function handleLoginSubmit(event) {
    event.preventDefault();

    if (!isValidEmail(loginForm.email)) {
      setError("Enter a valid email address.");
      return;
    }

    if (!loginForm.password.trim()) {
      setError("Password is required.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(loginForm)
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.message || "Unable to login right now.");
      }

      onLoginSuccess?.({ token: payload.token, user: payload.user });
      navigate(redirectTarget, { replace: true });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (submitError) {
      setError(submitError?.message || "Unable to login right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRegisterSubmit(event) {
    event.preventDefault();

    if (!registerForm.name.trim()) {
      setError("Name is required.");
      return;
    }

    if (!isValidEmail(registerForm.email)) {
      setError("Enter a valid email address.");
      return;
    }

    if (!registerForm.phone.trim()) {
      setError("Phone number is required.");
      return;
    }

    if (!registerForm.address.trim()) {
      setError("Address is required.");
      return;
    }

    if (!registerForm.city.trim()) {
      setError("City is required.");
      return;
    }

    if (!registerForm.password.trim()) {
      setError("Password is required.");
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      setError("Password and confirm password must match.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(registerForm)
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.message || "Unable to register right now.");
      }

      setRegisterForm(registerInitialForm);
      setMode("login");
      setSuccessMessage("Registration successful. Please login with your new account.");
    } catch (submitError) {
      setError(submitError?.message || "Unable to register right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <p className="eyebrow align-center">Welcome to Seven Mountains Candle Studio</p>

        <div className="auth-mode-toggle" role="tablist" aria-label="Authentication mode">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "login"}
            className={mode === "login" ? "active" : ""}
            onClick={() => handleModeChange("login")}
          >
            Login
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "register"}
            className={mode === "register" ? "active" : ""}
            onClick={() => handleModeChange("register")}
          >
            Register
          </button>
        </div>

        {mode === "login" ? (
          <form className="auth-form" onSubmit={handleLoginSubmit} noValidate>
            <label>
              Email
              <input
                type="email"
                name="email"
                value={loginForm.email}
                onChange={handleLoginChange}
                autoComplete="email"
                placeholder="name@example.com"
              />
            </label>

            <label>
              Password
              <input
                type="password"
                name="password"
                value={loginForm.password}
                onChange={handleLoginChange}
                autoComplete="current-password"
              />
            </label>

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Logging in..." : "Login"}
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleRegisterSubmit} noValidate>
            <label>
              Name
              <input
                type="text"
                name="name"
                value={registerForm.name}
                onChange={handleRegisterChange}
                autoComplete="name"
              />
            </label>

            <label>
              Email
              <input
                type="email"
                name="email"
                value={registerForm.email}
                onChange={handleRegisterChange}
                autoComplete="email"
              />
            </label>

            <label>
              Phone Number
              <input
                type="tel"
                name="phone"
                value={registerForm.phone}
                onChange={handleRegisterChange}
                autoComplete="tel"
              />
            </label>

            <label>
              Address
              <input
                type="text"
                name="address"
                value={registerForm.address}
                onChange={handleRegisterChange}
                autoComplete="street-address"
              />
            </label>

            <label>
              City
              <input
                type="text"
                name="city"
                value={registerForm.city}
                onChange={handleRegisterChange}
                autoComplete="address-level2"
              />
            </label>

            <label>
              Password
              <input
                type="password"
                name="password"
                value={registerForm.password}
                onChange={handleRegisterChange}
                autoComplete="new-password"
              />
            </label>

            <label>
              Confirm Password
              <input
                type="password"
                name="confirmPassword"
                value={registerForm.confirmPassword}
                onChange={handleRegisterChange}
                autoComplete="new-password"
              />
            </label>

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Registering..." : "Register"}
            </button>
          </form>
        )}

        {error ? <p className="auth-message error">{error}</p> : null}
        {successMessage ? <p className="auth-message success">{successMessage}</p> : null}
      </section>
    </main>
  );
}
