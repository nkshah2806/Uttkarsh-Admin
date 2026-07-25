import "./App.scss";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./pages/Login/login";
import ForgetPassword from "./pages/ForgetPassword/forget-password";
import Dashboard from "./pages/Dashboard/dashboard";
import { Toaster } from "sonner";
import ResetPassword from "./pages/ResetPassword/reset-password";
import PrivateRoute from "./routes/private-route";
import User from "./pages/User";
import UserEdit from "./pages/User/create";
import UserDetails from "./pages/User/UserDetails";
import { DashboardOverview, ClientManagement, ReportEntry, ReportDesigner } from "./pages/HealthAnalysis";
import FrontendCMS from "./pages/FrontendCMS";
import HeroCMS from "./pages/FrontendCMS/HeroCMS";
import CategoriesCMS from "./pages/FrontendCMS/CategoriesCMS";
import ProductsCMS from "./pages/FrontendCMS/ProductsCMS";
import TrustBadgesCMS from "./pages/FrontendCMS/TrustBadgesCMS";
import MissionCMS from "./pages/FrontendCMS/MissionCMS";
import TestimonialsCMS from "./pages/FrontendCMS/TestimonialsCMS";
import DistributorCMS from "./pages/FrontendCMS/DistributorCMS";
import HeaderFooterCMS from "./pages/FrontendCMS/HeaderFooterCMS";
import ContactCMS from "./pages/FrontendCMS/ContactCMS";

function App() {
  return (
    <>
      {/* <FCMToken /> */}
      <Toaster position="top-right" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/forgot-password" element={<ForgetPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<DashboardOverview />} />
            <Route path="/health-dashboard" element={<DashboardOverview />} />
            <Route path="/clients" element={<ClientManagement />} />
            <Route path="/report-entry" element={<ReportEntry />} />
            <Route path="/report-designer" element={<ReportDesigner />} />

            {/* Frontend CMS — hub + individual section pages */}
            <Route path="/frontend-cms" element={<FrontendCMS />} />
            <Route path="/frontend-cms/hero" element={<HeroCMS />} />
            <Route path="/frontend-cms/categories" element={<CategoriesCMS />} />
            <Route path="/frontend-cms/products" element={<ProductsCMS />} />
            <Route path="/frontend-cms/trust-badges" element={<TrustBadgesCMS />} />
            <Route path="/frontend-cms/mission" element={<MissionCMS />} />
            <Route path="/frontend-cms/testimonials" element={<TestimonialsCMS />} />
            <Route path="/frontend-cms/distributor-banner" element={<DistributorCMS />} />
            <Route path="/frontend-cms/header-footer" element={<HeaderFooterCMS />} />
            <Route path="/frontend-cms/contact" element={<ContactCMS />} />

            <Route path="/user">
              <Route index element={<User />} />
              <Route path="edit/:id" element={<UserEdit />} />
            </Route>
            <Route path="/user/:id" element={<UserDetails />} />
          </Route>
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;


