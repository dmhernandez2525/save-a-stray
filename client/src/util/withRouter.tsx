import React, { ComponentType } from 'react';
import { useNavigate, useParams, useLocation, NavigateFunction, Location, Params } from 'react-router-dom';

export interface WithRouterProps {
  history: {
    push: NavigateFunction;
    replace: (path: string) => void;
    goBack: () => void;
    goForward: () => void;
    location: Location;
  };
  match: {
    params: Readonly<Params<string>>;
  };
  location: Location;
  navigate: NavigateFunction;
  params: Readonly<Params<string>>;
}

export function withRouter<P extends WithRouterProps>(
  Component: ComponentType<P>
): ComponentType<Omit<P, keyof WithRouterProps>> {
  function ComponentWithRouterProp(props: Omit<P, keyof WithRouterProps>) {
    const navigate = useNavigate();
    const params = useParams();
    const location = useLocation();

    const history = {
      push: navigate,
      replace: (path: string) => navigate(path, { replace: true }),
      goBack: () => navigate(-1),
      goForward: () => navigate(1),
      location: location,
    };

    return (
      <Component
        {...(props as P)}
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
