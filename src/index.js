import {host, getTokenData, subscriber} from "./helpers.js";
import Solver from "./Solver";

import fs from "fs";

let solver = false; // Not busy

/*
    Expected input:
    {
        problemID: string,
        data: string,
        model: string,
        solver: string,
    }
*/
export async function solve(msg, publish){
    if(solver) // Solver is busy
    {
        return;
    }

    solver = new Solver(msg.problemID, "model.mzn", "data.dzn", false, false, false);
    solver.onFinish = data => {
        if(data && data[data.length - 1].optimal) // Solver found optimal
        {
            publish("stopSolve", { // Stop other solvers working on this problem
                problemID: msg.problemID
            }); 
        }

        publish("solver-response", { // Stop other solvers working on this problem
            problemID: msg.problemID,
            data,
        }); 
    };
}

export async function stopSolve(msg, publish){
    if(!solver || solver.id !== msg.problemID) // This isnt for this solver
    {
        return;
    }

    process.kill(-solver);
    solver = false;
}

if(process.env.RAPID)
{
    subscriber(host, [{river: "solver", event: "solve", work: solver}]);
    subscriber(host, [{river: "solver", event: "stopSolve", work: stopSolve}]);
}
