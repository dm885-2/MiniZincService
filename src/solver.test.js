import Solver from "./Solver.js";

let test = new Solver("prod-planning.dzn", "prod-planning.mzn");
test.onFinish = data => {
    console.log("Sap", data);
};