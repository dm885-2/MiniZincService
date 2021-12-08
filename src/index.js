import fs from "fs";
import uid from "uid-safe";
import rapid from "@ovcina/rapidriver";

import {host, subscriber} from "./helpers.js";
import Solver from "./Solver.js";

let solverID = Math.random() * 500;
uid(18).then(id => solverID = id);

let solver = false; // Not busy

/*
    Expected input:
    {
        problemID: string,
        data: string,
        model: string,
        solver: string|false,
        flagS: boolean,
        flagF: boolean,
    }
*/
export async function solve(msg, publish){
    if(solver || msg.solverID !== solverID) // Solver is busy
    {
        return;
    }
    solver = true; // Busy while were writing to disk

    fs.writeFileSync("model.mzn", msg.model);
    fs.writeFileSync("data.dzn", msg.data);

    solver = new Solver(msg.problemID, "model.mzn", "data.dzn", msg.solver, msg.flagS, msg.flagF);
    solver.onFinish = data => {
        if(data && data[data.length - 1].optimal) // Solver found optimal
        {
            publish("stopSolve", { // Stop other solvers working on this problem
                problemID: msg.problemID
            }); 
        }

        solver = false;
        publish("solver-response", { // Stop other solvers working on this problem
            problemID: msg.problemID,
            solverID,
            data,
            busy: false,
        }); 
    };
}

export async function stopSolve(msg, publish){
    if(!solver || solver.id !== msg.problemID) // This isnt for this solver
    {
        return;
    }

    solver.stop();
    solver = false;

    publish("solver-pong-response", {
        solverID,
        busy: !!solver,
    });
}

export async function pong(msg, publish){
    if(msg.solverID && msg.solverID !== solverID) // This isnt for this solver
    {
        return;
    }
    
    publish("solver-pong-response", {
        solverID,
        busy: !!solver,
    });
}

if(process.env.RAPID)
{
    subscriber(host, [
        {river: "solver", event: "solve", work: solve},
        {river: "solver", event: "stopSolve", work: stopSolve},
        {river: "solver", event: "solver-ping", work: stopSolve},
    ]);

    setTimeout(() => pong({}, (event, data) => rapid.publish(host, event, data)), 1500); // Tell job-queue about us
}
