import { Server } from "./Server";

const server = new Server();

server.listen(53)
.then(() => {
    server.logger.info("listening on port 53")
});