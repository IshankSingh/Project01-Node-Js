const express = require("express");
const mongoose = require("mongoose");
const fs = require("fs");

const users = require("./MOCK_DATA.json");
const schema = require("./db/user_schema.js");

const app = express();
app.use(express.urlencoded({ extended: false }));
const PORT = 8000;

//MongoDB Connection

mongoose
  .connect("mongodb://127.0.0.1:27017/Project01")
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.log("Mongo error", err);
  });

//Creating model for mongodb schema

const user_collection = mongoose.model("user", schema.userSchema);

//ROUTES

app.get("/api/users", async (req, res) => {
    const allUsers = await user_collection.find({});
    return res.json(allUsers);
});

app.get("/users", async (req, res) => {
    const allUsers = await user_collection.find({}); 

    const html = `
    <ol>
        ${allUsers.map((user) => `<li>${user.firstName}</li>`).join("")}
    </ol>
    `;
    return res.send(html);
});

app
  .route("/user/:id")
  .get( async (req, res) => {
      const user = await user_collection.findById(req.params.id);
      return user == null
          ? res.status(800).send("User does not exist")
          : res.send(user);
  })
  .patch( async (req, res) => {
    const id = req.params.id;
    const user = await user_collection.findById(id);

    const updatedUser = await user_collection.findByIdAndUpdate(req.params.id, {
      firstName: req.body.first_name != null ? req.body.first_name : user.firstName,
      lastName: req.body.last_name != null ? req.body.last_name : user.lastName,
      email: req.body.email != null ? req.body.email : user.email,
      gender: req.body.gender != null ? req.body.gender : user.gender,
      ipAddress: req.body.ip_address != null ? req.body.ip_address : user.ipAddress
    }, 
    { new: true });

    console.log (`user: ${updatedUser}`);
    return res.status(200).json (updatedUser);

    /* ---------------code for updating in file---------------------
    const newUser = {
      id: id,
      first_name:
        req.body.first_name != null ? req.body.first_name : user.first_name,
      last_name:
        req.body.last_name != null ? req.body.last_name : user.last_name,
      email: req.body.email != null ? req.body.email : user.email,
      gender: req.body.gender != null ? req.body.gender : user.gender,
      ip_address:
        req.body.ip_address != null ? req.body.ip_address : user.ip_address,
    };

    const newUsers = users.map((user) => (user.id === id ? newUser : user));

    fs.writeFile("./MOCK_DATA.json", JSON.stringify(newUsers), (err, data) => {
      if (err) {
        return res.json({ status: "Failed" });
      } else {
        return res.json({ status: "Success" });
      }
    });
    */
  })
  .delete( async (req, res) => {
    const id = req.params.id;
    const user = await user_collection.findById(id);

    if (user === null) {
      return res.status(404).json({ status: "User does not exist" });
    }

    user.deleteOne();
    return res.status(200).json({ message: `User whose id: ${id} account gets deleted!` });

    /*
    if (!users.find((user) => user.id === id)) {
      return res.json({ status: "User does not exist" });
    }
    const newUsers = users.filter((user) => user.id != id);
    fs.writeFile("./MOCK_DATA.json", JSON.stringify(newUsers), (err, data) => {
      if (err) {
        return res.json({ status: "Failed" });
      } else {
        return res.json({ status: "Success" });
      }
    });
    */
  });

// app.get("/users/:id", (req, res) => {
//     const id = Number(req.params.id);
//     const user = users.find( user => user.id === id);
//     return res.send(user);
// });

app.post("/user", async (req, res) => {
  const user = req.body;
  if (!user || !user.first_name || !user.email) {
    return res
      .status(400)
      .json({
        msg: "first_name and email are compulsory for creating account",
      });
  }

  const result = await user_collection.create({
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
    gender: user.gender,
    ipAddress: user.ip_address,
  });

  console.log(result);
  return res.status(201).json({ msg: "user created" });
});

app.listen(PORT, () => {
  console.log(`Server started at PORT: ${PORT}`);
});
