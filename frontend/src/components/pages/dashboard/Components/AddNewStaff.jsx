import { useState } from "react";
import { api } from "../../../../util";
import { useNavigate } from "react-router-dom";

export default function AddNewStaff() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        mobile: "",
        role: "Clinician",
        password: "",
        status: true
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await api("/auth/register", {
                method: "POST",
                body: formData
            });
            navigate("/staff");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-800">Add New Staff</h1>
                <button
                    type="submit"
                    form="add-staff-form"
                    disabled={loading}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition">
                    {loading ? "Adding..." : "+ Add New Staff"}
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">{error}</div>}

                <form id="add-staff-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Staff Name</label>
                        <input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                            placeholder="Enter full name"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Staff ID</label>
                        <input
                            disabled
                            className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-2.5 text-gray-500"
                            placeholder="Auto-generated"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                            placeholder="Enter email address"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                            placeholder="Enter password"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Mobile</label>
                        <input
                            name="mobile"
                            value={formData.mobile}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                            placeholder="Enter mobile number"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Role</label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition bg-white"
                        >
                            <option value="Admin">Admin</option>
                            <option value="Clinician">Clinician</option>
                            <option value="Assistant">Assistant</option>
                            <option value="Technician">Technician</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <div className="flex items-center gap-3 pt-2">
                            <span className="text-sm text-gray-600">Active</span>
                            <div className="relative inline-block w-10 h-6 align-middle select-none transition duration-200 ease-in">
                                <input
                                    type="checkbox"
                                    name="status"
                                    checked={formData.status}
                                    onChange={handleChange}
                                    id="status-toggle"
                                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 checked:border-green-400"
                                />
                                <label htmlFor="status-toggle" className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${formData.status ? 'bg-green-400' : 'bg-gray-300'}`}></label>
                            </div>
                        </div>
                    </div>

                </form>
            </div>
        </div>
    );
}
