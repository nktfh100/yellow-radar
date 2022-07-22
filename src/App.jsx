import { useEffect, useState } from "react";
import "./App.scss";
import usePercentageStore from "./store/usePercentageStore";
import armImg from "./assets/arm.png";

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
const randomNumber = (min, max) => Math.random() * (max - min) + min;
const lerp = (start, end, amt) => (1 - amt) * start + amt * end;

let lastTimePlayed = new Date();
let buffer, ctx = new AudioContext();

function App() {
  const setPercentage = usePercentageStore((state) => state.setPercentage);

  const shownPercentage = usePercentageStore((state) => state.shownPercentage);
  const setShownPercentage = usePercentageStore((state) => state.setShownPercentage);

  const [isOn, setIsOn] = useState(false);

  const deadZoneWidth = window.innerWidth * 0.3;

  function playTickSound() {
      let source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.onended = function () { this.stop(); this.disconnect(); }
      source.start(0);
  }

  const handleTouchMove = (ev) => {
    setPercentage(clamp((ev.changedTouches[0].clientX - deadZoneWidth) / (window.innerWidth - ev.changedTouches[0].clientX), 0.05, 0.99))
  }

  const updatePosition = () => {
    const state = usePercentageStore.getState();

    // Lerp from the actual percentage to the shown percentage to make the arm a little smoother
    let newPercentage = lerp(state.shownPercentage, state.percentage, state.percentage == 0 ? 0.05 : 0.3);

    // Add a bit of randomness to make the arm jumpy
    if (state.shownPercentage > 0.1) {
      newPercentage = newPercentage + (newPercentage * randomNumber(-0.08, 0.08));
    }

    if (state.shownPercentage >= 0.05 && state.percentage >= 0.05) {
      const timeElapsed = new Date() - lastTimePlayed;

      if (state.shownPercentage < 0.2) {
        if (timeElapsed > randomNumber(600, 800)) {
          lastTimePlayed = new Date();
          playTickSound();
        }
      } else if (state.shownPercentage < 0.4) {
        if (timeElapsed > randomNumber(400, 550)) {
          lastTimePlayed = new Date();
          playTickSound();
        }
      } else if (state.shownPercentage < 0.6) {
        if (timeElapsed > randomNumber(220, 350)) {
          lastTimePlayed = new Date();
          playTickSound();
        }
      } else if (state.shownPercentage < 0.8){
        if (timeElapsed > randomNumber(140, 200)) {
          lastTimePlayed = new Date();
          playTickSound();
        }
      } else {
        if (timeElapsed > randomNumber(80, 140)) {
          lastTimePlayed = new Date();
          playTickSound();
        }
      }
    }


    setShownPercentage(clamp(newPercentage, 0.05, 1.05));
  }

  useEffect(() => {
    document.addEventListener('touchmove', (ev) => {
    }, { passive: false })

    let interval_ = setInterval(() => {
      updatePosition();
    }, 1000 / 60);


    window.AudioContext = window.AudioContext || window.webkitAudioContext;

    function createBuffer() {
      ctx.decodeAudioData(this.response, function (b) { buffer = b; }, function (e) { console.warn(e) });
    }

    let xhr = new XMLHttpRequest();
    xhr.onload = createBuffer;
    xhr.open('GET', "/tick.mp3", true);
    xhr.responseType = 'arraybuffer';
    xhr.send();

    return () => clearInterval(interval_);
  }, []);

  const minDeg = -78;
  const maxDeg = 70;
  const deg = minDeg + ((maxDeg - minDeg) * (shownPercentage));

  return (
    <div className="App" onTouchEnd={() => { setPercentage(0); setIsOn(false) }} onTouchStart={() => setIsOn(true)} onTouchMove={handleTouchMove}>
      <h1 className="title">רדאר צהיבות</h1>
      <div className="radar-container">
        <img style={{ transform: `rotate(${clamp(deg, minDeg, maxDeg)}deg)` }} src={armImg} className="arm" />
      </div>
      <div style={{backgroundImage: isOn ? "url('/on_btn.png')" : "url('/off_btn.png')"}} alt="" className="btn" />
      <footer>By nktfh100</footer>
    </div>
  );
}

export default App;
