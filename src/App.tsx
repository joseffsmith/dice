import { useState } from "react";
import "./App.css";

function App() {
  const [dice1, setDice1] = useState(0);
  const [dice2, setDice2] = useState(0);

  const [numRolls, setNumRolls] = useState(0);

  const roll = () => {
    setNumRolls(numRolls + 1);
    setDice1(getRandomArbitrary(1, 6));
    setDice2(getRandomArbitrary(1, 6));
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
        margin: "0 auto",
      }}
      onClick={roll}
    >
      <div>
        <h1>{dice1 + dice2}</h1>
        {dice1 === dice2 && <h2>Double!</h2>}
        <div className="card">
          <button>Roll</button>
        </div>
        <p>Number of rolls: {numRolls}</p>
      </div>
    </div>
  );
}

export default App;
