import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useState } from "react";
import "./App.css";

function App() {
  const [_players, setPlayers] = useState<Player[]>([
    { name: "player1", id: 1, orderThrow: null },
    { name: "player2", id: 2, orderThrow: null },
  ]);
  const players = _players.sort((a, b) => {
    if (!a.orderThrow && !b.orderThrow) {
      return 0;
    }
    if (!a.orderThrow && b.orderThrow) {
      return 1;
    }
    if (!b.orderThrow && a.orderThrow) {
      return -1;
    }
    return a.orderThrow! - b.orderThrow!;
  });

  const [scores, setScores] = useState([]);

  const [dice1, setDice1] = useState(0);
  const [dice2, setDice2] = useState(0);

  const [numRolls, setNumRolls] = useState(0);

  const roll = () => {
    setNumRolls(numRolls + 1);
    setDice1(getRandomArbitrary(0, 6));
    setDice2(getRandomArbitrary(0, 6));
  };
  const getRandomArbitrary = (min: number, max: number): number => {
    return Math.ceil(Math.random() * (max - min) + min);
  };
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

  const addPlayer = () => {
    setPlayers((ps) => {
      return [
        ...ps,
        {
          name: "player",
          id: ps.reduce((curr, val) => (curr < val.id ? val.id : curr), 0) + 1,
          orderThrow: null,
        },
      ];
    });
  };

  const handleSavePlayer = (player: Player) => {
    setPlayers((ps) => ps.map((p) => (p.id === player.id ? player : p)));
  };

  const handleDeletePlayer = (id: number) => {
    setPlayers((ps) => ps.filter((p) => p.id !== id));
  };
  console.log(players);
  const currPlayer = players.find((p) => p.orderThrow === null);

  const rollInitial = (playerId: number) => {
    // TODO: warning it will clear current scores
    setScores([]);
    setPlayers((ps) =>
      ps.map((p) => {
        if (p.id !== playerId) {
          return p;
        }
        return {
          ...p,
          orderThrow: getRandomArbitrary(1, 6),
        };
      })
    );
  };
  return (
    <>
      <div style={{ width: "95%", overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              {players.map((p) => (
                <td key={p.id}>
                  <button onClick={() => setEditingPlayer(p)}>{p.name}</button>
                </td>
              ))}
              <td>
                <button onClick={addPlayer}>+</button>
              </td>
            </tr>
          </thead>
          <tbody>
            <tr>
              {players.map((p) => (
                <td key={p.id}>{p.orderThrow}</td>
              ))}
            </tr>
            {scores.map((s, idx) => {
              if (idx > 3) {
                return null;
              }
              return (
                <tr key={idx}>
                  {players.map((p) => {
                    return <td key={p.id}>s[p.order]</td>;
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {currPlayer ? (
        <div className="App" onClick={() => rollInitial(currPlayer.id)}>
          <div className="card">
            <button>Roll</button>
          </div>
        </div>
      ) : (
        <div className="App" onClick={roll}>
          <h1>{dice1 + dice2}</h1>
          {dice1 === dice2 && <h2>Double!</h2>}
          <div className="card">
            <button>Roll</button>
          </div>
          <p>Number of rolls: {numRolls}</p>
        </div>
      )}
      {editingPlayer && (
        <EditPlayer
          player={editingPlayer}
          savePlayer={handleSavePlayer}
          deletePlayer={handleDeletePlayer}
          handleClose={() => setEditingPlayer(null)}
        />
      )}
    </>
  );
}
type Player = {
  id: number;
  name: string;
  orderThrow: null | number;
};
const EditPlayer = ({
  player,
  savePlayer,
  deletePlayer,
  handleClose,
}: {
  player: Player;
  savePlayer: (player: Player) => void;
  deletePlayer: (id: number) => void;
  handleClose: () => void;
}) => {
  const [name, setName] = useState(player.name);
  const handleSavePlayer = () => {
    savePlayer({
      ...player,
      name,
    });
    handleClose();
  };
  const handleDeletePlayer = () => {
    deletePlayer(player.id);
    handleClose();
  };
  return (
    <Dialog open>
      <DialogTitle>Editing player</DialogTitle>
      <DialogContent>
        <TextField
          sx={{ mt: 1 }}
          label="Name"
          onChange={(e) => setName(e.target.value)}
          value={name}
          autoFocus
        />
      </DialogContent>
      <DialogActions>
        <Button color="error" onClick={handleDeletePlayer}>
          Delete
        </Button>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSavePlayer}>Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default App;
