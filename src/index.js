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
        solver: string|false,
        flagS: boolean,
        flagF: boolean,
    }
*/
export async function solve(msg, publish){
    if(solver) // Solver is busy
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

        publish("solver-response", { // Stop other solvers working on this problem
            problemID: msg.problemID,
            data,
        }); 

        solver = false;
    };
}

export async function stopSolve(msg, publish){
    if(!solver || solver.id !== msg.problemID) // This isnt for this solver
    {
        return;
    }

    solver.stop();
    solver = false;
}

if(process.env.RAPID)
{
    subscriber(host, [{river: "solver", event: "solve", work: solver}]);
    subscriber(host, [{river: "solver", event: "stopSolve", work: stopSolve}]);
}
