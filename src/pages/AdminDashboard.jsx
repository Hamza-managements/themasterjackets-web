import React, { useState, useEffect, useContext } from 'react';
import "./styles/AdminDashboard.css";
import AOS from 'aos';
import 'aos/dist/aos.css';
import {
    Chart as ChartJS, CategoryScale,
    LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement, ArcElement
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { FiHome, FiUsers, FiSettings, FiPieChart, FiShoppingCart, FiMail, FiBell, FiMenu, FiSun, FiMoon } from 'react-icons/fi';
import { RiRefund2Fill } from "react-icons/ri";
import { AuthContext } from '../components/auth/AuthProvider';
import { Link, useNavigate } from 'react-router-dom';
import AdminSettings from '../components/AdminDashboardSettings';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement, ArcElement);

const AdminDashboard = () => {
    const { user, logout, isAdmin } = useContext(AuthContext);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileView, setMobileView] = useState(false);
    const [activeMenu, setActiveMenu] = useState('dashboard');
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const navigate = useNavigate();

    const [darkMode, setDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('darkMode');
            if (saved !== null) return JSON.parse(saved);
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return false;
    });


    useEffect(() => {
        AOS.init();
        handleRole();
        const handleResize = () => {
            setMobileView(window.innerWidth < 768);
            if (window.innerWidth < 768) {
                setSidebarOpen(false);
            } else {
                setSidebarOpen(true);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const html = document.documentElement;
        if (darkMode) {
            html.classList.add('dark');
        } else {
            html.classList.remove('dark');
        }
    }, [darkMode]);

    const salesData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                label: 'Sales 2023',
                data: [65, 59, 80, 81, 56, 55],
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
            },
        ],
    };

    const userGrowthData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                label: 'New Users',
                data: [12, 19, 3, 5, 2, 3],
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
            },
        ],
    };

    const revenueSourcesData = {
        labels: ['Products', 'Services', 'Subscriptions'],
        datasets: [
            {
                data: [300, 50, 100],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                ],
                borderWidth: 1,
            },
        ],
    };

    // Sample recent orders
    const recentOrders = [
        { id: 1, customer: 'John Doe', product: 'Austin Leather Jacket', amount: '$139.00', status: 'Completed' },
        { id: 2, customer: 'Jane Smith', product: 'David Brown Leather Jacket', amount: '$129.00', status: 'Pending' },
        { id: 3, customer: 'Robert Johnson', product: 'Bristol Black Leather Jacket', amount: '$149.00', status: 'Completed' },
        { id: 4, customer: 'Emily Davis', product: 'Cafe Racer Leather Jacket', amount: '$129.00', status: 'Failed' },
        { id: 5, customer: 'Michael Brown', product: 'Negan Leather Jacket', amount: '$199.00', status: 'Processing' },
    ];

    // Stats cards data
    const stats = [
        { title: 'Sales', value: '$12,345', change: '+12%', icon: <FiPieChart /> },
        { title: 'Open Orders', value: '126', change: '+7%', icon: <FiShoppingCart /> },
        { title: 'Buyer Messages', value: '4', change: '+5%', icon: <FiMail /> },
        { title: 'Returns and Refunds', value: '2', change: '-3%', icon: <RiRefund2Fill /> },
    ];

    const handleRole = async (e) => {
        if (!isAdmin) {
            navigate('/');
        }
    };
    return (
        <div className={`flex h-screen bg-gray-100 ${darkMode ? 'dark bg-gray-800' : ''}`}>
            {/* Sidebar */}
            <div
                className={`${sidebarOpen ? "w-48" : "w-0"} ${darkMode ? "dark bg-gray-800" : "bg-white"}overflow-hidden transition-all duration-300 shadow-md md:relative z-10`}>
                <div className={`p-4 flex justify-between items-center border-b border-gray-200 ${darkMode ? "dark bg-gray-800" : ""}`}   >
                    {sidebarOpen && (
                        <h1
                            className="text-xl font-bold text-gray-800 dark:text-white cursor-pointer"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                        >
                            AdminPanel
                        </h1>
                    )}
                </div>

                <nav className={`mt-6 ${sidebarOpen ? '' : 'd-none'}`}>
                    <NavItem
                        icon={<FiHome />}
                        text="Dashboard"
                        active={activeMenu === 'dashboard'}
                        expanded={sidebarOpen}
                        onClick={() => setActiveMenu('dashboard')}
                    />
                    <NavItem
                        icon={<FiShoppingCart />}
                        text="Orders"
                        active={activeMenu === 'orders'}
                        expanded={sidebarOpen}
                        onClick={() => setActiveMenu('orders')}
                    />
                    <NavItem
                        icon={<FiUsers />}
                        text="Users"
                        active={activeMenu === 'users'}
                        expanded={sidebarOpen}
                        onClick={() => setActiveMenu('users')}
                    />
                    <NavItem
                        icon={<FiShoppingCart />}
                        text="Products"
                        active={activeMenu === 'products'}
                        expanded={sidebarOpen}
                        onClick={() => setActiveMenu('products')}
                    />
                    <NavItem
                        icon={<FiMail />}
                        text="Messages"
                        active={activeMenu === 'messages'}
                        expanded={sidebarOpen}
                        onClick={() => setActiveMenu('messages')}
                    />
                    <NavItem
                        icon={<FiSettings />}
                        text="Settings"
                        active={activeMenu === 'settings'}
                        expanded={sidebarOpen}
                        onClick={() => setActiveMenu('settings')}
                    />
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                {/* Header */}
                <header className={`${darkMode ? 'dark bg-gray-800 text-white' : 'bg-white'} shadow-sm p-4 flex justify-between items-center top-0 z-10`}>
                    <div className="flex items-center justify-between">
                        {mobileView && (
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className={`p-2 rounded-lg transition ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                                    }`}
                            >
                                <FiMenu size={20} className="text-gray-700 dark:text-gray-200" />
                            </button>
                        )}
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white capitalize ml-2">
                            {activeMenu}
                        </h2>
                    </div>


                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300"
                            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                        >
                            {darkMode ? (
                                <FiSun size={20} className="text-yellow-400" />
                            ) : (
                                <FiMoon size={20} className="text-gray-600 dark:text-gray-300" />
                            )}
                        </button>

                        <div className="relative">
                            <button
                                onClick={() => {
                                    setNotificationsOpen(!notificationsOpen);
                                    setProfileOpen(false);
                                }}
                                className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} relative`}
                            >
                                <FiBell size={20} />
                                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
                            </button>

                            {notificationsOpen && (
                                <div className={`absolute right-0 mt-2 w-72 rounded-lg shadow-lg py-2 z-20 ${darkMode ? 'bg-gray-800 ' : 'bg-white'}`} >
                                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                                        <h3 className="font-medium text-gray-800 dark:text-white">Notifications</h3>
                                    </div>
                                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {[1, 2, 3].map((item) => (
                                            <div key={item} className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                                    New order received #{1000 + item}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="px-4 py-2 text-center text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                                        onClick={() => setActiveMenu('orders')}>
                                        View all notifications
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="relative">
                            <button
                                onClick={() => {
                                    setProfileOpen(!profileOpen);
                                    setNotificationsOpen(false);
                                }}
                                className="flex items-center space-x-2 focus:outline-none"
                            >
                                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                                    {user && user.userName ? user.userName.charAt(0).toUpperCase() : 'A'}
                                </div>
                                {sidebarOpen && (
                                    <span className={`${darkMode ? 'text-white' : 'text-gray-700'}`}>{user.userName}</span>
                                )}
                            </button>

                            {profileOpen && (
                                <div className={`absolute right-0 mt-2 w-32 ${darkMode ? 'dark bg-gray-900' : 'bg-white'} rounded-lg shadow-lg py-1 z-20`}>
                                    <button
                                        href="#"
                                        className={`block px-4 py-2 text-sm ${darkMode ? 'text-gray-300 hover:bg-gray-700' : ' text-gray-700 hover:bg-gray-100'}`}
                                        onClick={() => setActiveMenu('settings')}
                                    >
                                        Settings
                                    </button>
                                    <button
                                        href="#"
                                        onClick={logout}
                                        className={`block px-4 py-2 text-sm ${darkMode ? 'text-gray-300 hover:bg-gray-700' : ' text-gray-700 hover:bg-gray-100'}`}
                                    >
                                        Sign out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Dashboard Content */}
                <main className={`p-4 ${darkMode ? 'dark bg-gray-800' : 'bg-white'}`}>
                    {activeMenu === 'dashboard' && (
                        <>
                            {/* Stats Cards */}
                            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 ${darkMode ? 'dark bg-gray-800' : 'bg-white'}`}>
                                {stats.map((stat, index) => (
                                    <StatCard
                                        key={index}
                                        title={stat.title}
                                        value={stat.value}
                                        change={stat.change}
                                        icon={stat.icon}
                                        darkMode={darkMode}
                                    />
                                ))}
                            </div>

                            {/* Recent Orders */}
                            <div className={`${darkMode ? 'dark bg-gray-900 text-white' : 'bg-white'} p-4 rounded-lg shadow mb-6 overflow-x-auto`}>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-medium">
                                        Recent Orders
                                    </h3>
                                    <button className="text-sm text-blue-500 hover:underline"
                                        onClick={() => setActiveMenu('orders')}>
                                        View All
                                    </button>
                                </div>

                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                                    <thead className={darkMode ? 'bg-gray-800' : 'bg-gray-50'}>
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                                                Order ID
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                                                Customer
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                                                Product
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                                                Amount
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className={`${darkMode ? 'bg-gray-900 divide-gray-700' : 'bg-white divide-gray-200'} divide-y`}>
                                        {recentOrders.map((order) => (
                                            <tr key={order.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">
                                                    #{order.id}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                    {order.customer}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">
                                                    {order.product}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">
                                                    {order.amount}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === 'Completed'
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                            : order.status === 'Pending'
                                                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                                : order.status === 'Processing'
                                                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                            }`}
                                                    >
                                                        {order.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>


                            {/* Charts */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm lg:col-span-2">
                                    <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
                                        Sales Overview
                                    </h3>
                                    <Line data={salesData} />
                                </div>

                                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                                    <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
                                        Revenue Sources
                                    </h3>
                                    <Pie data={revenueSourcesData} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6 mb-6">
                                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                                    <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
                                        User Growth
                                    </h3>
                                    <Bar data={userGrowthData} />
                                </div>
                            </div>

                        </>
                    )}

                    {activeMenu === 'users' && (
                        <div className={`${darkMode ? 'dark bg-gray-800 text-white' : 'bg-white'} p-4 rounded-lg shadow-sm`}>
                            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Users Management</h2>
                            <Link to="/api-testing" target="_blank" rel="noopener noreferrer"><button className='px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-900 transition'>Click to see users...</button></Link>
                        </div>
                    )}
                    {activeMenu === 'orders' && (
                        <div className={`${darkMode ? 'dark bg-gray-800 text-white' : 'bg-white'} p-4 rounded-lg shadow-sm`}>
                            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Orders Management</h2>
                            <p className="text-gray-600 dark:text-gray-300">Orders content goes here...</p>
                        </div>
                    )}

                    {activeMenu === 'products' && (
                        <div className={`${darkMode ? 'dark bg-gray-800 text-white' : 'bg-white'} p-4 rounded-lg shadow-sm`}>
                            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                                Products Management
                            </h2>

                            <div className="d-flex gap-3">
                                <div className="flex flex-wrap gap-3">
                                    {/* Manage Product Button */}
                                    <Link
                                        to="/manage-product"
                                        target='_blank'
                                        className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-green-600 text-white font-medium shadow-md hover:bg-green-700 hover:shadow-lg active:scale-95 transition-all duration-200 ease-in-out"
                                    >
                                        <FiSettings className="text-lg" />
                                        Manage Product
                                    </Link>
                                </div>
                                <br />

                                <div className="flex flex-wrap gap-3">
                                    {/* Add Product Button */}
                                    <Link to="/add-product"
                                        target='_blank'
                                        className="px-5 py-3 rounded-lg bg-green-600 text-white font-medium shadow-md hover:bg-green-700 hover:shadow-lg active:scale-95 transition-all duration-200 ease-in-out"
                                    >
                                        ➕ Add Product
                                    </Link>
                                </div>
                            </div>

                            {/* Categories Table Button */}
                            <h2 className="text-xl font-semibold text-gray-800 dark:text-white my-4">
                                Categories Management
                            </h2>
                            <Link
                                to="/api-categories"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`${darkMode ? 'bg-gray-900 my-4' : 'bg-gray-700 hover:bg-gray-900'} text-white px-5 py-2 font-medium shadow-md rounded-lg transition`}
                            >
                                See Categories Table
                            </Link>

                        </div>
                    )}

                    {activeMenu === 'messages' && (
                        <div className={`${darkMode ? 'dark bg-gray-800 text-white' : 'bg-white'} p-4 rounded-lg shadow-sm`}>
                            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Messages </h2>
                            <p className="text-gray-600 dark:text-gray-300">Messages content goes here...</p>
                        </div>
                    )}

                    {activeMenu === 'settings' && (
                        <AdminSettings darkMode={darkMode}/>
                    )}
                </main>
            </div>
        </div >
    );
};

// NavItem Component
const NavItem = ({ icon, text, active, expanded, onClick }) => {
    return (
        <div
            onClick={onClick}
            className={`flex items-center px-4 py-3 cursor-pointer ${active
                ? 'bg-blue-50 text-blue-600 dark:bg-gray-700 dark:text-blue-400'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                }`}
        >
            <span className="text-lg">{icon}</span>
            {expanded && <span className="ml-3">{text}</span>}
        </div>
    );
};

// StatCard Component
const StatCard = ({ title, value, change, icon, darkMode }) => {
    const isPositive = change.startsWith('+');

    return (
        <div className={`p-4 rounded-lg shadow-sm transition-colors duration-300 ${darkMode ? 'dark bg-gray-700' : 'bg-white'}`}>
            <div className="flex justify-between">
                <div>
                    <p className={`text-sm font-medium text-gray-500 ${darkMode ? 'dark bg-gray-700' : 'bg-white'}`}>{title}</p>
                    <p className={`text-2xl font-semibold text-gray-800 mt-1 ${darkMode ? 'text-white' : 'bg-white'}`}>{value}</p>
                </div>
                <div className="h-5 w-9 rounded-full bg-blue-50 dark:bg-gray-700 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    {icon}
                </div>
            </div>
            <div className="mt-4">
                <span
                    className={`inline-flex items-center text-sm font-medium ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}
                >
                    {change}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">vs last month</span>
            </div>
        </div>
    );
};

export default AdminDashboard;