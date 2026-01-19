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
import ShelterLanding from "./ShelterLanding";
import Landing from "./Landing";
import UserLanding from "./UserLanding";
import AuthRoute from "../util/route_util";
import ProtectedRoute from "../util/protected_route";
import Nav from "./Nav";
import Slug from "./slug";
import "./css/App.css";
import Privacy from "./Privacy";
import TermsOfService from "./TermsOfService";

const App = () => {
  return (
    <HashRouter>
      <div id="root-div1">
        <Nav id="navbar" />
        <Routes>
          <Route path="/" element={<AuthRoute element={<Slug />} routeType="auth" />} />
          <Route path="/splash" element={<AuthRoute element={<Splash />} routeType="auth" />} />
          <Route path="/newAnimal" element={<Animal />} />
          <Route path="/RegisterShelter/:id" element={<RegisterShelter />} />
          <Route path="/AnimalShow/:id" element={<AnimalShow />} />
          <Route path="/Landing" element={<Landing />} />
          <Route path="/User" element={<ProtectedRoute element={<UserLanding />} />} />
          <Route path="/Shelter" element={<ProtectedRoute element={<ShelterLanding />} />} />
          <Route path="/newApplication" element={<Application />} />
          <Route path="/newShelter" element={<AuthRoute element={<Shelter />} routeType="auth" />} />
          <Route path="/register" element={<AuthRoute element={<Register />} routeType="auth" />} />
          <Route path="/login" element={<AuthRoute element={<Login />} routeType="auth" />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/tos" element={<TermsOfService />} />
        </Routes>
      </div>
    </HashRouter>
  );
};

export default App;
