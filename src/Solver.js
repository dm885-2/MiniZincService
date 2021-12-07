import {spawn} from "child_process";

export default class Solver {
    #solver;
    #callback = () => {};

    constructor(dataPath, modelPath, statistisk = false, freeSearch = false)
    {
        this.#solver = spawn(`minizinc ${dataPath} ${modelPath} `, {detached: true});
                
        this.#solver.stdout.on('data', data => this.#onData(data));
        this.#solver.stderr.on('data', data => this.#onErr(data));
        this.#solver.on('close', data => this.#onClosed(data));
    }

    set onFinish(val)
    {
        if(typeof val === "function")
        {
            this.#callback = val;
        }
    }

    #results = [];
    #dataHolder = "";
    #onData(data)
    {
        console.log("Got somethgin", data.toString());
        this.#dataHolder += data.toString();

    }

    #onErr(data)
    {
        console.log("error", data.toString());
    }

    #onClosed(data)
    {
        this.#callback();
    }

    #parse

    stop()
    {
        process.kill(-this.#solver.pid);
    }
}