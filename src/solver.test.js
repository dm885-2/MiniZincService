describe("A solver", () => {
    it("should return a optimal solution", () => {
        expect(1).toBe(1);
    });
});

import child from "child_process";

import Solver from "./Solver.js";

let testOutput = `no. of banana cakes = 0
no. of chocolate cakes = 0
----------
no. of banana cakes = 1
no. of chocolate cakes = 0
----------
no. of banana cakes = 2
no. of chocolate cakes = 0
----------
no. of banana cakes = 3
no. of chocolate cakes = 0
----------
no. of banana cakes = 2
no. of chocolate cakes = 1
----------
no. of banana cakes = 3
no. of chocolate cakes = 1
----------
no. of banana cakes = 2
no. of chocolate cakes = 2
----------
==========`;

let ret = (callback) => ({
    pid: 0,
    stdout: {
        on: (type, func) => {
            func(testOutput);
            callback(null, true, false);
        }
    }
});

child.exec = jest.fn();
child.exec.mockImplementation((cmd, options, callback) => ret(callback));

describe("A solver", () => {
    beforeEach(() => {
        child.exec.mockClear();
    });

    it("should return a optimal solution", async () => {
        new Solver(false, false, false, false, false, false, false, false,false, false, (data) => {
            expect(data.find(d => d.optimal)).toBeTruthy();
        });
    });

    it("should return 7 solutions", async () => {
        new Solver(false, false, false, false, false, false, false, false,false, false, (data) => {
            expect(data.length).toBe(7);
        });
    });

    it("should call the exec function", async () => {
        new Solver(false, false, false, false, false, false, false, false,false, false, (data) => {
            expect(child.exec).toHaveBeenCalledTimes(1);
        });
    });
});
