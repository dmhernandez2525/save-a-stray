import React from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

export function withRouter(Component) {
  function ComponentWithRouterProp(props) {
    const navigate = useNavigate();
    const params = useParams();
    const location = useLocation();

    const history = {
      push: navigate,
      replace: (path) => navigate(path, { replace: true }),
      goBack: () => navigate(-1),
      goForward: () => navigate(1),
    };

    return (
      <Component
        {...props}
        history={history}
        match={{ params }}
        location={location}
        navigate={navigate}
        params={params}
      />
    );
  }

  return ComponentWithRouterProp;
}

export default withRouter;
