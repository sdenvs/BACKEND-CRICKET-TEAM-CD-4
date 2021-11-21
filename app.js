const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const app = express();
app.use(express.json());

let db = null;
let dbpath = path.join(__dirname, "cricketTeam.db");

const initialization = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server is running");
    });
  } catch (e) {
    console.log(`error: ${e}`);
    process.exit(1);
  }
};
initialization();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

//get all players
app.get("/players/", async (request, response) => {
  const getAllPlayers = `SELECT 
        *
      FROM
        cricket_team`;
  let allPlayersArray = await db.all(getAllPlayers);
  response.send(
    allPlayersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

//create new player

app.post("/players/", async (request, response) => {
  const newPlayerDetails = request.body;
  const { playerName, jerseyNumber, role } = newPlayerDetails;

  const postPlayerQuery = `INSERT INTO 
        cricket_team(player_name, jersey_number, role)
    VALUES 
        ('${playerName}', ${jerseyNumber}, '${role}');`;

  let postNewPlyaer = await db.run(postPlayerQuery);
  response.send("Player Added to Team");
});

//get single player details

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getSinglePlayerQuery = `SELECT 
            *
        FROM 
            cricket_team
        WHERE 
            player_id = ${playerId}`;
  let getSinglePlayer = await db.get(getSinglePlayerQuery);
  response.send(convertDbObjectToResponseObject(getSinglePlayer));
});

//modify player details

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerNewDeatails = request.body;
  const { playerName, jerseyNumber, role } = playerNewDeatails;

  const modifyPlayerQuery = `UPDATE cricket_team 
        SET 
            player_name = '${playerName}',
            jersey_number = ${jerseyNumber},
            role = '${role}'
        WHERE
            player_id = ${playerId};`;
  const modifyPlayer = await db.run(modifyPlayerQuery);
  response.send("Player Details Updated");
});

//delete player
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `DELETE 
        FROM 
            cricket_team
        WHERE 
            player_id = ${playerId};`;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
