document.addEventListener('DOMContentLoaded', function() {
    const tabs = document.querySelectorAll('.nav a');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('href');

            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            tabContents.forEach(content => {
                content.classList.remove('active');
            });

            document.querySelector(target).classList.add('active');
        });
    });

    // Load the first tab by default
    document.querySelector('.nav a').click();

    // Load CSV data and create charts
    Papa.parse('../data/data.csv', {
        download: true,
        header: true,
        complete: function(results) {
            const data = results.data;
            console.log(data); // Verify the structure of the data
            const filteredData = filterData(data);
            createKDAChart(filteredData);
            createESRChart(filteredData);
            createBaitScoreChart(filteredData);
            createImpactChart(filteredData);
        }
    });
});

function filterData(data, minRounds = 50) {
    return data.filter(row => {
        return row.Player !== undefined &&
               row.Team !== undefined &&
               row.Rnd !== undefined &&
               row.KPR !== undefined &&
               row.APR !== undefined &&
               row.DPR !== undefined &&
               row.FKPR !== undefined &&
               row.FDPR !== undefined &&
               row.KD !== undefined &&
               row.CL !== undefined &&
               row.APR !== undefined &&
               row.KAST !== undefined &&
               row.ACS !== undefined &&
               !isNaN(parseInt(row.Rnd)) &&
               parseInt(row.Rnd) >= minRounds;
    });
}

function createKDAChart(data) {
    const ctx = document.getElementById('kdaChart').getContext('2d');
    const kprApr = data.map(row => (parseFloat(row.KPR || 0) + parseFloat(row.APR || 0)));
    const dpr = data.map(row => parseFloat(row.DPR || 0));

    new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'KDA Ratio',
                data: kprApr.map((value, index) => ({
                    x: dpr[index],
                    y: value,
                    player: data[index].Player,
                    team: data[index].Team,
                    kpr: data[index].KPR,
                    apr: data[index].APR,
                    dpr: data[index].DPR,
                    rounds: data[index].Rnd
                })),
                backgroundColor: 'rgba(255, 99, 132, 0.6)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    title: {
                        display: true,
                        text: 'DPR'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'KPR + APR'
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const dataPoint = context.raw;
                            return [
                                `Player: ${dataPoint.player}`,
                                `Team: ${dataPoint.team}`,
                                `KPR: ${dataPoint.kpr}`,
                                `APR: ${dataPoint.apr}`,
                                `DPR: ${dataPoint.dpr}`,
                                `(${dataPoint.rounds} rounds)`
                            ];
                        }
                    }
                }
            }
        }
    });
}

function createESRChart(data) {
    const ctx = document.getElementById('esrChart').getContext('2d');
    const fkpr = data.map(row => parseFloat(row.FKPR || 0));
    const fkprFdpr = data.map(row => (parseFloat(row.FKPR || 0) + parseFloat(row.FDPR || 0)));

    new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'ESR',
                data: fkpr.map((value, index) => ({
                    x: fkprFdpr[index],
                    y: value,
                    player: data[index].Player,
                    team: data[index].Team,
                    fkpr: data[index].FKPR,
                    fdpr: data[index].FDPR,
                    rounds: data[index].Rnd
                })),
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    title: {
                        display: true,
                        text: 'FKPR + FDPR'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'FKPR'
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const dataPoint = context.raw;
                            return [
                                `Player: ${dataPoint.player}`,
                                `Team: ${dataPoint.team}`,
                                `FKPR: ${dataPoint.fkpr}`,
                                `FDPR: ${dataPoint.fdpr}`,
                                `(${dataPoint.rounds} rounds)`
                            ];
                        }
                    }
                }
            }
        }
    });
}

function createBaitScoreChart(data) {
    const ctx = document.getElementById('baitscoreChart').getContext('2d');
    const baitScore = data.map(row => {
        const KD = parseFloat(row.KD || 0);
        const lastAlivePR = parseFloat(row.LastAlivePR || 0);
        const APR = parseFloat(row.APR || 1); // Avoid division by zero
        return APR !== 0 ? (KD * lastAlivePR) / APR : 0;
    });
    const rounds = data.map(row => parseInt(row.Rnd || 0));

    new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'BaitScore',
                data: rounds.map((value, index) => ({
                    x: value,
                    y: baitScore[index],
                    player: data[index].Player,
                    team: data[index].Team,
                    kd: data[index].KD,
                    lastAlivePR: data[index].LastAlivePR,
                    apr: data[index].APR,
                    rounds: data[index].Rnd
                })),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    title: {
                        display: true,
                        text: 'Rounds Played'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'BaitScore (KD * LastAlivePR / APR)'
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const dataPoint = context.raw;
                            return [
                                `Player: ${dataPoint.player}`,
                                `Team: ${dataPoint.team}`,
                                `KD: ${dataPoint.kd}`,
                                `LastAlivePR: ${dataPoint.lastAlivePR}`,
                                `APR: ${dataPoint.apr}`,
                                `Rounds: ${dataPoint.rounds}`
                            ];
                        }
                    }
                }
            }
        }
    });
}

function createImpactChart(data) {
    const ctx = document.getElementById('impactChart').getContext('2d');
    const kast = data.map(row => {
        const kastValue = row.KAST?.replace('%', '');
        return kastValue ? parseFloat(kastValue) : 0;
    });
    const acs = data.map(row => parseFloat(row.ACS || 0));

    new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Impact',
                data: kast.map((value, index) => ({
                    x: acs[index],
                    y: value,
                    player: data[index].Player,
                    team: data[index].Team,
                    kast: data[index].KAST,
                    acs: data[index].ACS,
                    rounds: data[index].Rnd
                })),
                backgroundColor: 'rgba(153, 102, 255, 0.6)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    title: {
                        display: true,
                        text: 'ACS'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'KAST'
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const dataPoint = context.raw;
                            return [
                                `Player: ${dataPoint.player}`,
                                `Team: ${dataPoint.team}`,
                                `KAST: ${dataPoint.kast}`,
                                `ACS: ${dataPoint.acs}`,
                                `(${dataPoint.rounds} rounds)`
                            ];
                        }
                    }
                }
            }
        }
    });
}
