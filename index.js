var http = require("http");
var crypto = require("crypto");
var { exec } = require("child_process");
require("dotenv").config();

const SECRET = process.env.SECRET;

const GITHUB_REPOSITORIES_TO_DIR = {
    'IIIRataxIII/Ace-Bot': '/Ace-Bot',
  };

http
.createServer((req, res) => {
req.on('data', chunk => {
    const signature = `sha1=${crypto
    .createHmac('sha1', SECRET)
    .update(chunk)
    .digest('hex')}`;

    const isAllowed = req.headers['x-hub-signature'] === signature;

    const body = JSON.parse(chunk);

    const isMaster = body?.ref === 'refs/heads/master';
    var directory = GITHUB_REPOSITORIES_TO_DIR[body?.repository?.full_name];
    if (isAllowed && isMaster && directory) {
        try {
            directory = directory.substr(1,directory.length);
            exec(`cd ${directory} && npm stop && git pull && npm install && nodemon start`);
            console.log("New bot version launched!");
    } catch (error) {
        console.log(error);
    }
    }
});

res.end();
})
.listen(8080);
