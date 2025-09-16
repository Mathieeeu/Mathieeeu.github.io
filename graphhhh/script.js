const width = window.innerWidth;
const height = window.innerHeight;

let nodes = [];
let links = [];
let showWeights = false;
let respectDistances = false;
let BASE_LINK_DISTANCE = 75; // Distance de base réduite
let linkDistanceCoefficient = 0.5; // Coefficient initial (50%)

// config D3js
const svg = d3.select("#graph")
    .attr("width", width)
    .attr("height", height);

const g = svg.append("g");
const linkGroup = g.append("g").attr("class", "links");
const nodeGroup = g.append("g").attr("class", "nodes");

// simulation de la force via d3
let simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(d => d.id).distance(d => {
        let distance = BASE_LINK_DISTANCE;
        if (respectDistances) {
            distance *= (d.weight / 10);
        }
        return distance * linkDistanceCoefficient;
    }))
    .force("charge", d3.forceManyBody().strength(-300))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("collision", d3.forceCollide().radius(30));

// zoom et pan
const zoom = d3.zoom()
    .scaleExtent([0.1, 4])
    .on("zoom", (event) => {
        g.attr("transform", event.transform);
    });

svg.call(zoom);

// couleurs
function getRandomColor() {
    const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
        '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
        '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#F4D03F'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

// notifications
function showNotification(message, isError = false) {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');

    notificationText.textContent = message;
    notification.className = `notification ${isError ? 'error' : ''} show`;

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// save
function saveGraph() {
    try {
        const graphData = {
            metadata: {
                version: "1.0",
                created: new Date().toISOString(),
                nodeCount: nodes.length,
                linkCount: links.length
            },
            nodes: nodes.map(node => ({
                id: node.id,
                name: node.name,
                group: node.group,
                weight: node.weight,
                color: node.color,

                x: node.x || null, // sauvegarder la position actuelle (si existe)
                y: node.y || null
            })),
            links: links.map(link => ({
                source: typeof link.source === 'object' ? link.source.id : link.source,
                target: typeof link.target === 'object' ? link.target.id : link.target,
                weight: link.weight,
                color: link.color
            }))
        };

        const dataStr = JSON.stringify(graphData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

        const exportFileDefaultName = `graphe_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();

        showNotification('Graphe sauvegardé avec succès!');
    } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        showNotification('Erreur lors de la sauvegarde!', true);
    }
}

// load
function loadGraph(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const graphData = JSON.parse(e.target.result);

            // validation format
            if (!graphData.nodes || !graphData.links || !Array.isArray(graphData.nodes) || !Array.isArray(graphData.links)) {
                throw new Error('Format de fichier invalide');
            }

            // charger données depuis le fichier json
            nodes = graphData.nodes.map(node => ({
                id: node.id,
                name: node.name || `Node ${node.id}`,
                group: node.group || 1,
                weight: node.weight || 1,
                color: node.color || getRandomColor(),
                x: node.x || null,
                y: node.y || null
            }));

            links = graphData.links.map(link => ({
                source: link.source,
                target: link.target,
                weight: link.weight || 1,
                color: link.color || getRandomColor()
            }));

            // màj graph et stats sur l'ui
            updateGraph();

            // notification
            const metadata = graphData.metadata;
            const message = metadata
                ? `Graphe chargé: ${metadata.nodeCount} noeuds, ${metadata.linkCount} liens`
                : `Graphe chargé: ${nodes.length} noeuds, ${links.length} liens`;

            showNotification(message);

        } catch (error) {
            console.error('Erreur lors du chargement:', error);
            showNotification('Erreur: fichier invalide!', true);
        }
    };
    reader.readAsText(file);

    // reset le input file pour permettre de recharger le même fichier sinon ça marche paass voila voila
    event.target.value = '';
}

// burger
function toggleMenu() {
    const burger = document.querySelector('.burger');
    const controls = document.getElementById('controls');

    burger.classList.toggle('active');
    controls.classList.toggle('open');
}

// toggle des poids
function toggleWeights() {
    showWeights = document.getElementById('showWeights').checked;
    updateWeightVisibility();
}

function updateWeightVisibility() {
    nodeGroup.selectAll('.node-weight')
        .style('display', showWeights ? 'block' : 'none');
    linkGroup.selectAll('.link-weight')
        .style('display', showWeights ? 'block' : 'none');
}

function toggleRespectDistances() {
    respectDistances = document.getElementById('respectDistances').checked;
    simulation.force("link").distance(d => {
        let distance = BASE_LINK_DISTANCE;
        if (respectDistances) {
            distance *= (d.weight / 10);
        }
        return distance * linkDistanceCoefficient;
    });
    simulation.alpha(1).restart();
}

// générateur de graphes
function generateRandomGraph() {
    const nodeCount = Math.floor(Math.random() * 14) + 10;
    const nodeNames = [
        "Alpha", "Beta", "Gamma", "Delta", "Epsilon", "Zeta", "Eta", "Theta",
        "Iota", "Kappa", "Lambda", "Mu", "Nu", "Xi", "Omicron", "Pi",
        "Rho", "Sigma", "Tau", "Upsilon", "Phi", "Chi", "Psi", "Omega"
    ];

    //noeuds avec poids et couleurs
    nodes = [];
    for (let i = 0; i < nodeCount; i++) {
        nodes.push({
            id: i,
            name: nodeNames[i % nodeNames.length] + (i >= nodeNames.length ? Math.floor(i / nodeNames.length) : ''),
            group: Math.floor(Math.random() * 4) + 1,
            weight: Math.floor(Math.random() * 10) + 1,
            color: getRandomColor()
        });
    }

    // liens avec poids et couleurs
    links = [];
    const linkCount = Math.floor(nodeCount * 1.2 + Math.random() * nodeCount * 0.8);

    for (let i = 0; i < linkCount; i++) {
        const source = Math.floor(Math.random() * nodeCount);
        let target = Math.floor(Math.random() * nodeCount);

        while (target === source) {
            target = Math.floor(Math.random() * nodeCount);
        }

        const existingLink = links.find(l =>
            (l.source === source && l.target === target) ||
            (l.source === target && l.target === source)
        );

        if (!existingLink) {
            links.push({
                source: source,
                target: target,
                weight: Math.floor(Math.random() * 20) + 1,
                color: getRandomColor()
            });
        }
    }
}

// Graphe d'exemple
function generateExampleGraph() {
    nodes = [
        { id: 0, name: "Alpha", group: 1, weight: 10, color: '#FF6B6B' },
        { id: 1, name: "Beta", group: 2, weight: 5, color: '#4ECDC4' },
        { id: 2, name: "Gamma", group: 2, weight: 7, color: '#45B7D1' },
        { id: 3, name: "Delta", group: 2, weight: 3, color: '#96CEB4' },
        { id: 4, name: "Epsilon", group: 3, weight: 8, color: '#FFEAA7' },
        { id: 5, name: "Zeta", group: 3, weight: 4, color: '#DDA0DD' },
        { id: 6, name: "Eta", group: 3, weight: 6, color: '#98D8C8' },
        { id: 7, name: "Theta", group: 4, weight: 9, color: '#F7DC6F' },
        { id: 8, name: "Iota", group: 4, weight: 2, color: '#BB8FCE' },
        { id: 9, name: "Kappa", group: 4, weight: 5, color: '#85C1E9' },
        { id: 10, name: "Lambda", group: 1, weight: 7, color: '#F8C471' },
        { id: 11, name: "Mu", group: 2, weight: 3, color: '#82E0AA' },
        { id: 12, name: "Nu", group: 3, weight: 6, color: '#F1948A' }
    ];

    links = [
        { source: 0, target: 1, weight: 15, color: '#FF9F9F' },
        { source: 0, target: 2, weight: 8, color: '#7EDDD7' },
        { source: 0, target: 3, weight: 12, color: '#6FC5E4' },
        { source: 0, target: 4, weight: 20, color: '#AACFC7' },
        { source: 0, target: 7, weight: 5, color: '#FFEDBA' },
        { source: 0, target: 10, weight: 18, color: '#E6B3E6' },
        { source: 1, target: 2, weight: 10, color: '#B1DDD8' },
        { source: 2, target: 3, weight: 7, color: '#F9E79C' },
        { source: 1, target: 11, weight: 13, color: '#CAB8F5' },
        { source: 4, target: 5, weight: 9, color: '#A8C9F0' },
        { source: 5, target: 6, weight: 11, color: '#FBD684' },
        { source: 4, target: 12, weight: 6, color: '#95E2B5' },
        { source: 7, target: 8, weight: 14, color: '#F7A4A4' },
        { source: 8, target: 9, weight: 4, color: '#A8C9F0' },
        { source: 7, target: 9, weight: 16, color: '#F7E76C' },
        { source: 10, target: 11, weight: 8, color: '#CAB8F5' },
        { source: 11, target: 12, weight: 12, color: '#A8C9F0' },
        { source: 3, target: 6, weight: 7, color: '#FBD684' },
        { source: 6, target: 9, weight: 9, color: '#95E2B5' },
        { source: 2, target: 5, weight: 11, color: '#F7A4A4' }
    ];
}

// // Fonction pour randomiser les couleurs
// function randomizeColors() {
//     nodes.forEach(node => {
//         node.color = getRandomColor();
//     });

//     links.forEach(link => {
//         link.color = getRandomColor();
//     });

//     updateNodeColors();
//     updateLinkColors();
// }

function updateNodeColors() {
    nodeGroup.selectAll('.node circle')
        .style('fill', d => d.color);
}

function updateLinkColors() {
    linkGroup.selectAll('.link')
        .style('stroke', d => d.color);
}


function updateGraph() {
    // nettoyage des anciens éléments
    linkGroup.selectAll("*").remove();
    nodeGroup.selectAll("*").remove();

    // Maj des liens
    const linkSelection = linkGroup.selectAll(".link-group")
        .data(links, d => `${d.source.id || d.source}-${d.target.id || d.target}`);

    const linkEnter = linkSelection.enter().append("g")
        .attr("class", "link-group");

    linkEnter.append("line")
        .attr("class", "link")
        .style("stroke", d => d.color);

    // Ajout des poids des edges
    linkEnter.append("text")
        .attr("class", "link-weight")
        .text(d => d.weight)
        .style('display', showWeights ? 'block' : 'none');

    // maj des noeuds
    const nodeSelection = nodeGroup.selectAll(".node")
        .data(nodes, d => d.id);

    const nodeEnter = nodeSelection.enter().append("g")
        .attr("class", "node")
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    nodeEnter.append("circle")
        .attr("r", 20)
        .style("fill", d => d.color);

    nodeEnter.append("text")
        .text(d => d.name);

    // Ajout des poids des noeuds
    nodeEnter.append("text")
        .attr("class", "node-weight")
        .attr("dy", 25)
        .text(d => d.weight)
        .style('display', showWeights ? 'block' : 'none');

    // maj de la simulation
    simulation.nodes(nodes);
    simulation.force("link").links(links);
    simulation.alpha(1).restart();

    simulation.on("tick", () => {
        linkGroup.selectAll(".link-group").each(function (d) {
            const group = d3.select(this);
            const line = group.select("line");
            const text = group.select("text");

            line.attr("x1", d.source.x)
                .attr("y1", d.source.y)
                .attr("x2", d.target.x)
                .attr("y2", d.target.y);

            // position du texte qui affiche le poids au milieu de l'arête
            const midX = (d.source.x + d.target.x) / 2;
            const midY = (d.source.y + d.target.y) / 2;
            text.attr("x", midX).attr("y", midY);
        });

        nodeGroup.selectAll(".node")
            .attr("transform", d => `translate(${d.x}, ${d.y})`);
    });

    updateStats();
}

// possibilité de drag les noeuds 
function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;

    // // changer les couleurs pendant le drag (marrant mais un peu chiant aussi)
    // d.color = getRandomColor();
    // d3.select(event.sourceEvent.target.parentNode).select('circle')
    //     .style('fill', d.color);
}

function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}

// stats (noeuds, liens, densité, composants) (densité et composants désactivés pour l'instant car marchent pas super bien + pas hyper utiles)
function updateStats() {
    document.getElementById('nodeCount').textContent = nodes.length;
    document.getElementById('linkCount').textContent = links.length;

    const maxLinks = nodes.length * (nodes.length - 1) / 2;
    // const density = maxLinks > 0 ? Math.round((links.length / maxLinks) * 100) : 0;
    // document.getElementById('density').textContent = density + '%';

    // const components = Math.max(1, Math.floor(nodes.length / 5));
    // document.getElementById('components').textContent = components;
}

function restartSimulation() {
    // déplace l'origin du zoom au centre pour éviter d'être perdu sur la toile mdr
    svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity.translate(0, 0).scale(1));
    simulation.alpha(1).restart();
}

// nouveau graphe aléatoire
function generateNewGraph() {
    document.getElementById('loading').style.display = 'block';

    // Fermer le menu burger automatiquement
    const burger = document.querySelector('.burger');
    const controls = document.getElementById('controls');
    burger.classList.remove('active');
    controls.classList.remove('open');

    setTimeout(() => {
        generateRandomGraph();
        updateGraph();
        document.getElementById('loading').style.display = 'none';
    }, 500);
}

// Controles
document.getElementById('forceStrength').addEventListener('input', function () {
    simulation.force("charge").strength(-this.value);
    simulation.alpha(0.3).restart();
});

document.getElementById('linkDistance').addEventListener('input', function () {
    linkDistanceCoefficient = parseInt(this.value) / 100;
    simulation.force("link").distance(d => {
        let distance = BASE_LINK_DISTANCE;
        if (respectDistances) {
            distance *= (d.weight / 10);
        }
        return distance * linkDistanceCoefficient;
    });
    simulation.alpha(0.3).restart();
});

document.getElementById('nodeSize').addEventListener('input', function () {
    nodeGroup.selectAll("circle").attr("r", this.value);
});

// Gestion du redimensionnement de la page
window.addEventListener('resize', () => {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;

    svg.attr("width", newWidth).attr("height", newHeight);
    simulation.force("center", d3.forceCenter(newWidth / 2, newHeight / 2));
    simulation.alpha(0.3).restart();
});

// pour fermer le menu burger si on clique en dehors :
document.addEventListener('click', function (event) {
    const burger = document.querySelector('.burger');
    const controls = document.getElementById('controls');
    const burgerMenu = document.querySelector('.burger-menu');

    // Par contre ne pas fermer si on clique sur le burger lui-même (sinon ça ouvre et ferme instant et on a l'impression que ça marche pas (si quelqu'un lit ce commentaire, j'ai été coincé 10min dessus........))
    if (burgerMenu.contains(event.target)) {
        return;
    }

    // Et ne pas fermer si on clique dans le menu de controles
    if (controls.contains(event.target)) {
        return;
    }

    // Sinon on ferme
    burger.classList.remove('active');
    controls.classList.remove('open');
});

// Initialisation de la page :)
setTimeout(() => {
    generateExampleGraph();
    updateGraph();
    document.getElementById('loading').style.display = 'none';
}, 1000);
