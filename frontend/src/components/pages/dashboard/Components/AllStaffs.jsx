import { useState, useEffect } from "react";
import { api } from "../../../../util";

export default function AllStaffs() {
    const [staffs, setStaffs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editUser, setEditUser] = useState(null);

    useEffect(() => {
        fetchStaffs();
    }, []);

    const fetchStaffs = async () => {
        try {
            const data = await api("/auth/users");
            setStaffs(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (staffId) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            try {
                await api(`/auth/users/${staffId}`, { method: "DELETE" });
                setStaffs(staffs.filter(s => s.id !== staffId));
            } catch (err) {
                alert("Failed to delete: " + err.message);
            }
        }
    };

    const handleEdit = (staff) => {
        setEditUser(staff);
    };

    const handleSaveUser = async (updatedData) => {
        try {
            await api(`/auth/users/${updatedData.id}`, {
                method: "PUT",
                body: updatedData
            });
            setStaffs(staffs.map(s => s.id === updatedData.id ? { ...s, ...updatedData } : s));
            setEditUser(null);
        } catch (err) {
            alert("Failed to update: " + err.message);
        }
    };

    if (loading) return <div className="p-4">Loading...</div>;
    if (error) return <div className="p-4 text-red-600">Error: {error}</div>;

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">All Staffs</h2>
                <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
                    + Add New Staff
                </button>
            </div>

            <div className="p-4">
                {/* Search/Filter Bar */}
                <div className="flex gap-4 mb-4">
                    <input className="border rounded-md px-3 py-2 w-full max-w-xs text-sm" placeholder="Staff Name" />
                    <input className="border rounded-md px-3 py-2 w-full max-w-xs text-sm" placeholder="Email" />
                    <select className="border rounded-md px-3 py-2 text-sm text-gray-600">
                        <option>Role</option>
                        <option>Admin</option>
                        <option>Clinician</option>
                        <option>Assistant</option>
                        <option>Technician</option>
                    </select>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-lime-500 text-white text-sm uppercase tracking-wider">
                                <th className="p-3 font-medium rounded-tl-lg">Staff ID</th>
                                <th className="p-3 font-medium">Staff Name</th>
                                <th className="p-3 font-medium">Mobile</th>
                                <th className="p-3 font-medium">Email</th>
                                <th className="p-3 font-medium">Role</th>
                                <th className="p-3 font-medium rounded-tr-lg text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm text-gray-700">
                            {staffs.map((staff, idx) => (
                                <tr key={staff.id} className="border-b last:border-0 hover:bg-gray-50 bg-lime-50/30">
                                    <td className="p-3">#{staff.id}</td>
                                    <td className="p-3 font-medium text-gray-900">{staff.name || "N/A"}</td>
                                    <td className="p-3">{staff.mobile || "N/A"}</td>
                                    <td className="p-3">{staff.email}</td>
                                    <td className="p-3">
                                        <span className="px-2 py-1 bg-gray-100 rounded text-xs font-semibold text-gray-600">
                                            {staff.role}
                                        </span>
                                    </td>
                                    <td className="p-3 flex justify-center gap-2">
                                        {/* Toggle Switch Placeholder */}
                                        <div className="relative inline-block w-8 h-4 align-middle select-none transition duration-200 ease-in">
                                            <input type="checkbox" name="toggle" id={`toggle-${staff.id}`} className="toggle-checkbox absolute block w-4 h-4 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 checked:border-green-400" />
                                            <label htmlFor={`toggle-${staff.id}`} className="toggle-label block overflow-hidden h-4 rounded-full bg-gray-300 cursor-pointer"></label>
                                        </div>

                                        <button className="text-blue-500 hover:text-blue-700" onClick={() => handleEdit(staff)}>✏️</button>
                                        <button className="text-red-500 hover:text-red-700" onClick={() => handleDelete(staff.id)}>🗑️</button>
                                    </td>
                                </tr>
                            ))}
                            {staffs.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="p-6 text-center text-gray-500">No staff found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Placeholder */}
                <div className="flex justify-end mt-4 gap-1">
                    <button className="px-2 py-1 border rounded hover:bg-gray-50 text-gray-500">«</button>
                    <button className="px-2 py-1 border rounded bg-indigo-600 text-white">1</button>
                    <button className="px-2 py-1 border rounded hover:bg-gray-50 text-gray-500">2</button>
                    <button className="px-2 py-1 border rounded hover:bg-gray-50 text-gray-500">3</button>
                    <button className="px-2 py-1 border rounded hover:bg-gray-50 text-gray-500">»</button>
                </div>
            </div>
            {editUser && (
                <EditUserModal
                    user={editUser}
                    onClose={() => setEditUser(null)}
                    onSave={handleSaveUser}
                />
            )}
        </div>
    );
}

function EditUserModal({ user, onClose, onSave }) {
    const [formData, setFormData] = useState({
        id: user.id,
        name: user.name || "",
        email: user.email,
        role: user.role,
        status: user.status ?? true
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">Edit User</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                        <input className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-500" value={formData.id} disabled />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">User Name</label>
                        <input name="name" className="w-full border border-gray-300 rounded px-3 py-2" value={formData.name} onChange={handleChange} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-500" value={formData.email} disabled />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <input className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-500" value={formData.role} disabled />
                    </div>
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">Status</label>
                        <div className="relative inline-block w-10 h-6 align-middle select-none transition duration-200 ease-in">
                            <input
                                type="checkbox"
                                name="status"
                                checked={formData.status}
                                onChange={handleChange}
                                id="edit-status-toggle"
                                className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 checked:border-green-400"
                            />
                            <label htmlFor="edit-status-toggle" className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${formData.status ? 'bg-green-400' : 'bg-gray-300'}`}></label>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 border border-green-200">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
