import React, { Component } from "react";
import { graphql } from "@apollo/client/react/hoc";
import { gql, MutationFunction } from "@apollo/client";
import { Button } from "./ui/button";

interface FacebookSignInProps {
  mutate: MutationFunction;
}

interface FacebookSignInState {
  loading: boolean;
}

class FacebookSignIn extends Component<FacebookSignInProps, FacebookSignInState> {
  private appId: string;
  private redirectUrl: string;
  private code?: string;

  constructor(props: FacebookSignInProps) {
    super(props);
    this.onFacebookLogin = this.onFacebookLogin.bind(this);
    this.appId = "515957642529597";
    this.redirectUrl = `${document.location.protocol}//${document.location.host}/facebook-callback`;

    if (document.location.pathname === "/") {
      const params = new URLSearchParams(document.location.search);
      this.code = params.get("code") || undefined;
    }

    this.state = {
      loading: false,
    };
  }

  componentDidMount() {
    if (!this.code) {
      return;
    }

    this.setState({ loading: true });

    this.props
      .mutate({
        variables: { code: this.code },
      })
      .then((response: any) => {
        this.setState({ loading: false });
        const { error, user, session } = response.data.facebookSignIn;
        if (error) {
          console.error("Sign in error:", error);
        } else {
          console.log("Sign in success, your token:", session.token);
        }
      })
      .catch((e: Error) => {
        console.error("Backend error:", e.toString());
        this.setState({ loading: false });
      });
  }

  onFacebookLogin(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    window.location.href = `https://save-a-stray.herokuapp.com/facebooklogin`;
  }

  render() {
    const { loading } = this.state;

    return (
      <Button
        asChild
        variant="default"
        className="bg-[rgb(66,103,178)] hover:bg-[rgb(124,152,207)] w-full"
      >
        <a href="/facebooklogin" onClick={this.onFacebookLogin}>
          {loading ? (
            <span className="animate-spin mr-2">...</span>
          ) : (
            <span className="mr-2">f</span>
          )}
          Sign in with Facebook
        </a>
      </Button>
    );
  }
}

const FACEBOOK_SIGN_IN = gql`
  mutation facebookSignIn($code: String!) {
    facebookSignIn(code: $code) {
      user {
        id
        email
        name
      }
      session {
        token
      }
    }
  }
`;

export default graphql(FACEBOOK_SIGN_IN)(FacebookSignIn as any);
