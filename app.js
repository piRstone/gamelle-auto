const fs = require('fs');
const express = require('express');
const spawn = require('child_process').spawn;
const { PythonShell } = require('python-shell');

const app = express();
const PORT = process.env.PORT || 3000;

const STATE_FILE = 'currentState.json';
const READ_ERROR_MESSAGE = 'Error while reading current state file';
const WRITE_ERROR_MESSAGE = 'Error while writing current state file';

function readStateFile () {
    return new Promise((resolve, reject) => {
        fs.readFile(STATE_FILE, (err, data) => {
            if (err) {
                console.log(READ_ERROR_MESSAGE, err);
     	        reject(READ_ERROR_MESSAGE);
	        return;
	    }
	    const { currentState } = JSON.parse(data);
	    console.log('Current state', currentState);
	    resolve(currentState);
        });
    });
}

function writeStateFile(newState) {
    return new Promise((resolve, reject) => {
        fs.writeFile(STATE_FILE, newState, (err) => {
            if (err) {
                console.log(WRITE_ERROR_MESSAGE, err);
    	        reject(WRITE_ERROR_MESSAGE);
                return;
	        }
        });
	resolve();
    });
}


app.get('/', (req, res) => {
    res.send({ status: 1 });
});

app.post('/test', (req, res) => {
    PythonShell.run('test.py', null, (err, response) => {
        if (err) {
	        console.log('Error while executing python script', err);
	        res.status(500).send('Error');
	        return;
	    }
	    console.log('Croquettes distribuées !', response);
	    res.send({ targetStatus: 1 });
    });
});

app.post('/feed-cat', async (req, res) => {
    let options = {
        pythonPath: '/usr/bin/python',
	    pythonOptions: ['-u'],
	    scriptPath: '/home/pierre'
    };

    PythonShell.run('stepper.py', options, async (err, response) => {
        if (err) {
	    console.log('Error while executing python script', err);
	    res.status(500).send('Error');
	    return;
	}
	console.log('Croquettes distribuées !', response);

	// Write new state
	const currentState = await readStateFile();
	const targetState = currentState === 0 ? 1 : 0;
        const newState = JSON.stringify({ currentState: targetState });
	await writeStateFile();

	res.send({ targetState });
    });
});

app.get('/current-state', async (req, res) => {
    console.log('GET CURRENT STATE');
    try {
        const currentState = await readStateFile();
	    console.log('read state file', currentState);
	    res.send({ currentState });
    } catch (e) {
        res.status(500).send(READ_ERROR_MESSAGE);
    }
});


app.get('/target-state', async (req, res) => {
    console.log('GET TARGET STATE');
    const currentState = await readStateFile();
    res.send({ targetState: currentState });
});

app.post('/target-state', async (req, res) => {
    console.log('POST TARGET STATE');

    const currentState = await readStateFile();
    console.log('Read current state', currentState);

    const targetState = currentState === 0 ? 1 : 0;
    const newState = JSON.stringify({ currentState: targetState });
    
    await writeStateFile(newState);
    console.log('New current state set at :', targetState); 
    res.send({ targetState });
}); 

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
