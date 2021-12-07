import {host, getTokenData, subscriber} from "./helpers.js";
import Solver from "./Solver";

import fs from "fs";

let solver = false; // Not busy

/*
    Expected input:
    {
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

    solver = new Solver("model.mzn", "data.dzn", false, false);
}

export async function stopSolve(msg, publish){
    if(!solver) // Solver is busy
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
