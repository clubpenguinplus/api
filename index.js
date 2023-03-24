const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const fs = require('fs');
const { json } = require('body-parser');

const app = express();
const server = http.createServer(app);

const apikey = 'sFDHn5dQUtAXPq7rMi6jg8SJv3u1tN';

// setup folders
var dirs = ['./items', './users'];

for (let dir of dirs) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

// create application/json parser
var jsonParser = bodyParser.json()

const appPost = app.post.bind(app)
app.post = (path, ...args) => {
    const fn = args.pop().bind(this)
    args.push((req, res) => {
        try {
            fn(req, res)
        } catch (err) {
            console.error(err.stack)
            res.send(err.toString())
        }
    })
    appPost(path, ...args)
 }

// Check API key
app.post('/', jsonParser, (req, res) => {
    if (!req.body.apikey === apikey) return res.send('AUTH FAILED');
    res.send('OK');
});

// Functions
app.post('/setPopulation', jsonParser, (req, res) => {
    if (!req.body.apikey === apikey) return res.send('AUTH FAILED');

    this[req.body.world.toLowerCase()] = req.body.population.toString();
    res.send('OK');
});

app.post('/getPopulation', jsonParser, (req, res) => {
    if (!req.body.apikey === apikey) return res.send('AUTH FAILED');
    
    res.send(this[req.body.world.toLowerCase()]);
});

app.post('/getItemAvaliable', jsonParser, (req, res) => {
    if (!req.body.apikey === apikey) return res.send('AUTH FAILED');
    let path = `./items/${req.body.item}.json`;
    if (!fs.existsSync(path)) {
        return res.send(false);
    }
    let itemJson = JSON.parse(fs.readFileSync(path).toString());
    res.send(itemJson.available);
});

app.post('/getItemReleases', jsonParser, (req, res) => {
    if (!req.body.apikey === apikey) return res.send('AUTH FAILED');
    let path = `./items/${req.body.item}.json`;
    if (!fs.existsSync(path)) {
        return res.send("[]");
    }
    let itemJson = JSON.parse(fs.readFileSync(path).toString());
    res.send(itemJson.releases);
});

app.post('/setItemAvaliable', jsonParser, (req, res) => {
    if (!req.body.apikey === apikey) return res.send('AUTH FAILED');

    req.body.item = req.body.item.trim()

    let path = `./items/${req.body.item}.json`;

    if (!fs.existsSync(path)) {
        if (req.body.available) {
            let jso = {}
            jso.available = req.body.available;
        
            jso.releases = [{
                from: Date.now().toString(),
                to: "TBA",
            }];

            fs.writeFileSync(path, JSON.stringify(jso));
        }
        return res.send("OK");
    }

    let itemJson = JSON.parse(fs.readFileSync(path).toString());
    itemJson.available = req.body.available;
    if (req.body.available) {
        if (itemJson.releases && itemJson.releases.length > 0) {
            if (itemJson.releases[itemJson.releases.length - 1].to === "TBA") {
                return res.send("OK");
            }
            itemJson.releases.push({
                from: Date.now().toString(),
                to: "TBA",
            });
        }
        else {
            itemJson.releases = [{
                from: Date.now().toString(),
                to: "TBA",
            }];
        }
    } else {
        if (itemJson.releases && itemJson.releases.length > 0) {
            itemJson.releases[itemJson.releases.length - 1].to = Date.now().toString();
        }
    } 
    fs.writeFileSync(path, JSON.stringify(itemJson));
    res.send('OK');
});

app.post('/userCreated', jsonParser, (req, res) => {
    if (!req.body.apikey === apikey) return res.send('AUTH FAILED');

    if (!fs.existsSync(`./users/${req.body.user}`)) {
        fs.mkdirSync(`./users/${req.body.user}`)
    }

    creationlog = {
        username: req.body.username,
        ip: req.body.ip,
        email: req.body.email,
        date: Date.now(),
        color: req.body.color
    }

    fs.writeFileSync(`./users/${req.body.user}/create.json`, JSON.stringify(creationlog));
    res.send('OK');
});

