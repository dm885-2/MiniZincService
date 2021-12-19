import {spawn, exec} from "child_process";
import kill from "tree-kill";

export default class Solver {
    #solver;
    #callback = () => {};
    id;

    constructor(id, dataPath, modelPath, solver, statistisk = false, freeSearch = false, cpus = false, memory = false, timeLimit = false, dockerImage)
    {
        this.id = id;

        const CMD = this.#buildCommand(dataPath, modelPath, solver, statistisk, freeSearch, cpus, memory, timeLimit, dockerImage);
        this.#solver = exec(CMD,  {}, (err, stdout, stderr) => this.#onDone(err, stdout, stderr));
        this.#solver.stdout.on('data', d => this.#onData(d));
    }

    set onFinish(val)
    {
        if(typeof val === "function")
        {
            this.#callback = val;
        }
    }

    /**
     * Builds the MiniZinc CLI command.
     */
    #DOCKER_DIR = "/sharedData/";
    #buildCommand(dataPath, modelPath, solver, statistisk, freeSearch, cpus, memory, timeLimit, dockerImage = "minizinc/minizinc")
    {
        const addFlag = (bool, flag) => {
            if(bool)
            {
                cmd += ` -${flag}`;
            }
        }
        let cmd = `minizinc ${this.#DOCKER_DIR}${dataPath} ${this.#DOCKER_DIR}${modelPath}`;

        if(solver)
        {
            cmd += ` --solver ${solver}`;
        }

        if(timeLimit)
        {
            cmd += ` --solver-time-limit ${timeLimit}`;
        }

        addFlag(true, "a");
        addFlag(statistisk, "s");
        addFlag(freeSearch, "f");

        let extraFlags = "";
        if(cpus)
        {
            extraFlags += ` --cpus="${cpus}"`;
        }
        if(memory)
        {
            extraFlags += ` --memory="${memory}"`;
        }

        return `docker pull --quiet ${dockerImage} && docker run --rm ${extraFlags} -v ${process.cwd()}/:${this.#DOCKER_DIR} ${dockerImage} /bin/bash -c "${cmd}"`;
    }

    #PARSE_DELIMTERS = {
        "FINAL_SOLUTION": "==========",
        "SOLUTION": "----------",
    };
    #results = [];
    #dataHolder = "";
    #onData(data)
    {
        this.#dataHolder += data;
        if(this.#dataHolder.includes(this.#PARSE_DELIMTERS.SOLUTION))
        {
            let solutions = this.#dataHolder
                .split(this.#PARSE_DELIMTERS.SOLUTION)
                .filter(d => d.trim().length > 0)
                .map(d => ({
                    result: d.trim().split("\r\n"),
                    optimal: false,
                }));

            if(solutions[solutions.length - 1].result[0] === this.#PARSE_DELIMTERS.FINAL_SOLUTION) // Found optimal
            {
                solutions.pop(); // Remove solution line
                solutions[solutions.length - 1].optimal = true;
            }
            this.#results = [
                ...this.#results,
                ...solutions,
            ];
        }
    }

    #onDone(err, stdout, stderr)
    {
        if(stderr || err !== null)
        {
            // Some error
            console.log("Error", err, stderr);
            this.#callback(false);
        }else if(stdout)
        {
            this.#callback(this.#results);
        }

        this.stop();
    }

    /**
     * Stops the solver.
     */
    stop()
    {
        if(this.#solver)
        {
            kill(this.#solver.pid);
        }

        this.#solver = false;
        this.#results = [];
        this.#dataHolder = "";
    }
}