let interval;
let elapsedTime = 0;

export function startStopwatch() {
    interval = setInterval(() => {
        elapsedTime++;
        const time = getStopwatchTime(elapsedTime);
        document.getElementById('stopwatch').innerHTML = time;
    }, 10);
}

export function stopStopwatch() {
    clearInterval(interval);
}

export function resetStopwatch() {
    elapsedTime = 0;
    document.getElementById('stopwatch').innerHTML = '00:00.000';
}

export function getStopwatchTime(elapsedTime) {
    const minutes = Math.floor((elapsedTime % 360000) / 6000);
    const seconds = Math.floor((elapsedTime % 6000) / 100);
    const milliseconds = elapsedTime % 100;

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
}