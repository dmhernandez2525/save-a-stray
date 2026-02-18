import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import Splash from "./Splash";
import Login from "./Login";
import Register from "./Register";
import RegisterShelter from "./RegisterShelter";
import Animal from "./Animal";
import AnimalShow from "./AnimalShow";
import Application from "./Application";
import Shelter from "./Shelter";
import ShelterPage from "./ShelterPage";
import Landing from "./Landing";
import ProfilePage from "./ProfilePage";
import SuccessStories from "./SuccessStories";
import UserSettings from "./UserSettings";
import CompatibilityQuiz from "./CompatibilityQuiz";
import AdminPanel from "./AdminPanel";
import UserLanding from "./UserLanding";
import AuthRoute from "../util/route_util";
import ProtectedRoute from "../util/protected_route";
import Nav from "./Nav";
import BottomNav from "./BottomNav";
import Slug from "./slug";
import Privacy from "./Privacy";
import TermsOfService from "./TermsOfService";
// Demo Mode Components
import { DemoProvider } from "../demo/DemoContext";
import DemoLanding from "../demo/DemoLanding";
import { ThemeProvider } from "./ThemeProvider";
import InstallPrompt from "./InstallPrompt";
import OfflineBanner from "./OfflineBanner";
import UpdatePrompt from "./UpdatePrompt";

const App: React.FC = () => {
  return (
    <DemoProvider>
      <ThemeProvider defaultTheme="system" storageKey="save-a-stray-theme">
        <HashRouter>
          <OfflineBanner />
          <InstallPrompt />
          <UpdatePrompt />
          <div className="text-foreground grid grid-cols-1 md:grid-cols-main grid-rows-[auto_1fr] md:grid-rows-main min-h-screen md:h-screen">
            <Nav />
            <Routes>
            <Route
              path="/"
              element={<AuthRoute element={<Slug />} routeType="auth" />}
            />
            <Route
              path="/splash"
              element={<AuthRoute element={<Splash />} routeType="auth" />}
            />
            <Route path="/newAnimal" element={<Animal />} />
            <Route path="/RegisterShelter/:id" element={<RegisterShelter />} />
            <Route path="/AnimalShow/:id" element={<AnimalShow />} />
            <Route path="/Landing" element={<Landing />} />
            <Route
              path="/User"
              element={<ProtectedRoute element={<UserLanding />} />}
            />
            <Route
              path="/profile"
              element={<ProtectedRoute element={<ProfilePage />} />}
            />
            <Route
              path="/Shelter"
              element={<ProtectedRoute element={<ShelterPage />} />}
            />
            <Route path="/newApplication" element={<Application />} />
            <Route
              path="/newShelter"
              element={<AuthRoute element={<Shelter />} routeType="auth" />}
            />
            <Route
              path="/register"
              element={<AuthRoute element={<Register />} routeType="auth" />}
            />
            <Route
              path="/login"
              element={<AuthRoute element={<Login />} routeType="auth" />}
            />
            <Route
              path="/settings"
              element={<ProtectedRoute element={<UserSettings />} />}
            />
            <Route path="/quiz" element={<CompatibilityQuiz />} />
            <Route
              path="/admin"
              element={<ProtectedRoute element={<AdminPanel />} />}
            />
            <Route path="/success-stories" element={<SuccessStories />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/tos" element={<TermsOfService />} />
            {/* Demo Mode Entry - redirects to /login for role selection */}
            <Route path="/demo" element={<DemoLanding />} />
            </Routes>
            <BottomNav />
          </div>
        </HashRouter>
      </ThemeProvider>
    </DemoProvider>
  );
};

export default App;
