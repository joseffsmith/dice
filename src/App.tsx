import { useState } from "react";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);
  const [numRolls, setNumRolls] = useState(0);

  const roll = () => {
    setNumRolls(numRolls + 1);
    setCount(getRandomArbitrary(1, 12));
  };
  const getRandomArbitrary = (min: number, max: number): number => {
    return Math.ceil(Math.random() * (max - min) + min);
  };
  return (
    <div
      className="App"
      style={{
        border: "1px dashed grey",
        width: "500px",
        maxWidth: "95%",
        height: 500,
        maxHeight: "95%",
        justifyContent: "center",
        display: "flex",
        alignItems: "center",
      }}
      onClick={roll}
    >
      <div>
        <h1>{count}</h1>
        <div className="card">
          <button>Roll</button>
        </div>
        <p>Number of rolls: {numRolls}</p>
      </div>
    </div>
  );
}

export default App;