app.post('/getUserCreationLog', jsonParser, (req, res) => {
    if (!req.body.apikey === apikey) return res.send('AUTH FAILED');

    let path = `./users/${req.body.user}/create.json`;

    if (!fs.existsSync(path)) {
        return res.send("USER NOT FOUND");
    }
    let creationlog = fs.readFileSync(path).toString()
    res.send(creationlog);
});

app.post('/logChatMsg', jsonParser, (req, res) => {
    if (!req.body.apikey === apikey) return res.send('AUTH FAILED');

    if (!fs.existsSync(`./users/${req.body.user}`)) {
        fs.mkdirSync(`./users/${req.body.user}`)
    }

    let path = `./users/${req.body.user}/chat.json`;

    let json = {
        message: req.body.message,
        date: Date.now(),
        room: req.body.room,
		filtered: req.body.filter
    }

    fs.writeFileSync(path, JSON.stringify(json) + "\n", { flag: 'a+' });
    res.send('OK');
});

app.post('/getUserChatLog', jsonParser, (req, res) => {
    if (!req.body.apikey === apikey) return res.send('AUTH FAILED');

    let path = `./users/${req.body.user}/chat.json`;

    if (!fs.existsSync(path)) {
        return res.send("USER NOT FOUND OR HAS NEVER CHATTED");
    }
    let chatlog = fs.readFileSync(path).toString()
    res.send(chatlog);
});

app.post('/logKick', jsonParser, (req, res) => {
    if (!req.body.apikey === apikey) return res.send('AUTH FAILED');

    if (!fs.existsSync(`./users/${req.body.user}`)) {
        fs.mkdirSync(`./users/${req.body.user}`)
    }

    let path = `./users/${req.body.user}/kick.json`;

    let json = {
        date: Date.now(),
        moderator: req.body.moderator,
        reason: req.body.reason
    }

    fs.writeFileSync(path, JSON.stringify(json) + "\n", { flag: 'a+' });
    res.send('OK');
});

app.post('/getUserKickLog', jsonParser, (req, res) => {
    if (!req.body.apikey === apikey) return res.send('AUTH FAILED');

    let path = `./users/${req.body.user}/kick.json`;

    if (!fs.existsSync(path)) {
        return res.send("USER NOT FOUND OR HAS NEVER BEEN KICKED");
    }

    let kicklog = fs.readFileSync(path).toString()
    res.send(kicklog);
});

app.post('/logBan', jsonParser, (req, res) => {
    if (!req.body.apikey === apikey) return res.send('AUTH FAILED');

    if (!fs.existsSync(`./users/${req.body.user}`)) {
        fs.mkdirSync(`./users/${req.body.user}`)
    }

    let path = `./users/${req.body.user}/ban.json`;

    let json = {
        date: Date.now(),
        moderator: req.body.moderator,
        reason: req.body.reason,
        duration: req.body.duration
    }

    fs.writeFileSync(path, JSON.stringify(json) + "\n", { flag: 'a+' });
    res.send('OK');
});

app.post('/getUserBanLog', jsonParser, (req, res) => {
    if (!req.body.apikey === apikey) return res.send('AUTH FAILED');

    let path = `./users/${req.body.user}/ban.json`;

    if (!fs.existsSync(path)) {
        return res.send("USER NOT FOUND OR HAS NEVER BEEN BANNED");
    }

    let banlog = fs.readFileSync(path).toString()
    res.send(banlog);
});

app.post('/logWarn', jsonParser, (req, res) => {
    if (!req.body.apikey === apikey) return res.send('AUTH FAILED');

    if (!fs.existsSync(`./users/${req.body.user}`)) {
        fs.mkdirSync(`./users/${req.body.user}`)
    }

    let path = `./users/${req.body.user}/warn.json`;

    let json = {
        date: Date.now(),
        moderator: req.body.moderator,
        reason: req.body.reason
    }

    fs.writeFileSync(path, JSON.stringify(json) + "\n", { flag: 'a+' });
    res.send('OK');
});

