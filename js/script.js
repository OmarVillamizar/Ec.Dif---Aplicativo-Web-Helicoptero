let longitudinalChart;
let pitchChart;

function solve() {
    const x0 = parseFloat(document.getElementById('x0').value);
    const v0 = parseFloat(document.getElementById('v0').value);
    const theta0 = parseFloat(document.getElementById('theta0').value);
    const omega0 = parseFloat(document.getElementById('omega0').value);

    const t = numeric.linspace(0, 50, 500);

    const longMotion = (t, y) => {
        const [x, v] = y;
        const m = 1; // Masa del helicóptero
        const ce = 1 / 3000; // Coeficiente de resistencia
        const Fp = 2 / 3; // Fuerza del propulsor
        return [v, (Fp - ce * v * v) / m];
    };

    const pitchMotion = (t, y) => {
        const [theta, omega] = y;
        const Ix = 1; // Momento de inercia
        const d = 1; // Distancia del centro de masas al eje de balanceo
        const ct = 0.1; // Coeficiente de torsión
        const Fu = 1; // Fuerza de sustentación
        const Fb = 1; // Fuerza de balanceo
        return [omega, (d * (Fu - Fb) - ct * omega) / Ix];
    };

    const resultsLong = solveODE(longMotion, [x0, v0], t);
    const resultsPitch = solveODE(pitchMotion, [theta0, omega0], t);

    updateChart('longitudinalChart', t, resultsLong, 'Posición', 'Velocidad', longitudinalChart);
    updateChart('pitchChart', t, resultsPitch, 'Ángulo', 'Velocidad Angular', pitchChart);
}

function solveODE(f, y0, t) {
    const dt = t[1] - t[0];
    let y = [y0];
    for (let i = 1; i < t.length; i++) {
        const ti = t[i - 1];
        const yi = y[i - 1];
        const k1 = numeric.mul(dt, f(ti, yi));
        const k2 = numeric.mul(dt, f(ti + dt / 2, numeric.add(yi, numeric.div(k1, 2))));
        const k3 = numeric.mul(dt, f(ti + dt / 2, numeric.add(yi, numeric.div(k2, 2))));
        const k4 = numeric.mul(dt, f(ti + dt, numeric.add(yi, k3)));
        const yi_next = numeric.add(yi, numeric.div(numeric.add(numeric.add(k1, numeric.mul(2, k2)), numeric.add(numeric.mul(2, k3), k4)), 6));
        y.push(yi_next);
    }
    return y;
}

function updateChart(chartId, labels, data, label1, label2, chart) {
    if (chart) {
        chart.data.labels = labels;
        chart.data.datasets[0].data = data.map(y => y[0]);
        chart.data.datasets[1].data = data.map(y => y[1]);
        chart.update();
    } else {
        const ctx = document.getElementById(chartId).getContext('2d');
        chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: label1,
                        data: data.map(y => y[0]),
                        borderColor: 'blue',
                        fill: false,
                    },
                    {
                        label: label2,
                        data: data.map(y => y[1]),
                        borderColor: 'green',
                        fill: false,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Tiempo',
                        },
                    },
                    y: {
                        title: {
                            display: true,
                            text: label1 === 'Posición' ? 'Valor (Longitudinal)' : 'Valor (Cabeceo)',
                        },
                    },
                },
            },
        });
    }
    if (chartId === 'longitudinalChart') {
        longitudinalChart = chart;
    } else {
        pitchChart = chart;
    }
}

function clearData() {
    document.getElementById('x0').value = '';
    document.getElementById('v0').value = '';
    document.getElementById('theta0').value = '';
    document.getElementById('omega0').value = '';

    if (longitudinalChart) {
        longitudinalChart.destroy();
        longitudinalChart = null;
    }

    if (pitchChart) {
        pitchChart.destroy();
        pitchChart = null;
    }
}