import React, { useEffect, useState, useCallback } from "react";
import "./App.css";
import "whatwg-fetch";
import SpotifyPlayer from "react-spotify-web-playback";
import styled, { keyframes } from "styled-components";

import { sampleData } from "./dev/sample";
import SpotifySDK from "./components/SpotifySDK";

const palettes = [
  // classical
  {
    bg: "#EAEAEA",
    text: "#334C6E",
    pulseFill: "#B1D1D1",
    pulseBorder: "#8797AA",
    barHilite: "#CBC5EA",
    barBg: "#73628A"
  },
  // pixel party
  {
    bg: "#FFEED8",
    text: "#303030",
    pulseFill: "gold",
    pulseBorder: "lightblue",
    barHilite: "salmon",
    barBg: "gray"
  },
  // animals
  {
    bg: "#303030",
    pulseFill: "#772D8B",
    pulseBorder: "#C33149",
    barHilite: "#3891A6",
    barBg: "#fff"
  }
];

function App() {
  /* states */
  // track analysis
  const [data, setData] = useState(null);
  // track features
  const [trackFeatures, setTrackFeatures] = useState(null);

  // default is vexento's pixelparty
  const [trackID, setTrackID] = useState("1YCXVdUCVqbwr6DSrX01vr");
  const [deviceID, setDeviceID] = useState("");
  // tempo of section in track
  const [errorFlag, setErrorFlag] = useState(false);
  // size of visualizer
  const [size, setSize] = useState(0);
  // array of section start times
  const [sections, setSections] = useState([]);
  // index of current section
  const [sectionIndex, setSectionIndex] = useState(0);
  // color set
  const paletteIndex = 0;

  // get track analysis from spotify
  const options = {
    method: "POST",
    body: JSON.stringify({ id: trackID }),
    headers: {
      "Content-Type": "application/json"
    }
  };
  const getTrackData = async () => {
    // DEBUG
    // setData(sampleData);
    // setSections(sampleData.sections.map(item => item.start));

    // reset error flag
    setErrorFlag(false);
    try {
      const res = await fetch("/analyze-track", options);
      let trackData = await res.json();
      setData(trackData);
      setSections(trackData.sections.map(item => item.start));
    } catch (err) {
      setErrorFlag(true);
      console.log(err);
    }
  };

  const getTrackFeatures = async () => {
    try {
      const res = await fetch("/features", options);
      let trackFeatures = await res.json();
      setTrackFeatures(trackFeatures);
    } catch (error) {
      console.log(error);
    }
  };

  // start moving ball
  const onPlay = () => {
    console.log(sections);
    const start = new Date();
    // reset section & start
    setSectionIndex(0);
    // update section
    setInterval(() => {
      // elapsed time in seconds
      const elapsed = (new Date() - start) / 1000;
      let currentsectionIndex = sections.findIndex(
        (item, i) => elapsed <= sections[i + 1]
      );
      if (currentsectionIndex === -1) {
        // last section
        currentsectionIndex = sections.length - 1;
      }
      setSectionIndex(currentsectionIndex);
    }, 1000);
  };

  const pulseBorder = keyframes`
    0% { 
      border-width: 0;
    }
    100% {
      border-width: 10vw;
    }
  `;
  const moveBall = keyframes` 
    0% {
      left: 0;
    }
    100% {
      left: calc(100% - 3rem)
    }
  `;
  const Ball = styled.div`
    background: gold;
    border-color: lightblue;
    border-style: solid;
    border-radius: 50%;
    height: 2rem;
    width: 2rem;
    position: absolute;
    animation: ${data ? 60 / data.sections[sectionIndex].tempo : 0}s
        ${pulseBorder} infinite,
      ${data ? data.track.duration : 0}s ${data ? moveBall : `none`} linear;
  `;

  const Pulse = styled.div`
    position: absolute;
    top: 30vh;
    background: ${palettes[paletteIndex].pulseFill};
    border-color: ${palettes[paletteIndex].pulseBorder}};
    border-style: solid;
    border-radius: 50%;
    height: 40vw;
    width: 40vw;
    animation: ${data ? 60 / data.sections[sectionIndex].tempo : 0}s
      ${pulseBorder} infinite;
    opacity: 0.8;
  `;
  const createVisualizer = useCallback(() => {
    console.log(data);
    if (errorFlag) {
      return <p>error on calling API; click "analyze" button again</p>;
    }
    if (!data) {
      return;
    } else {
      const duration = data.track.duration;
      const loudness = data.track.loudness;
      return data.sections.map((item, i) => {
        const d = (item.duration / duration) * 100; // duration in % of track length
        const l = item.loudness + 40;
        return (
          //  TODO: adjust height of bars
          <div
            key={item.start}
            className="bar"
            style={{
              background: `${
                i === sectionIndex
                  ? palettes[paletteIndex].barHilite
                  : palettes[paletteIndex].barBg
              }`,
              width: `${d}%`,
              height: `${l * 1.2}rem`
            }}
          />
        );
      });
    }
  }, [data, errorFlag, paletteIndex, sectionIndex]);

  /* auth */
  // get auth token
  const hash = window.location.hash;
  const token = hash ? window.location.hash.split("=")[1].split("&")[0] : "";

  const Bg = styled.div`
    background: ${palettes[paletteIndex].bg};
    color: ${palettes[paletteIndex].text};
  `;

  return (
    <main
      style={{
        background: palettes[paletteIndex].bg,
        color: palettes[paletteIndex].text
      }}
    >
      <div className="input-container">
        <p>track ID: </p>
        <input
          type="text"
          value={trackID}
          onChange={e => setTrackID(e.target.value)}
        />
        <button onClick={getTrackData}>analyze</button>
        {/* <button onClick={handlePlay}>play</button> */}
      </div>
      <div className="features-container">
        <button onClick={getTrackFeatures}>show features</button>
        <div>
          {trackFeatures &&
            Object.keys(trackFeatures).map(key => (
              <div key={key}>
                {key}: {trackFeatures[key]}
                <br />
              </div>
            ))}
        </div>
      </div>
      <div className="player-container">
        {/* TODO: switch link depending on environment: development or build */}
        <a href="http://localhost:8080/login">
          {/* <a href="/login"> */}
          <button>login to spotify</button>
        </a>
        <textarea defaultValue={token} />
        {token && (
          <SpotifySDK
            token={token}
            trackID={trackID}
            handleDeviceID={id => setDeviceID(id)}
            onPlay={onPlay}
          />
        )}
      </div>
      <div className="visualizer">
        {/* <select value={size} onChange={e => setSize(e.target.value)}>
          {[...Array(5)].map((_, i) => (
            <option value={i} key={i}>
              {i}
            </option>
          ))}
        </select> */}
        {/* <Ball /> */}
        <Pulse />
        {/* <div
          className="progress"
          style={{
            position: absolute,
            left: xPos,
            transition: transition,
            animation: beat
          }}
        ></div> */}
        <div className="bar-container">{createVisualizer()}</div>
      </div>
    </main>
  );
}

export default App;
