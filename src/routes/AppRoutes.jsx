import { Route, Routes } from "react-router-dom";

import Home from "../client/pages/Home.jsx";
import About from "../client/pages/About.jsx";
import Login from "../client/pages/Login.jsx";
import Register from "../client/pages/Register.jsx";
import Products from "../client/pages/Products.jsx";
import ProductDetails from "../client/pages/ProductDetails.jsx";
import Cart from "../client/pages/Cart.jsx";
import Checkout from "../client/pages/Checkout.jsx";
import OrderSuccess from "../client/pages/OrderSuccess.jsx";
import CustomRequest from "../client/pages/CustomRequest.jsx";
import Messages from "../client/pages/Messages.jsx";
import MyCustomRequests from "../client/pages/MyCustomRequests.jsx";
import PrivateRoute from "../components/PrivateRoute.jsx";
import AdminLayout from "../admin/layouts/AdminLayout.jsx";
import Dashboard from "../admin/pages/Dashboard.jsx";
import MessagesAdmin from "../admin/pages/MessagesAdmin.jsx";
import ProductsAdmin from "../admin/pages/ProductsAdmin.jsx";
import OrdersAdmin from "../admin/pages/OrdersAdmin.jsx";
import UsersAdmin from "../admin/pages/UsersAdmin.jsx";
import CustomRequestsAdmin from "../admin/pages/CustomRequestsAdmin.jsx";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/products" element={<Products />} />
      <Route path="/products/:id" element={<ProductDetails />} />

      <Route element={<PrivateRoute />}>
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/custom-request" element={<CustomRequest />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/custom-requests/my" element={<MyCustomRequests />} />
      </Route>

      <Route element={<PrivateRoute adminOnly />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<ProductsAdmin />} />
          <Route path="orders" element={<OrdersAdmin />} />
          <Route path="users" element={<UsersAdmin />} />
          <Route path="custom-requests" element={<CustomRequestsAdmin />} />
          <Route path="messages" element={<MessagesAdmin />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default AppRoutes;
