import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, fetchCurrentUser, setToken } from "../../../util";

function getErrorMessage(error) {
  try {
    const parsed = JSON.parse(error.message);
    return parsed.detail || "Unable to create account.";
  } catch {
    return "Unable to create account.";
  }
}

export default function SignupForm({ onSignup }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const { access_token } = await api("/auth/signup", {
        method: "POST",
        timeoutMs: 15000,
        body: {
          name: form.name,
          email: form.email,
          mobile: form.mobile || null,
          password: form.password,
        },
      });
      setToken(access_token);
      let user = null;
      try {
        user = await fetchCurrentUser(5000);
      } catch {
        // Account creation already succeeded; continue to app shell.
      }
      onSignup?.(user);
      navigate("/", { replace: true });
    } catch (signupError) {
      setError(getErrorMessage(signupError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-sky-500 via-cyan-500 to-emerald-500 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-lg space-y-4 animate-fadeIn"
      >
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Create Your Account
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Register to access the NeuroSight dashboard
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <label className="text-gray-700 text-sm font-medium">Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="Jane Doe"
              value={form.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
              required
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-gray-700 text-sm font-medium">Email</label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
              required
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-gray-700 text-sm font-medium">Mobile</label>
            <input
              type="tel"
              name="mobile"
              placeholder="Optional"
              value={form.mobile}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
            />
          </div>

          <div className="space-y-2">
            <label className="text-gray-700 text-sm font-medium">Password</label>
            <input
              type="password"
              name="password"
              placeholder="At least 8 characters"
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-gray-700 text-sm font-medium">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Repeat password"
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
              required
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-600 text-center">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 text-white font-semibold rounded-lg transition ${
            loading
              ? "bg-cyan-300 cursor-not-allowed"
              : "bg-cyan-600 hover:bg-cyan-700"
          }`}
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account? <Link to="/login" className="text-cyan-700 font-semibold hover:underline">Log in</Link>
        </p>
      </form>
    </div>
  );
}