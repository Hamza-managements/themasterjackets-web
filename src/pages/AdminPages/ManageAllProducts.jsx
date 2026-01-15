import React, { useState, useMemo } from "react";
import {
  RotateCw,
  Plus,
  Package,
  CheckCircle,
  BarChart3,
  DollarSign,
  Search,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { deleteProduct } from "../../utils/ProductServices";
import { useProducts } from "../../context/ProductContext";
import { Col, Row } from "react-bootstrap";
import { FaBox, FaFolder, FaFolderOpen } from "react-icons/fa";

const ManageProducts = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const { products, loading, lastFetched, refreshProducts } = useProducts();

  // ✅ Filter + Sort + Search
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(p =>
        p.productName?.toLowerCase().includes(term) ||
        p.parentStockKeepingUnit?.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      const isPublished = statusFilter === "published";
      result = result.filter((p) => p.status === isPublished);
    }

    // Sorting
    if (sortBy === "newest")
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sortBy === "oldest")
      result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    if (sortBy === "name")
      result.sort((a, b) =>
        a.productName.localeCompare(b.productName)
      );

    return result;
  }, [products, searchTerm, statusFilter, sortBy]);

  // ✅ Selection logic
  const toggleSelect = (productId) => {
    setSelectedProducts((prevSelected) =>
      prevSelected.includes(productId)
        ? prevSelected.filter((id) => id !== productId)
        : [...prevSelected, productId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]); // Unselect all
    } else {
      setSelectedProducts(filteredProducts.map((p) => p._id)); // Select all
    }
  };

  // ✅ Delete Product
  const handleDelete = async (productId) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the product.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (confirm.isConfirmed) {
      try {
        await deleteProduct(productId);
        refreshProducts();
        Swal.fire("Deleted!", "Product has been deleted.", "success");
      } catch (error) {
        console.error("Error deleting product:", error);
        Swal.fire("Error!", "Failed to delete product.", "error");
      }
    }
  };

  // const totalRevenue = products.reduce((sum, product) => {
  //   const variation = product.variations?.[0];
  //   return sum + (variation?.productPrice?.discountedPrice || 0);
  // }, 0);

  let totalRevenue;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600 text-lg">
        Loading products...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b" >
        <Link
          to="/"
          target="_blank"
          className="flex justify-center items-center my-2"
        >
          <img
            src="https://res.cloudinary.com/dvmpyh0hj/image/upload/v1760615184/hilkmru9zutcneybpwwc.png"
            alt="TheMasterJacketsLOGO"
            className="h-10 md:h-12 object-contain"
          />
        </Link>
        <div className="max-w-7xl mx-auto px-4 py-4 rounded-lg" style={{
          background: "linear-gradient(135deg, #2c3e50 0%, #34495e 100%)"
        }}>
          <div className="flex justify-between items-center rounded-lg">
            <div>
              <button className="back-btn" onClick={() => navigate('/admin/dashboard')}>
                ←  Back to Dashboard
              </button>
              <h1 className="text-2xl font-bold text-white mt-2">Manage Products</h1>
              <p className="text-gray-300 mt-1">
                View and manage your entire product catalog
              </p>
              <p className="text-sm text-gray-400">
                Last updated: {lastFetched ? new Date(lastFetched).toLocaleString() : "Never"}
              </p>
            </div>
            <div className="">
              <button onClick={refreshProducts} className="flex items-center gap-2 bg-blue-600 text-white px-8 py-2 rounded-lg hover:bg-blue-700 transition-colors"><RotateCw size={18} /> Refresh</button>
              <button
                onClick={() => navigate("/admin/add-product")}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors mt-3"
              >
                <Plus size={18} />
                Add Product
              </button>
            </div>
          </div>
          <Row className="mt-2 g-3">
            <Col xs={6} md={3}>
              <div className="table-stat-card">
                <div className="table-stat-icon total-categories">
                  <FaFolder />
                </div>
                <div className="table-stat-content">
                  <h5>{products.length}</h5>
                  <span>Total Products</span>
                </div>
              </div>
            </Col>
            <Col xs={6} md={3}>
              <div className="table-stat-card">
                <div className="table-stat-icon total-products">
                  <FaBox />
                </div>
                <div className="table-stat-content">
                  <h5>{products.filter((p) => p.status === true).length}</h5>
                  <span>Published</span>
                </div>
              </div>
            </Col>
            <Col xs={6} md={3}>
              <div className="table-stat-card">
                <div className="table-stat-icon total-subcategories">
                  <FaFolder />
                </div>
                <div className="table-stat-content">
                  <h5>{[...new Set(products.map((p) => p.categoryId))].length}</h5>
                  <span>Categories</span>
                </div>
              </div>
            </Col>
            <Col xs={6} md={3}>
              <div className="table-stat-card">
                <div className="table-stat-icon active-categories">
                  <FaFolderOpen />
                </div>
                <div className="table-stat-content">
                  <h5>{totalRevenue ? `$${totalRevenue.toLocaleString()}` : "T/B"}</h5>
                  <span>Total Revenue</span>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search products by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Dropdowns */}
            <div className="flex flex-wrap gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="unpublished">Unpublished</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
          {filteredProducts.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={
                        selectedProducts.length === filteredProducts.length &&
                        filteredProducts.length > 0
                      }
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Product
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Price
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Created
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr
                    key={product._id}
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product._id)}
                        onChange={() => toggleSelect(product._id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.productImages?.[0]}
                          alt={product.productName}
                          className="w-12 h-18 object-cover rounded-md"
                        />
                        <div>
                          <Link target="_blank" to={`/products-details/${product._id}`} className="text-decoration-none hover:underline"><p className="font-medium text-gray-900">{product.productName}</p></Link>
                          <p className="text-sm text-gray-500">{product.parentStockKeepingUnit}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      $
                      {product.variations?.[0]?.productPrice?.discountedPrice ||
                        0}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${product.status
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                          }`}
                      >
                        {product.status ? "Published" : "Unpublished"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {new Date(product.createdAt).toLocaleDateString()}
                    </td>

                    {/* Action Buttons */}
                    <td className="px-4 py-3 flex items-center gap-3">
                      {/* Edit */}
                      <button
                        onClick={() => navigate(`/admin/edit-product/${product._id}`)}
                        className="text-blue-600 hover:text-blue-800 transition"
                        title="Edit Product"
                      >
                        <i className="fas fa-edit"></i>
                      </button>

                      {/* Manage Variations */}
                      <button
                        onClick={() =>
                          navigate(`/admin/manage-single-product/${product._id}`)
                        }
                        className="text-purple-600 hover:text-purple-800 transition"
                        title="Manage Variations"
                      >
                        <i className="fas fa-layer-group"></i>
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="text-red-600 hover:text-red-800 transition"
                        title="Delete Product"
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12">
              <Package size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No products found
              </h3>
              <p className="text-gray-500 mb-4">
                Try adjusting your search or filters
              </p>
              <button
                onClick={() => navigate("/admin/add-product")}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={18} className="inline mr-2" />
                Add Product
              </button>
            </div>
          )}
        </div>
      </div>
      <style>{`/* Statistics Cards */
        .table-stat-card {
          background: rgba(255, 255, 255, 0.15);
          color: white;
          border-radius: 10px;
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .table-stat-icon {
          width: 50px;
          height: 50px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          color: white;
        }

        .table-stat-icon.total-categories { background: #3498db; }
        .table-stat-icon.total-products { background: #2ecc71; }
        .table-stat-icon.active-categories { background: #e74c3c; }
        .table-stat-icon.total-subcategories { background: #9b59b6; }

        .table-stat-content h5 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 700;
        }

        .table-stat-content span {
          font-size: 0.8rem;
          opacity: 0.8;
        }

        /* Table Controls */
        .table-controls-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          background: #f8f9fa;
          border-bottom: 1px solid #dee2e6;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .table-search-box {
          position: relative;
          width: 70%;
          flex: 1;
        }

        .table-search-icon {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: #6c757d;
          z-index: 2;
        }

        .table-search-input {
          width: 100%;
          padding: 10px 10px 10px 40px;
          border: 1px solid #ced4da;
          border-radius: 6px;
          background: white;
          transition: all 0.3s ease;
          font-size: 0.9rem;
        }

        .table-search-input:focus {
          outline: none;
          border-color: #3498db;
          box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
        }

        .table-filter-controls {
          width: 30%;
          display: flex;
          flex-direction: row !important;
          gap: 0.75rem;
          align-items: center;
        }

        .table-filter-select {
          width: 60%;
          border-radius: 6px;
          border: 1px solid #ced4da;
          padding: 8px 12px;
          background: white;
        }

        .table-btn-expand-all {
         display: flex;
          align-items: center;
          justify-content: center;
          width: 40%;
          border-radius: 6px;
          padding: 8px 16px;
          font-weight: 500;
          font-size: 0.875rem;
        }`}</style>
    </div>
  );
};

// ✅ Reusable Stat Card
const StatCard = ({ title, value, icon }) => (
  <div className="bg-white rounded-lg shadow-sm p-6 flex justify-between items-center">
    <div>
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
    {icon}
  </div>
);

export default ManageProducts;
