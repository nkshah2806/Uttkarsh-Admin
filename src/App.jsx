import "./App.scss";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./pages/Login/login";
import ForgetPassword from "./pages/ForgetPassword/forget-password";
import Dashboard from "./pages/Dashboard/dashboard";
import { Toaster } from "sonner";
import ResetPassword from "./pages/ResetPassword/reset-password";
import PrivateRoute from "./routes/private-route";
import User from "./pages/User";
import UserDetails from "./pages/User/UserDetails";
import { DashboardOverview } from "./pages/HealthAnalysis";
import MasterDataManagement from "./pages/HealthAnalysis/MasterDataManagement";
import PatientRegistration from "./pages/HealthAnalysis/PatientRegistration";
import PatientDetails from "./pages/HealthAnalysis/PatientDetails";
import QuantumDataEntry from "./pages/HealthAnalysis/QuantumDataEntry";
import ReportReviewOverride from "./pages/HealthAnalysis/ReportReviewOverride";
import PDFReportViewer from "./pages/HealthAnalysis/PDFReportViewer";
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
import DisclaimerManagement from "./pages/HealthAnalysis/DisclaimerManagement";
import CategoryManagement from "./pages/HealthAnalysis/CategoryManagement";
import MedicineManagement from "./pages/HealthAnalysis/MedicineManagement";
import { LanguageProvider } from "./context/LanguageContext";

function App() {
  return (
    <LanguageProvider>
      <Toaster position="top-right" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/forgot-password" element={<ForgetPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<DashboardOverview />} />
            <Route path="/health-dashboard" element={<DashboardOverview />} />

            {/* Quantum Machine Health Analysis Module Routes */}
            <Route path="/quantum/master-data" element={<MasterDataManagement />} />
            <Route path="/quantum/patients" element={<PatientRegistration />} />
            <Route path="/quantum/patients/:patientId" element={<PatientDetails />} />
            <Route path="/quantum-scan/:visitId" element={<QuantumDataEntry />} />
            <Route path="/report-review/:visitId" element={<ReportReviewOverride />} />
            <Route path="/report-pdf/:visitId" element={<PDFReportViewer />} />
            <Route path="/quantum/disclaimers" element={<DisclaimerManagement />} />
            <Route path="/quantum/categories" element={<CategoryManagement />} />
            <Route path="/quantum/medicines" element={<MedicineManagement />} />

            {/* Frontend CMS */}
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
            </Route>
            <Route path="/user/:id" element={<UserDetails />} />
          </Route>
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
