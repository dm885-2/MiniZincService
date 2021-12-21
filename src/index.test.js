import {solve} from './index.js';
import uid from 'uid-safe';
import fs from 'fs';

// Mock functions.
Math.random = jest.fn();
// Set Math.random() = 1, so we know that solverID=500.
Math.random.mockReturnValue(1);

const publishFn = jest.fn();
jest.mock('fs');
jest.mock('uid-safe');
uid.mockReturnValue(500);
jest.mock('../src/Solver.js');


let msg;

describe('A MiniZincService', () => {

  beforeEach(() => {
    publishFn.mockClear();
    msg = {solverID: 9, problemID: 'problemId', model: 'model', data: 'data', solver: 'solver', flagS: false, flagF: false, cpuLimit: 3, memoryLimit: 128, timeLimit: 30, dockerImage: 'dockerImage'};
  });

  it('should do nothing on solve when the solver has a different ID.', () => {
    // Call the solve function.
    solve(msg, publishFn);

    expect(publishFn).toHaveBeenCalledTimes(0);
  });

  it('should write the model and data to files on solve.', () => {
    // Call the solve function.
    msg.solverID = 500;
    solve(msg, publishFn);

    expect(fs.writeFileSync).toHaveBeenCalledTimes(2);
    expect(fs.writeFileSync).toHaveBeenCalledWith('model.mzn', msg.model);
    expect(fs.writeFileSync).toHaveBeenCalledWith('data.dzn', msg.data);
  });
});
