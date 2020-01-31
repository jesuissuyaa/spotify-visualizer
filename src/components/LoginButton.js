import React from "react";

const authEndpoint = "https://accounts.spotify.com/authorize";
const clientID = process.env.REACT_APP_CLIENT_ID;
const redirectURI = "http://localhost:3000/"; // TODO
const scopes = ["user-read-currently-playing", "user-read-playback-state"];
// get url hash
const LoginButton = () => {
  return (
    <a
      className="btn btn--loginApp-link"
      href={`${authEndpoint}client_id=${clientID}&redirect_uri=${redirectURI}&scope=${scopes.join(
        "%20"
      )}&response_type=token&show_dialog=true`}
    >
      Login to Spotify
    </a>
  );
};

export default LoginButton;
