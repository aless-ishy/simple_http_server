const http = require("http");
const {EventEmitter} = require("events")
const fs = require("fs");

const host = "127.0.0.1";
const port = 3000;
const url = `http://${host}:${port}/`;

const client_files = {};
const file_names = fs.readdirSync("client");
for (let file_name of file_names)
    if (file_name.endsWith(".css") || file_name.endsWith(".html") || file_name.endsWith(".js"))
        client_files["/" + file_name] = fs.readFileSync("client/" + file_name);


const getExtension = (name) => {
    const splits = name.split(".");
    switch (splits[splits.length - 1]) {
        case "js":
            return "javascript";
        case "html":
            return "html";
        case "css":
            return "css"
        default:
            return undefined;
    }
}

const endPoints = new EventEmitter();
endPoints.on("/", (res) => {
    res.setHeader("Content-Type", "text/html");
    res.write(client_files["/index.html"]);
});
endPoints.on("/api", (res) => res.write("<h1>API</h1>"));


const server = http.createServer((req, res) => {
    console.log(`GET: ${req.url}`)
    if (endPoints.emit(req.url, res)) {
        res.statusCode = 200;
        res.end();
    } else if (client_files[req.url]) {
        const resp_type = "text/" + getExtension(req.url);
        res.setHeader("Content-Type", resp_type);
        res.statusCode = 200;
        res.write(client_files[req.url]);
        res.end()
    } else {
        res.setHeader("Content-Type", "text/html");
        res.statusCode = 404;
        res.write(client_files["/notFound.html"]);
        res.end();
    }
});

server.listen(port, host, () => console.log(`Listen in ${url}`));