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

type Round = { id: number; scores: PlayerScore[] };
type PlayerScore = {
  score1: number[];
  score2?: number[];
  score3?: number[];
};
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
    return b.orderThrow! - a.orderThrow!;
  });

  const [scores, setScores] = useState<Round[]>([{ id: 0, scores: [] }]);

  const [numRolls, setNumRolls] = useState(0);

  const roll = () => {
    let sc = [...scores];
    let [currRound] = sc.slice(-1);
    console.log(currRound.scores.length, players.length);
    if (!currRound || currRound.scores.length === players.length) {
      currRound = { id: sc.length, scores: [] };
      sc = [...sc, currRound];
    }

    setNumRolls(numRolls + 1);

    const score1 = getRoll();
    let score2 = undefined;
    let score3 = undefined;
    if (score1[0] === score1[1]) {
      score2 = getRoll();
    }
    if (score2 && score2[0] === score2[1]) {
      score3 = getRoll();
    }
    const ps = {
      score1,
      score2,
      score3,
    };

    setScores([
      ...sc.slice(0, -1),
      { ...currRound, scores: [...currRound.scores.slice(-1), ps] },
    ]);
  };

  const getRoll = () => {
    return [getRandomArbitrary(0, 6), getRandomArbitrary(0, 6)];
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

  const currPlayer = players.find((p) => p.orderThrow === null);

  const rollInitial = (playerId: number) => {
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

  const latestScore = scores.at(-1)?.scores.at(-1);

  return (
    <>
      <div style={{ width: "95%", overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              <td>Round no.</td>
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
              <td>play order</td>
              {players.map((p) => (
                <td key={p.id}>{p.orderThrow}</td>
              ))}
            </tr>
            {[...scores].reverse().map((s, idx) => {
              if (idx > 3) {
                return null;
              }
              return (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  {players.map((p, jdx) => {
                    const score = s.scores[jdx];
                    if (!score) {
                      return null;
                    }

                    return (
                      <td key={p.id}>
                        {score.score1[0]},{score.score1[1]}
                        {score.score2 &&
                          ` - ${score.score2[0]},${score.score2[1]}`}
                        {score.score3 &&
                          ` - ${score.score3[0]},${score.score3[1]}`}
                      </td>
                    );
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
