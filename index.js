const express = require('express');
const fs = require('fs');
const users = require("./MOCK_DATA.json");

const app = express();
app.use(express.urlencoded({ extended: false }))
const PORT = 8000;

//ROUTES

app.get("/api/users", (req, res) => {
    return res.json(users);
});

app.get("/users", (req, res) => {
    const html = `
    <ol>
        ${users.map (user => `<li>${user.first_name}</li>`).join("")}
    </ol>
    `;
    return res.send(html);
});


app.route("/user/:id")
    .get((req,res) => {
        const id = Number(req.params.id);
        const user = users.find( user => user.id === id);
        return res.send(user);
    })
    .patch((req,res) => {
        const id = Number(req.params.id);
        console.log (id, req.body);
        console.log (`first_name: ${req.body.first_name}, last_name: ${req.body.last_name}`);

        const user = users.find (user => user.id === id);

        console.log (user);

        const newUser = {id: id, 
            first_name: req.body.first_name != null ? req.body.first_name : user.first_name,
            last_name: req.body.last_name != null ? req.body.last_name : user.last_name,
            email: req.body.email != null ? req.body.email : user.email,
            gender: req.body.gender != null ? req.body.gender : user.gender,
            ip_address: req.body.ip_address != null ? req.body.ip_address : user.ip_address
        }

        console.log (newUser);

        const newUsers = users.map (user => user.id === id ? newUser : user);

        fs.writeFile("./MOCK_DATA.json", JSON.stringify(newUsers), (err, data) => {
            if (err) {
                return res.json({"status": "Failed"});
            }else {
                return res.json({"status": "Success"});
            }
        })

    })
    .delete((req, res) => {
        const id = Number(req.params.id);
        if (!users.find(user => user.id === id)) {
            return res.json({"status": "User does not exist"});
        }
        const newUsers = users.filter (user => user.id != id);
        fs.writeFile("./MOCK_DATA.json", JSON.stringify(newUsers), (err, data) => {
            if (err) {
                return res.json({"status": "Failed"});
            }else {
                return res.json({"status": "Success"});
            }
        })
    });

app.post("/user", (req, res) => {
    const user = req.body;
    users.push({id: users.length + 1, ...user});
    fs.writeFile("./MOCK_DATA.json", JSON.stringify(users), (err, data) => {
        return res.send("Success");
    })
});


app.listen(PORT, ()=> {console.log(`Server started at PORT: ${PORT}`)});