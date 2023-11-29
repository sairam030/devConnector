// App.js
import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Navbar from "./components/layouts/Navbar";
import Landing from "./components/layouts/Landing";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";

import "./App.css";

const App = () => (
  <Router>
    <div>
      <Navbar />
      <Route path="/" component={Landing} />
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        {/* Add more routes here */}
      </Switch>
    </div>
  </Router>
);

export default App;
