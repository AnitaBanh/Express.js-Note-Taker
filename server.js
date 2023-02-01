const express = require("express");
const path = require("path");
const fs = require("fs");
const db = require("./db/db.json");
const uuid = require("./helpers/uuid");

const PORT = 3001;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

// `GET /notes` should return the `notes.html` file.
app.get("/notes", (req, res) =>
  res.sendFile(path.join(__dirname, "/public/notes.html"))
);

//   `GET /api/notes` should read the `db.json` file and return all saved notes as JSON.
app.get("/api/notes", (req, res) => {
  // Send a message to the client
  fs.readFile("./db/db.json", "utf8", (err, data) => {
    if (err) {
      console.error(err);
    } else {
      // Convert string into JSON object
      res.json(JSON.parse(data));
    }
  });

  // Log our request to the terminal
  console.info(`${req.method} request received to get notes`);
});

//  receive a new note to save on the request body
app.post("/api/notes", (req, res) => {
  // Log that a POST request was received
  console.info(`${req.method} request received to add a note`);

  // Destructuring assignment for the items in req.body
  const { title, text } = req.body;

  // If all the required properties are present
  if (title && text) {
    // save variable for the object
    const newNote = {
      title,
      text,
      id: uuid(),
    };

    // Obtain existing notes
    fs.readFile("./db/db.json", "utf8", (err, data) => {
      if (err) {
        console.error(err);
      } else {
        // Convert string into JSON object
        const parsedNotes = JSON.parse(data);

        // Add a new note
        parsedNotes.push(newNote);

        // Write updated notes back to the file
        fs.writeFile(
          "./db/db.json",
          JSON.stringify(parsedNotes, null, 4),
          (writeErr) =>
            writeErr
              ? console.error(writeErr)
              : console.info("Successfully updated notes!")
        );
      }
    });

    const response = {
      status: "success",
      body: newNote,
    };

    console.log(response);
    res.status(201).json(response);
  } else {
    res.status(500).json("Error in posting note");
  }
});

// receive a query parameter that contains the id of a note to delete.
app.delete("/api/notes/:id", (req, res) => {
  // Log that a POST request was received
  console.info(`${req.method} request received to delete a note`);

  // Destructuring assignment for the items in req.body
  const { id } = req.params;
  if(id){
    // Obtain existing notes
    fs.readFile("./db/db.json", "utf8", (err, data) => {
      if (err) {
        console.error(err);
      } else {
        // Convert string into JSON object
        let parsedNotes = JSON.parse(data);

        // remove note which matches the given `id` property
        parsedNotes = parsedNotes.filter((note) => { 
          return note.id !== id
        });

        // Write updated notes back to the file
        fs.writeFile(
          "./db/db.json",
          JSON.stringify(parsedNotes, null, 4),
          (writeErr) =>
            writeErr
              ? console.error(writeErr)
              : console.info("Successfully deleted note!")
        );
      }
    });

    res.status(201).json(response);
  } else {
    res.status(500).json("Error deleting note :(");
  }
});

// `GET *` should return the `index.html` file.
app.get("*", (req, res) =>
  res.sendFile(path.join(__dirname, "/public/index.html"))
);

app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT} 🚀`)
);