app.post('/getUserWarnLog', jsonParser, (req, res) => {
    if (!req.body.apikey === apikey) return res.send('AUTH FAILED');

    let path = `./users/${req.body.user}/warn.json`;

    if (!fs.existsSync(path)) {
        return res.send("USER NOT FOUND OR HAS NEVER BEEN WARNED");
    }

    let warnlog = fs.readFileSync(path).toString()
    res.send(warnlog);
});

app.post('/logMute', jsonParser, (req, res) => {
    if (!req.body.apikey === apikey) return res.send('AUTH FAILED');

    if (!fs.existsSync(`./users/${req.body.user}`)) {
        fs.mkdirSync(`./users/${req.body.user}`)
    }

    let path = `./users/${req.body.user}/mute.json`;

    let json = {
        date: Date.now(),
        moderator: req.body.moderator,
        reason: req.body.reason,
        duration: req.body.duration
    }

    fs.writeFileSync(path, JSON.stringify(json) + "\n", { flag: 'a+' });
    res.send('OK');
});

app.post('/getUserMuteLog', jsonParser, (req, res) => {
    if (!req.body.apikey === apikey) return res.send('AUTH FAILED');
    

    let path = `./users/${req.body.user}/mute.json`;

    if (!fs.existsSync(path)) {
        return res.send("USER NOT FOUND OR HAS NEVER BEEN MUTED");
    }

    let mutelog = fs.readFileSync(path).toString()
    res.send(mutelog);
});

app.post('/logLogin', jsonParser, (req, res) => {
    if (!req.body.apikey === apikey) return res.send('AUTH FAILED');

    if (!fs.existsSync(`./users/${req.body.user}`)) {
        fs.mkdirSync(`./users/${req.body.user}`)
    }

    let path = `./users/${req.body.user}/login.json`;

    let json = {
        date: Date.now(),
        ip: req.body.ip,
        state: "login"
    }

    fs.writeFileSync(path, JSON.stringify(json) + "\n", { flag: 'a+' });   
    res.send('OK');
});

app.post('/logLogout', jsonParser, (req, res) => {
    if (!req.body.apikey === apikey) return res.send('AUTH FAILED');

    if (!fs.existsSync(`./users/${req.body.user}`)) {
        fs.mkdirSync(`./users/${req.body.user}`)
    }

    let path = `./users/${req.body.user}/login.json`;

    let log = fs.readFileSync(path).toString()
    let latest = JSON.parse(log.split("\n").slice(-2)[0]);

    playDuration = (latest.state === "login") ? Date.now() - latest.date : "unknown";

    let json = {
        date: Date.now(),
        ip: req.body.ip,
        state: "logout",
        playDuration: playDuration
    }

    fs.writeFileSync(path, JSON.stringify(json) + "\n", { flag: 'a+' });
    res.send('OK');
});

app.post('/getUserLoginLog', jsonParser, (req, res) => {
    if (!req.body.apikey === apikey) return res.send('AUTH FAILED');

    let path = `./users/${req.body.user}/login.json`;

    if (!fs.existsSync(path)) {
        return res.send("USER NOT FOUND OR HAS NEVER LOGGED IN");
    }

    let log = fs.readFileSync(path).toString()
    res.send(log);
});
   
app.post('/logTransaction', jsonParser, (req, res) => {
    if (!req.body.apikey === apikey) return res.send('AUTH FAILED');

    if (!fs.existsSync(`./users/${req.body.user}`)) {
        fs.mkdirSync(`./users/${req.body.user}`)
    }

    let path = `./users/${req.body.user}/coins.json`;

    let json = {
        date: Date.now(),
        amount: req.body.amount,
        reason: req.body.reason,
        total: req.body.total
    }

    fs.writeFileSync(path, JSON.stringify(json) + "\n", { flag: 'a+' });
    res.send('OK');
})

app.post('/getUserTransactionLog', jsonParser, (req, res) => {
    if (!req.body.apikey === apikey) return res.send('AUTH FAILED');
    

    let path = `./users/${req.body.user}/coins.json`;

    if (!fs.existsSync(path)) {
        return res.send("USER NOT FOUND OR HAS NEVER MADE A TRANSACTION");
    }

    let log = fs.readFileSync(path).toString()
    res.send(log);
});

// Server start
server.listen(37373, () => {
  console.log('listening on *:37373');
});

