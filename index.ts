import { BlockChain } from "./block-chain";
import { WebServer } from "./webserver";

const harness:any = () => {

    let chain: BlockChain = new BlockChain();
    let web: WebServer = new WebServer(chain);
};

harness();
