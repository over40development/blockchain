import * as https from "https";
import { Guid } from "./guid";
import * as crypto from "crypto";
import { Collection, Map, List } from "./collection";
import { Transaction } from "./transaction";
import { Block } from "./block";
import { Node } from "./node";

export class BlockChain {

    private _currentTransactions: List<Transaction>;
    private _chain: List<Block>;
    private _nodes: List<Node>;
    private _lastBlock: Block = new Block();

    private _nodeId: string;
    public get nodeId(): string {
        return this._nodeId;
    }

    public set nodeId(value: string) {
        this._nodeId = value;
    }

    constructor() {

        this.nodeId = Guid.create();

        this._currentTransactions = new List<Transaction>();
        this._chain = new List<Block>();
        this._nodes = new List<Node>();
        this._lastBlock = this._chain.Last();

        this.CreateNewBlock(100, "1");
    }

    private registerNode(address: string): void {

        this._nodes.Add(new Node(address = ""));
    }

    private IsValidChain(chain: List<Block>): boolean {
        let block: Block = null;
        let lastBlock: Block = chain.First();
        let currentIndex: number = 1;

        while (currentIndex < chain.Count()) {
            block = chain.Get(currentIndex);
            console.log("${lastBlock}");
            console.log("${block}");
            console.log("----------------------------");

            if (block.PreviousHash !== this.GetHash(lastBlock)) {
                return false;
            }

            // check that the Proof of Work is correct
            if (!this.IsValidProof(lastBlock.Proof, block.Proof, lastBlock.PreviousHash)) {
                return false;
            }

            lastBlock = block;
            currentIndex++;
        }

        return true;
    }

    public Consensus(): string {
        let replaced: boolean = this.ResolveConflicts();
        let message: string = replaced ? "was replaced" : "is authoritive";

        let response: any = {
            Message: `Our chain ${message}`,
            Chain: this._chain
        };

        return JSON.stringify(response);
    }

    public CreateTransaction(sender: string, recipient: string, amount: number): number {
        let transaction: Transaction = new Transaction();
        transaction.sender = sender;
        transaction.recipient = recipient;
        transaction.amount = amount;

        this._currentTransactions.Add(transaction);

        return this._lastBlock != null ? this._lastBlock.Index + 1 : 0;
    }

    private CreateNewBlock(proof: number, previousHash: string = null): Block {
        let block: Block = new Block();

        block.Index = this._chain.Count();
        block.Timestamp = new Date();
        block.Transactions = this._currentTransactions.ToList();
        block.Proof = proof;
        block.PreviousHash = previousHash || this.GetHash(this._chain.Last());

        this._currentTransactions.Clear();
        this._chain.Add(block);

        return block;
    }

    private CreateProofOfWork(lastProof: number, previousHash: string): number {
        let proof: number = 0;
        while (!this.IsValidProof(lastProof, proof, previousHash)) {
            proof++;
        }

        return proof;
    }

    public Mine(): string {
        let proof: number = this.CreateProofOfWork(this._lastBlock.Proof, this._lastBlock.PreviousHash);

        this.CreateTransaction("0", this.nodeId, 1);
        let block: Block = this.CreateNewBlock(proof /*, _lastBlock.PreviousHash*/);

        let response: any = {
            Message: "New Block Forged",
            Index: block.Index,
            Transactions: block.Transactions,
            Proof: block.Proof,
            PreviousHash: block.PreviousHash
        };

        return JSON.stringify(response);
    }

    private IsValidProof(lastProof: number, proof: number, previousHash: string): boolean {
        let guess: string = `${lastProof}${proof}${previousHash}`;
        let result: string = this.GetSha256(guess);

        return result.lastIndexOf("0000", 0) === 0;
    }

    private GetHash(block: Block): string {
        let blockText: string = JSON.stringify(block);
        return this.GetSha256(blockText);
    }

    public GetFullChain(): string {
        let response: any = {
            chain: this._chain,
            length: this._chain.Count()
        };

        return JSON.stringify(response);
    }

    private ResolveConflicts(): boolean {
        let newChain: List<Block> = null;
        let maxLength: number = this._chain.Count();

        for (let node in this._nodes) {
            if (this._nodes.hasOwnProperty(node)) {
                let url: string = `${node}/chain`;
                let request: any = https.request(url);
                let response: any = request.GetResponse();

                if (response.StatusCode === "OK") {
                    let model: any = {
                        chain: new List<Block>(),
                        length: 0
                    };
                    let json: any = new Buffer(response.GetResponseStream().ReadToEnd()).toJSON();
                    let data: any = JSON.parse(json).data;

                    if (data.chain.Count > this._chain.Count() && this.IsValidChain(data.chain)) {
                        maxLength = data.chain.Count;
                        newChain = data.chain;
                    }
                }
            }
        }

        if (newChain != null) {
            this._chain = newChain;
            return true;
        }

        return false;
    }

    public RegisterNodes(nodes: string[]): string {
        let builder: string;
        for (let node in nodes) {
            if (nodes.hasOwnProperty(node)) {
                let url: string = `http://${node}`;
                this.registerNode(url);
                builder += (`${url}, `);
            }
        }

        builder = `${nodes.length} new nodes have been added: ` + builder;
        let result: string = builder.toString();
        return result.substring(0, result.length - 2);
    }

    private GetSha256(data: string): string {
        let bytes: Buffer = new Buffer(data, "ucs2");
        let hash: any = crypto.createHash("sha256");

        hash.update(bytes);

        return hash.digest("hex");
    }
}