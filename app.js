const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const databasePath = path.join(__dirname, "twitterClone.db");
const app = express();
app.use(express.json());

let db = null;
const initializeDbandServer = async () => {
  try {
    db = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(2000, () => {
      console.log("server running at http://localhost:2000/");
    });
  } catch (error) {
    console.log(`Db error :${error.message}`);
    process.exit(1);
  }
};
initializeDbandServer();

//API 1
app.post("/register/", async (request, response) => {
  const { username, password, name, gender } = request.body;
  const registerUser = `
    SELECT *
    FROM
    User
    WHERE
    username='${username}';`;
  const dbUser = await db.get(registerUser);
  if (dbUser !== undefined) {
    response.status(400);
    response.send("User already exists");
  } else {
    if (password.length < 6) {
      response.status(400);
      response.send("Password is too short");
    } else {
      const userPassword = await bcrypt.hash(password, 10);
      selectUserQuery = `
        INSERT INTO
        user(username,password,name,gender)
        VALUES
        ('${username}','${hashedPassword}','${name}','${gender}');`;
      await db.run(selectUserQuery);
      response.send("User created successfully");
    }
  }
});

//API 2

app.post("/login/", async (request, response) => {
  const { username, password } = request.body;
  const loginQuery = `
    SELECT * FROM user WHERE username='${username}';`;
  const queryResult = await db.get(loginQuery);

  if (queryResult !== undefined) {
    const isPasswordCorrect = await bcrypt.compare(
      password,
      queryResult.password
    );
    if (isPasswordCorrect) {
      const payload = { username, userId: userDetails.user_id };
      const jwtToken = jwt.sign(payload, "SECRET_TOKEN");
      response.send({ jwtToken });
    } else {
      response.status(400);
      response.send("Invalid password");
    }
  } else {
    response.status(400);
    response.send("Invalid user");
  }
});
