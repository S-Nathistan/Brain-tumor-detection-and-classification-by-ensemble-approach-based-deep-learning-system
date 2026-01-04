import { useState } from "react";
import { api, setToken } from "../../../util";

export default function LoginForm({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const { access_token } = await api("/auth/login", {
        method: "POST",
        body: { email, password },
      });
      setToken(access_token);
      onLogin?.();
    } catch (e) {
      setErr("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <form
        onSubmit={submit}
        className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md space-y-4 animate-fadeIn"
      >
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">
          Brain Tumor Detection
        </h2>
        <p className="text-center text-gray-500 mb-6">Login to access dashboard</p>

        <div className="space-y-2">
          <label className="text-gray-700 text-sm font-medium">Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-gray-700 text-sm font-medium">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            required
          />
        </div>

        {err && <p className="text-sm text-red-600 text-center">{err}</p>}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 text-white font-semibold rounded-lg transition ${
            loading
              ? "bg-indigo-300 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {loading ? "Logging in..." : "Log In"}
        </button>

        <p className="text-center text-sm text-gray-500 mt-4">
          Don’t have an account? <a href="#" className="text-indigo-600 font-semibold hover:underline">Sign up</a>
        </p>
      </form>
    </div>
  );
}
