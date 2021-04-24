const fs = require('fs');
const express = require('express');
const { PythonShell } = require('python-shell');

const app = express();
const PORT = process.env.PORT || 3000;

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
	console.log('Snack dispensed!', response);

	res.send({ state: 0 });
    });
});

app.get('/current-state', async (req, res) => {
    console.log('GET CURRENT STATE');
    res.send({ state: 0 });
});

app.post('/target-state', async (req, res) => {
    console.log('POST TARGET STATE');
    res.send({ state: 1 });
}); 

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
