import * as http from "http";
import { BlockChain } from "./block-chain";

export class WebServer {

    constructor(chain: BlockChain) {
        const options: any = {
            hostname: "localhost",
            port: 8080,
            path: "/"
        };

        http.createServer((request, response) => {
            response.writeHead(200, { "Content-Type": "application/json" });

            let url: string = request.url;
            switch (url) {
                case "/mine":
                    response.write(chain.Mine());
                    break;
                case "/chain":
                    response.write(chain.GetFullChain());
                    break;
                case "/nodes/resolve":
                    response.write(chain.Consensus());
                    break;
                case "/transaction/new":
                    if (request.method !== "POST") {
                        return "Error";
                    }
                    break;
            }

            response.end();
        }).listen(8080);
    }
}