import React, { useState, useEffect, useContext } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import {
    Chart as ChartJS, CategoryScale,
    LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement, ArcElement
} from 'chart.js';
import { RiRefund2Fill } from "react-icons/ri";
import { FiHome, FiUsers, FiSettings, FiShoppingCart, FiMail, FiBell, FiMenu, FiSun, FiMoon } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AdminSettings from '../components/AdminDashboardSettings';
import { deleteUser, fetchAllUsers } from '../utils/CartUtils';
import AdminOrderDashboard from '../components/AdminAllOrder';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement, ArcElement);

const AdminDashboard = () => {
    const { user, logout, isAdmin } = useContext(AuthContext);
    const [allUser, setAllUser] = useState([])
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileView, setMobileView] = useState(false);
    const [activeMenu, setActiveMenu] = useState('dashboard');
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(false)
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        AOS.init();
        if (!isAdmin) {
            navigate('/');
        }
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
    }, [isAdmin, navigate]);

    useEffect(() => {
        const allowedTabs = ["users", "products", "orders", "messages", "settings"];

        const tabFromQuery = [...searchParams.keys()][0];

        if (allowedTabs.includes(tabFromQuery)) {
            setActiveMenu(tabFromQuery);
            setSidebarOpen(s => !s);
        } else {
            setActiveMenu("dashboard");
        }
    }, [searchParams]);

    const handleNavClick = (tab) => {
        navigate(tab === "dashboard" ? "/admin/dashboard" : `/admin/dashboard?${tab}`);
    };

    useEffect(() => {
        const getAllUsers = async () => {
            const res = await fetchAllUsers();
            setAllUser(res);
        }
        getAllUsers();
    }, []);

    const stats = [
        { title: 'Open Orders', value: '126', change: '+7%', icon: <FiShoppingCart /> },
        { title: 'Buyer Messages', value: '4', change: '+5%', icon: <FiMail /> },
        { title: 'Returns and Refunds', value: '2', change: '-3%', icon: <RiRefund2Fill /> },
    ];

    const deleteUserFromDashboard = async (userId) => {
        const confirm = await Swal.fire({
            title: "Are you sure?",
            text: "This will permanently delete the User.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
        });

        if (confirm.isConfirmed) {
            try {
                await deleteUser(userId);
                Swal.fire("Deleted!", "User has been deleted. ", "success");
                window.location.reload();
            } catch (error) {
                console.error("Error deleting User:", error);
                Swal.fire("Error!", "Failed to delete User.", "error");
            }
        }
    }

    return (
        <>
            <div className={`flex h-screen ${darkMode ? "dark bg-gray-800" : "bg-white"}`}>
                {/* Sidebar */}
                <div
                    className={`${sidebarOpen ? "w-64" : "w-0"} ${darkMode ? "dark bg-gray-800" : "bg-white"} transition-all duration-300 shadow-md md:relative z-10`}>
                    {sidebarOpen && (
                        <div className={`p-4 flex justify-between items-center border-b border-gray-200 ${darkMode ? "dark bg-gray-800" : ""}`}   >
                            <h3
                                className="text-xl font-bold text-gray-800 dark:text-white cursor-pointer"
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                            >
                                AdminPanel
                            </h3>
                        </div>
                    )}

                    <nav className={`mt-0 ${sidebarOpen ? '' : 'd-none'} ${darkMode ? "dark bg-gray-800 text-white" : "bg-gray-100 text-gray-800"}`}>
                        <div className={`${darkMode ? "dark bg-gray-800 text-white" : "bg-gray-100 text-gray-800"} border-b border-gray-200 p-2 w-full max-w-sm mx-auto md:max-w-md`}>
                            {/* Profile */}
                            <div className="flex flex-col items-center py-2">
                                <div className="w-16 h-16 flex items-center justify-center bg-red-500 text-white rounded-full text-2xl font-semibold mb-2">
                                    {user.userName.charAt(0).toUpperCase()}
                                </div>

                                <h3 className="text-xl font-semibold">{user.userName}</h3>
                                <p className="text-gray-600 text-sm">{user.userEmail}</p>
                            </div>

                            {/* Last Login */}
                            <div className={`${darkMode ? "dark bg-gray-800 text-white" : "bg-gray-300 text-gray-800"} p-2 rounded-xl text-center`}>
                                <span className="text-lg font-semibold block">Last Login</span>
                                <small className="text-gray-400 block mt-1">
                                    {user.lastLogin
                                        ? new Date(user.lastLogin).toLocaleString("en-US", {
                                            hour: "numeric",
                                            minute: "numeric",
                                            hour12: true,
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                        })
                                        : "First time login"}
                                </small>
                                {(() => {
                                    if (!user.lastLogin) {
                                        return (
                                            <p className="text-xs text-gray-500 mt-2">
                                                First time login — session active
                                            </p>
                                        );
                                    }

                                    const loginTime = new Date(user.lastLogin);
                                    const now = new Date();

                                    const diffHours = (now - loginTime) / (1000 * 60 * 60); // ms ➜ hours

                                    // If more than 24 hours passed
                                    if (diffHours >= 24) {
                                        return (
                                            <p className="text-xs text-red-500 mt-2 font-semibold">
                                                Session expired — please log in again
                                            </p>
                                        );
                                    }

                                    return (
                                        <p className="text-xs text-gray-500 mt-2">
                                            Session will expire in 24 hours after login time
                                        </p>
                                    );
                                })()}
                            </div>
                        </div>

                        <h3
                            className="pl-4 pt-4 text-xl font-bold text-gray-800 dark:text-white cursor-pointer"
                        >
                            Menu
                        </h3>

                        <NavItem
                            icon={<FiHome />}
                            text="Dashboard"
                            active={activeMenu === 'dashboard'}
                            expanded={sidebarOpen}
                            onClick={() => { handleNavClick('dashboard') }}
                        />
                        <NavItem
                            icon={<FiUsers />}
                            text="Users"
                            active={activeMenu === 'users'}
                            expanded={sidebarOpen}
                            onClick={() => { handleNavClick('users') }}

                        />
                        <NavItem
                            icon={<FiShoppingCart />}
                            text="Products"
                            active={activeMenu === 'products'}
                            expanded={sidebarOpen}
                            onClick={() => { handleNavClick('products') }}
                        />
                        <NavItem
                            icon={<FiShoppingCart />}
                            text="Orders"
                            active={activeMenu === 'orders'}
                            expanded={sidebarOpen}
                            onClick={() => { handleNavClick('orders') }}

                        />
                        <NavItem
                            icon={<FiMail />}
                            text="Messages"
                            active={activeMenu === 'messages'}
                            expanded={sidebarOpen}
                            onClick={() => { handleNavClick('messages') }}

                        />
                        <NavItem
                            icon={<FiSettings />}
                            text="Settings"
                            active={activeMenu === 'settings'}
                            expanded={sidebarOpen}
                            onClick={() => { handleNavClick('settings') }}

                        />
                        <div className='h-64'>

                        </div>
                    </nav>
                </div>

                {/* Main Content */}
                <div className="flex-1">
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
                            {!sidebarOpen && !mobileView && (
                                <button
                                    onClick={() => setSidebarOpen(!sidebarOpen)}
                                    className={`p-2 rounded-lg transition ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                                        }`}
                                >
                                    <FiMenu size={20} className="text-gray-700 dark:text-gray-200" />
                                </button>
                            )}
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-white capitalize ml-2">
                                {activeMenu}
                            </h3>
                        </div>

                        {!mobileView && (
                            <div className="flex justify-center items-center h-full">
                                {darkMode ? (
                                    <Link to="/" className="inline-block">
                                        <img
                                            src="https://res.cloudinary.com/dekf5dyng/image/upload/v1761554899/TMJ_logo_dark_kyarf4.png"
                                            alt="Logo"
                                            className="max-w-[180px] h-auto"
                                        />
                                    </Link>) : (
                                    <Link to="/" className="inline-block">
                                        <img
                                            src="https://res.cloudinary.com/dvmpyh0hj/image/upload/v1760615184/hilkmru9zutcneybpwwc.png"
                                            alt="Logo"
                                            className="max-w-[180px] h-auto"
                                        />
                                    </Link>)
                                }
                            </div>
                        )}


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
                                            onClick={() => handleNavClick('messages')}>
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
                                    {!sidebarOpen && !mobileView && (
                                        <span className={`${darkMode ? 'text-white' : 'text-gray-700'}`}>{user.userName}</span>
                                    )}
                                </button>

                                {profileOpen && (
                                    <div className={`absolute right-0 mt-2 w-32 ${darkMode ? 'dark bg-gray-900' : 'bg-white'} rounded-lg shadow-lg py-1 z-20`}>
                                        <button
                                            href="#"
                                            className={`block px-4 py-2 text-sm ${darkMode ? 'text-gray-300 hover:bg-gray-700' : ' text-gray-700 hover:bg-gray-100'}`}
                                            onClick={() => handleNavClick('settings')}
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
                            <div className={`${darkMode ? 'dark bg-gray-800 text-white' : 'bg-white'}`}>
                                <div className={`${darkMode ? 'dark bg-gray-800 text-white' : 'bg-white'}`}>
                                    <h3>Admin Dashboard Overview</h3>
                                    <p>Welcome back, Admin {user.userName}! Here’s your latest dashboard summary.</p>
                                </div>
                                {/* Stats Cards */}
                                <div
                                    className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 ${darkMode ? 'dark bg-gray-800' : 'bg-white'
                                        }`}
                                >
                                    {stats?.map((stat, index) => (
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

                                <hr
                                    className={`border-2 ${darkMode ? 'border-gray-300' : 'border-gray-900'} w-100 mx-auto`}
                                />

                                <div className={`${darkMode ? 'dark bg-gray-800 text-white' : 'bg-white text-gray-900'} flex items-center justify-between`}>
                                    <h2 className="text-xl font-semibold tracking-wide">
                                        Quick Actions
                                    </h2>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {/* Manage All Products */}
                                    <Link
                                        to="/admin/manage-all-products"
                                        className={`
      ${darkMode ? 'dark bg-gray-800 text-white border-2 border-gray-700' : 'bg-white text-gray-900 border-2 border-gray-400'}
      p-5 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer text-center flex flex-col items-center gap-2
    `}
                                    >
                                        <h4 className="text-lg font-semibold">Manage Products</h4>
                                        <p className={`${darkMode ? "text-gray-300" : "text-gray-500"} text-sm`}>
                                            View & update all products
                                        </p>
                                    </Link>

                                    {/* Add Product */}
                                    <Link
                                        to="/admin/add-product"
                                        className={`
      ${darkMode ? 'dark bg-gray-800 text-white border-2 border-gray-700' : 'bg-white text-gray-900 border-2 border-gray-400'}
      p-5 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer text-center flex flex-col items-center gap-2
    `}
                                    >
                                        <h4 className="text-lg font-semibold">Add Product</h4>
                                        <p className={`${darkMode ? "text-gray-300" : "text-gray-500"} text-sm`}>
                                            Create a new product
                                        </p>
                                    </Link>

                                    {/* Men's Collection */}
                                    <Link
                                        to="/products/men/all"
                                        className={`
      ${darkMode ? 'dark bg-gray-800 text-white border-2 border-gray-700' : 'bg-white text-gray-900 border-2 border-gray-400'}
      p-5 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer text-center flex flex-col items-center gap-2
    `}
                                    >
                                        <h4 className="text-lg font-semibold">Men's Collection</h4>
                                        <p className={`${darkMode ? "text-gray-300" : "text-gray-500"} text-sm`}>
                                            Browse all men's products
                                        </p>
                                    </Link>

                                </div>

                            </div>
                        )}

                        {activeMenu === 'users' && (
                            <div className={`${darkMode ? 'dark bg-gray-800 text-white' : 'bg-white'} p-2 rounded-lg shadow-md`}>
                                <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">
                                    Users Management
                                </h3>

                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-sm text-left border-collapse">
                                        <thead className="border-b border-gray-200 dark:border-gray-700">
                                            <tr>
                                                {/* <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">User ID</th> */}
                                                <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Name</th>
                                                <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Email</th>
                                                <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Role</th>
                                                <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Status</th>
                                                <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {allUser?.map((user) => (
                                                <tr
                                                    key={user._id}
                                                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                                                >
                                                    {/* <td className="px-4 py-3">{user._id}</td> */}
                                                    <td className="px-4 py-3">{user.userName}</td>
                                                    <td className="px-4 py-3">{user.email}</td>
                                                    <td className="px-4 py-3">{user.role}</td>
                                                    <td className="px-4 py-3">
                                                        <span
                                                            className={`px-3 py-1 rounded-full text-xs font-medium ${user.isActive
                                                                ? 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-100'
                                                                : 'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-100'
                                                                }`}
                                                        >
                                                            {user.isActive ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <button onClick={(e) => deleteUserFromDashboard(user._id)} className="text-red-600 hover:underline dark:text-red-400">delete</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeMenu === 'orders' && (
                            <div className={`${darkMode ? 'dark bg-gray-800 text-white' : 'bg-white'} p-2 rounded-lg shadow-sm`}>
                                <AdminOrderDashboard user={user} darkMode={darkMode} />

                            </div>
                        )}

                        {activeMenu === 'products' && (
                            <div className={`${darkMode ? 'dark bg-gray-800 text-white' : 'bg-white'} p-4 rounded-lg shadow-sm`}>
                                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                                    Products Management
                                </h3>

                                <div className="d-flex gap-2">
                                    <div className="flex flex-wrap gap-3">
                                        {/* Manage Product Button */}
                                        <Link
                                            to="/admin/manage-all-products"
                                            className="inline-flex text-decoration-none items-center gap-2 px-4 py-3 rounded-3xl bg-blue-600 text-white font-medium shadow-md hover:bg-blue-700 hover:shadow-lg active:scale-95 transition-all duration-200 ease-in-out"
                                        >
                                            <FiSettings className="text-lg" />
                                            Manage Product
                                        </Link>
                                    </div>
                                    <br />

                                    <div className="flex flex-wrap gap-3">
                                        <Link to="/admin/add-product"
                                            className="px-4 py-3 text-decoration-none rounded-3xl bg-blue-600 text-white font-medium shadow-md hover:bg-blue-700 hover:shadow-lg active:scale-95 transition-all duration-200 ease-in-out"
                                        >
                                            ➕ Add Product
                                        </Link>
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        <Link to="/admin/product-sorting"
                                            className="inline-flex text-decoration-none items-center gap-2 px-4 py-3 rounded-3xl bg-blue-600 text-white font-medium shadow-md hover:bg-blue-700 hover:shadow-lg active:scale-95 transition-all duration-200 ease-in-out"
                                        >
                                            <FiMenu size={20} className="text-lg" />
                                            Sort Products
                                        </Link>
                                    </div>
                                    {user.userName.toLowerCase() === "hamza shahid" && (
                                        <div className="flex flex-wrap gap-3">
                                            {/* Manage Product Button */}
                                            <Link
                                                to="/admin/api-testing"
                                                className="inline-flex text-decoration-none items-center gap-2 px-4 py-3 rounded-3xl bg-blue-600 text-white font-medium shadow-md hover:bg-blue-700 hover:shadow-lg active:scale-95 transition-all duration-200 ease-in-out"
                                            >
                                                <FiSettings className="text-lg" />
                                                API's testing
                                            </Link>
                                        </div>)}
                                </div>

                                {/* Categories Table Button */}
                                <h3 className="text-xl font-semibold text-gray-800 dark:text-white my-4">
                                    Categories Management
                                </h3>
                                <Link
                                    to="/admin/categories"
                                    rel="noopener noreferrer"
                                    className={`${darkMode ? 'bg-gray-900 my-4' : 'bg-gray-700 hover:bg-gray-900'} text-decoration-none text-white px-3 py-3 font-medium shadow-md rounded-lg transition`}
                                >
                                    See Categories Table
                                </Link>

                            </div>
                        )}

                        {activeMenu === 'messages' && (
                            <div className={`${darkMode ? 'dark bg-gray-800 text-white' : 'bg-white'} p-4 rounded-lg shadow-sm`}>
                                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Messages </h3>
                                <p className="text-gray-600 dark:text-gray-300">Messages content goes here...</p>
                            </div>
                        )}

                        {activeMenu === 'settings' && (
                            <AdminSettings darkMode={darkMode} />
                        )}
                    </main>
                </div>
            </div >
        </>
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
        <div className={`p-4 border-2 border-gray-400 rounded-lg shadow-sm transition-colors duration-300 ${darkMode ? 'dark bg-gray-700' : 'bg-white'}`}>
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