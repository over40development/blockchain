import { List } from "./collection";
import { Transaction } from "./transaction";

export class Block {

    public Index: number = 0;
    public Timestamp: Date;
    public Transactions: List<Transaction> = new List<Transaction>();
    public Proof: number = 0;
    public PreviousHash: string = "";

    public ToString(): string {

        return `${this.Index} [${this.Timestamp}] Proof: ${this.Proof}
            | PrevHash: ${this.PreviousHash} | Trx: ${this.Transactions.Count()}`;
    }
}