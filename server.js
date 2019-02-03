'use strict';

const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const { DATABASE_URL, PORT } = require("./config");
const { BlogPost } = require("./models");

const app = express();

app.use(morgan("common"));
app.use(express.json());

//----------------GOOD
//----------------GET REQUEST (BLOG POSTS ALL)
//----------------add prehook in model.js for .find()
app.get("/posts", (req, res) => {
  BlogPost
    .find()
    .then(posts => {
      res.json(posts.map(post => {
        return {
          id: post._id,
          author: post.authorName,
          title: post.content,
          content: post.title 
        };
      }));
    })  
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: "something went terribly wrong" });
    });
});

//----------------GOOD
//----------------GET REQUEST (BLOG POSTS BY ID)
app.get("/posts/:id", (req, res) => {
  BlogPost
    .findById(req.params.id)
    .then(post => {
      res.json({
        id: post._id,
        author: post.authorName,
        title: post.content,
        content: post.title,
        comment: post.comments
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: "something went terribly wrong" });
    });
});

//----------------GET REQUEST (AUTHORS)
app.get("/authors", (req, res) => {
  Author
  .find()
  .then(authors => {
    res.json(authors.map(author => {
      return {
        id: author._id,
        name: `${author.firstName} ${author.lastName}`,
        userName: author.userName
      };
    }));
  })
  .catch(err => {
    console.error(err);
    res.status(500).json({ error: 'something went terribly wrong' });
  });
});

//----------------GOOD
//----------------POST REQUEST (BLOG POSTS)
app.post('/posts', (req, res) => {
  const requiredFields = ["title", "content", "author_id"];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }

  Author
    .findById(req.body.author_id)
    .then(author => {
      if (author) {
        BlogPost
          .create({
            title: req.body.title,
            content: req.body.content,
            author: req.body.author
          })
          .then(blogPost => res.status(201).json({
            id: post._id,
            author: `${author.firstName} ${author.lastName}`,
            title: post.content,
            content: post.title,
            comment: post.comments
          }))
          .catch(err => {
            console.error(err);
            res.status(500).json({ error: "something went terribly wrong" });
          });

});

//----------------POST REQUEST (AUTHORS)
app.post('/posts', (req, res) => {
  const requiredFields = ["firstName", "lastName", "userName"];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
  }
  
  Authors
    .findById(req.params.id)
    .then(post => res.json(post.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: "something went terribly wrong" });
    });

});

//----------------GOOD
//----------------PUT REQUEST (BLOG POST)
app.put("/posts/:id", (req, res) => {
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    res.status(400).json({
      error: "Request path id and request body id values must match"
    });
  }

  const updated = {};
  const updateableFields = ["title", "content", "author"];
  updateableFields.forEach(field => {
    if (field in req.body) {
      updated[field] = req.body[field];
    }
  });

  BlogPost
    .findByIdAndUpdate(req.params.id, { $set: updated }, { new: true })
    .then(updatedPost => res.status(204).end())
    .catch(err => res.status(500).json({ message: "something went terribly wrong" }));
});

//----------------GOOD
//----------------DELETE REQUEST SPECIFIC POST
app.delete("/posts/:id", (req, res) => {
  BlogPost
    .findByIdAndRemove(req.params.id)
    .then(() => {
      res.status(204).json({ message: "success" });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: "something went terribly wrong" });
    });
});

//----------------GOOD
app.use('*', function (req, res) {
  res.status(404).json({ message: "Not Found" });
});

//----------------GOOD
// closeServer needs access to a server object, but that only
// gets created when `runServer` runs, so we declare `server` here
// and then assign a value to it in run
let server;

//----------------GOOD
// this function connects to our database, then starts the server
function runServer(databaseUrl, port = PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
      .on('error', err => {
        mongoose.disconnect();
        reject(err);
      });
  });
});
}

//----------------GOOD
// this function closes the server, and returns a promise. we'll
// use it in our integration tests later.
function closeServer() {
return mongoose.disconnect().then(() => {
  return new Promise((resolve, reject) => {
    console.log("Closing server");
    server.close(err => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
});
}

//----------------GOOD
// if server.js is called directly (aka, with `node server.js`), this block
// runs. but we also export the runServer command so other code (for instance, test code) can start the server as needed.
if (require.main === module) {
runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = { runServer, app, closeServer };