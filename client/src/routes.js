import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

export default (props) => {
  return (
    <Router>
      <Switch>
        <Route path="*" component={() => <div>Welcome</div>} />
      </Switch>
    </Router>
  );
};
