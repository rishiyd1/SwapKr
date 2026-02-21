import React, { useState, useEffect } from 'react';
import {
    Users,
    Package,
    MessageSquare,
    Shield,
    Trash2,
    CheckCircle,
    XCircle,
    Clock,
    ExternalLink
} from 'lucide-react';
import { apiRequest } from '../lib/api';
import { toast } from 'sonner';

const Admin = () => {
    const [stats, setStats] = useState({ totalUsers: 0, totalItems: 0, totalRequests: 0 });
    const [users, setUsers] = useState([]);
    const [pendingItems, setPendingItems] = useState([]);
    const [activeTab, setActiveTab] = useState('users'); // 'users' | 'pending-items'
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [statsRes, usersRes, itemsRes] = await Promise.all([
                apiRequest('/api/admin/stats', 'GET'),
                apiRequest('/api/admin/users', 'GET'),
                apiRequest('/api/admin/items?status=Pending', 'GET')
            ]);

            setStats(statsRes);
            setUsers(usersRes);
            setPendingItems(itemsRes);
            setLoading(false);
        } catch (err) {
            setError(err.message || 'Failed to fetch admin data');
            setLoading(false);
        }
    };

    const handleUpdateRole = async (userId, newRole) => {
        try {
            await apiRequest(`/api/admin/users/${userId}/role`, 'PATCH', { role: newRole });
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
            toast.success('User role updated');
        } catch (err) {
            toast.error(err.message || 'Failed to update role');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure? This will delete the user and all their listings.')) return;
        try {
            await apiRequest(`/api/admin/users/${userId}`, 'DELETE');
            setUsers(users.filter(u => u.id !== userId));
            setStats(prev => ({ ...prev, totalUsers: prev.totalUsers - 1 }));
            toast.success('User deleted');
        } catch (err) {
            toast.error(err.message || 'Failed to delete user');
        }
    };

    const handleApproveItem = async (itemId) => {
        try {
            await apiRequest(`/api/admin/items/${itemId}/status`, 'PATCH', { status: 'Available' });
            setPendingItems(pendingItems.filter(item => item.id !== itemId));
            toast.success('Item approved and is now live!');
        } catch (err) {
            toast.error(err.message || 'Failed to approve item');
        }
    };

    const handleRejectItem = async (itemId) => {
        if (!window.confirm('Are you sure you want to reject and delete this listing?')) return;
        try {
            await apiRequest(`/api/admin/items/${itemId}`, 'DELETE');
            setPendingItems(pendingItems.filter(item => item.id !== itemId));
            toast.success('Item listing rejected and deleted');
        } catch (err) {
            toast.error(err.message || 'Failed to reject item');
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="bg-red-50 text-red-700 p-6 rounded-xl border border-red-100 max-w-md text-center">
                <Shield className="w-12 h-12 mx-auto mb-4 text-red-500" />
                <h2 className="text-xl font-bold mb-2">Access Denied</h2>
                <p>{error}</p>
                <button
                    onClick={() => window.location.href = '/'}
                    className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                    Back to Home
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Dashboard</h1>
                    <p className="mt-2 text-slate-600">Platform management and quality control.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <StatCard
                        title="Total Users"
                        value={stats.totalUsers}
                        icon={<Users className="w-6 h-6 text-indigo-600" />}
                        color="bg-indigo-50"
                    />
                    <StatCard
                        title="Total Listings"
                        value={stats.totalItems}
                        icon={<Package className="w-6 h-6 text-emerald-600" />}
                        color="bg-emerald-50"
                    />
                    <StatCard
                        title="Exchange Requests"
                        value={stats.totalRequests}
                        icon={<MessageSquare className="w-6 h-6 text-amber-600" />}
                        color="bg-amber-50"
                    />
                </div>

                {/* Tab Selection */}
                <div className="flex bg-white p-1 rounded-xl border border-slate-200 w-fit mb-8 shadow-sm">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'users'
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        Manage Users
                    </button>
                    <button
                        onClick={() => setActiveTab('pending-items')}
                        className={`px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'pending-items'
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        Pending Listings
                        {pendingItems.length > 0 && (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'pending-items' ? 'bg-white text-indigo-600' : 'bg-indigo-100 text-indigo-600'
                                }`}>
                                {pendingItems.length}
                            </span>
                        )}
                    </button>
                </div>

                {/* Conditional Table Rendering */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    {activeTab === 'users' ? (
                        <>
                            <div className="px-6 py-4 border-b border-slate-200">
                                <h2 className="text-lg font-semibold text-slate-900">Registered Users</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                                        <tr>
                                            <th className="px-6 py-4">User</th>
                                            <th className="px-6 py-4">Department</th>
                                            <th className="px-6 py-4">Role</th>
                                            <th className="px-6 py-4">Tokens</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {users.map((user) => (
                                            <tr key={user.id} className="hover:bg-slate-50 transition">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                                                            {user.name.charAt(0)}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-slate-900">{user.name}</div>
                                                            <div className="text-sm text-slate-500">{user.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600">
                                                    {user.department || 'N/A'} - {user.year || 'N/A'} Year
                                                </td>
                                                <td className="px-6 py-4">
                                                    <select
                                                        value={user.role}
                                                        onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                                                        className={`text-xs font-semibold px-2 py-1 rounded-full border-none focus:ring-2 focus:ring-indigo-500 ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'
                                                            }`}
                                                    >
                                                        <option value="user">User</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                                                    {user.tokens}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => handleDeleteUser(user.id)}
                                                        className="text-slate-400 hover:text-red-600 transition p-2 hover:bg-red-50 rounded-lg"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="px-6 py-4 border-b border-slate-200">
                                <h2 className="text-lg font-semibold text-slate-900">Items Awaiting Approval</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                                        <tr>
                                            <th className="px-6 py-4">Item Details</th>
                                            <th className="px-6 py-4">Seller</th>
                                            <th className="px-6 py-4">Price</th>
                                            <th className="px-6 py-4">Posted</th>
                                            <th className="px-6 py-4 text-right">Decision</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {pendingItems.length > 0 ? pendingItems.map((item) => (
                                            <tr key={item.id} className="hover:bg-slate-50 transition">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <div className="h-16 w-16 rounded-lg bg-slate-100 flex-shrink-0 overflow-hidden border border-slate-200">
                                                            {item.images && item.images.length > 0 ? (
                                                                <img src={item.images[0].imageUrl} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                                                            )}
                                                        </div>
                                                        <div className="ml-4 max-w-xs">
                                                            <div className="text-sm font-bold text-slate-900 truncate">{item.title}</div>
                                                            <div className="text-xs text-slate-500 line-clamp-2 mt-1">{item.description}</div>
                                                            <div className="mt-1 flex gap-2">
                                                                <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-medium">{item.category}</span>
                                                                <span className="text-[10px] bg-slate-50 text-slate-600 px-1.5 py-0.5 rounded font-medium">{item.condition}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-slate-900">{item.seller?.name || 'Unknown'}</div>
                                                    <div className="text-xs text-slate-500">{item.seller?.hostel || ''}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-bold text-indigo-600">₹{item.price}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center text-xs text-slate-500 gap-1.5">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        {new Date(item.createdAt).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => handleApproveItem(item.id)}
                                                            className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-lg transition"
                                                            title="Approve"
                                                        >
                                                            <CheckCircle className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleRejectItem(item.id)}
                                                            className="p-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition"
                                                            title="Reject"
                                                        >
                                                            <XCircle className="w-5 h-5" />
                                                        </button>
                                                        <a
                                                            href={`/item/${item.id}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="p-2 bg-slate-50 text-slate-500 hover:bg-slate-200 rounded-lg transition"
                                                            title="Preview"
                                                        >
                                                            <ExternalLink className="w-5 h-5" />
                                                        </a>
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-20 text-center">
                                                    <div className="flex flex-col items-center opacity-40">
                                                        <Package className="w-12 h-12 mb-3" />
                                                        <p className="font-medium">No pending listings to review.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center">
        <div className={`p-4 rounded-xl ${color} mr-5`}>
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        </div>
    </div>
);

export default Admin;
