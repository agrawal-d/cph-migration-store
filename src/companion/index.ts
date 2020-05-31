import http from 'http';
import config from '../config';
import EventEmitter from 'events';
import { Problem } from '../types';

// @ts-ignore
let eventsManager: EventEmitter;

export const setupCompanionServer = () => {
    try {
        const server = http.createServer((req, res) => {
            let rawProblem = '';
            req.on('readable', function () {
                console.log('Companion server got data');
                const tmp = req.read();
                if (tmp && tmp != null && tmp.length > 0) {
                    rawProblem += tmp;
                }
            });
            req.on('close', function () {
                rawProblem = JSON.parse(rawProblem);
                console.log(
                    'Companion server closed connection. Emitting event "new problem"',
                );
                eventsManager.emit('new-problem', rawProblem);
            });
            res.write('OK');
            res.end();
        });
        server.listen(config.port);
        console.log('Companion server listening on port', config.port);
        return server;
    } catch (e) {
        console.error('Companion server error :', e);
    }
};

export const setupEventListeners = () => {
    if (eventsManager !== undefined) {
        throw Error('Event listener already exists.');
    }

    // @ts-ignore
    class EventsManager extends EventEmitter {}
    // @ts-ignore
    const cphEvents: EventEmitter = new EventsManager();
    cphEvents.on('new-problem', function (problem: Problem) {
        console.log("Received event 'new-event'", problem);
        // TODO handleCompanion(problem);
    });

    eventsManager = cphEvents;
    console.log('Event listeners setup');
};
