import React, { useState, useEffect } from "react";
import Script from "react-load-script";
import "whatwg-fetch";

const SpotifySDK = props => {
  /* states */
  const [deviceID, setDeviceID] = useState("");
  const handleScriptLoad = () => {
    window.onSpotifyWebPlaybackSDKReady = () => {
      const token = props.token;
      const player = new window.Spotify.Player({
        name: "Spotify SDK",
        getOAuthToken: cb => {
          cb(token);
        }
      });

      // Error handling
      player.addListener("initialization_error", ({ message }) => {
        console.error(message);
      });
      player.addListener("authentication_error", ({ message }) => {
        console.error(message);
      });
      player.addListener("account_error", ({ message }) => {
        console.error(message);
      });
      player.addListener("playback_error", ({ message }) => {
        console.error(message);
      });

      // Playback status updates
      player.addListener("player_state_changed", state => {
        console.log(state);
      });

      // Ready
      player.addListener("ready", ({ device_id }) => {
        props.handleDeviceID(device_id);
        setDeviceID(device_id);
        console.log("Ready with Device ID", device_id);
      });

      // Not Ready
      player.addListener("not_ready", ({ device_id }) => {
        console.log("Device ID has gone offline", device_id);
      });

      // Connect to the player!
      player.connect();
    };
  };

  const handlePlay = async () => {
    const trackURI = `spotify:track:${props.trackID}`;
    const res = await fetch(
      `https://api.spotify.com/v1/me/player/play?device_id=${deviceID}`,
      {
        method: "PUT",
        body: JSON.stringify({
          // TODO
          uris: [trackURI]
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${props.token}`
        }
      }
    );
    // record progress of track
    props.onPlay();
  };
  return (
    <div>
      <Script
        url="https://sdk.scdn.co/spotify-player.js"
        onCreate={console.log("created script")}
        onError={error => console.log(error)}
        onLoad={handleScriptLoad}
      />
      <button onClick={handlePlay}>PLAY</button>
    </div>
  );
};

export default SpotifySDK;
