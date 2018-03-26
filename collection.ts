export class Map<T> {
    private items: { [key: string]: T };

    constructor() {
        this.items = {};
    }

    add(key: string, value: T): void {
        this.items[key] = value;
    }

    has(key: string): boolean {
        return key in this.items;
    }

    get(key: string): T {
        return this.items[key];
    }
}

export class List<T> {

    private items: Array<T> = [];

    constructor(items?: Array<T>) {
        this.items = items || [];
    }

    ToList(): List<T> {
        return this.items.ToList();
    }

    Count(): number {
        return this.items.length;
    }

    Add(value: T): void {
        this.items.push(value);
    }

    Clear(): void {
        this.items.splice(0, this.items.length);
    }

    Get(index: number): T {
        return this.items[index];
    }

    First(): T {
        return this.items[0];
    }

    Last(): T {
        return this.items[this.items.length];
    }
}

declare global {
    // tslint:disable-next-line:interface-name
    interface Array<T> {
        ToList(): List<T>;
    }
}

Array.prototype.ToList = () => {
    return new List(this);
};

export class Collection<T> {

    private _items: Array<T> = [];

    public GetItems(): Array<T> {

        return this._items;
    }

    public Clear(): void {

        this._items.splice(0, this.GetItems().length);
    }

    public First(): T {

        return this.GetItem(0);
    }

    public Last(): T {

        return this.GetItem(this.GetItems().length);
    }

    public GetItem(index: number): T {

        return this._items[index];
    }

    public Count(): number {

        return this._items.length;
    }

    public Add(item: T): void {

        this._items.push(item);
    }

    public Delete(index: number): void {

        this._items.splice(index, 1);
    }

    public IndexOfItem(item: T, index?: number): number {

        if (index == null) {
            index = 0;
        } else if (index < 0) {
            index = Math.max(0, this._items.length + index);
        }

        for (let i: number = index, j: number = this._items.length; i < j; i++) {
            if (this._items[i] === item) {
                return i;
            }
        }

        return -1;
    }
}