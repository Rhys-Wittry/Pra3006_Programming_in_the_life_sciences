const sparqlQueryHuman = `
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX taxon: <http://purl.uniprot.org/taxonomy/>
PREFIX up: <http://purl.uniprot.org/core/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT DISTINCT ?taxon ?taxonName ?protein ?proteinName ?fullName ?sequence 
WHERE {
  # Find virus taxa
  ?taxon a up:Taxon .
  ?taxon rdfs:subClassOf taxon:10239 .  # Virus taxa (taxon ID 10239)
  ?taxon up:scientificName ?taxonName .  # Get the taxon's scientific name

  # Ensure the taxon has human as host
  ?taxon up:host taxon:9606 .

  # Find proteins associated with the virus
  ?protein up:organism ?taxon .  # Protein belongs to the virus taxonomy
  ?protein rdfs:label ?proteinName .  # Get the protein's name

  # Exclude "Uncharacterized protein" entries
  FILTER (?proteinName != "Uncharacterized protein")

  # Get the protein's full name
  ?protein up:alternativeName ?recommendedName .
  ?recommendedName up:fullName ?fullName .

  # Get the protein sequence
  ?protein up:sequence ?isoform .
  ?isoform rdf:value ?sequence .
}
  Limit 1000000
`;
// FILTER NOT EXISTS { ?virus up:host taxon:9606 . }  # Exclude human host (Taxon ID 9606)

const sparqlQueryDog = `
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX taxon: <http://purl.uniprot.org/taxonomy/>
PREFIX up: <http://purl.uniprot.org/core/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT DISTINCT ?taxon ?taxonName ?protein ?proteinName ?fullName ?sequence 
WHERE {
  # Find virus taxa
  ?taxon a up:Taxon .
  ?taxon rdfs:subClassOf taxon:10239 .  # Virus taxa (taxon ID 10239)
  ?taxon up:scientificName ?taxonName .  # Get the taxon's scientific name

  # Ensure the taxon has dog as host
  ?taxon up:host taxon:9615 .

  # Find proteins associated with the virus
  ?protein up:organism ?taxon .  # Protein belongs to the virus taxonomy
  ?protein rdfs:label ?proteinName .  # Get the protein's name

  # Exclude "Uncharacterized protein" entries
  FILTER (?proteinName != "Uncharacterized protein")

  # Get the protein's full name
  ?protein up:alternativeName ?recommendedName .
  ?recommendedName up:fullName ?fullName .

  # Get the protein sequence
  ?protein up:sequence ?isoform .
  ?isoform rdf:value ?sequence .
}
  Limit 1000000
`;

const sparqlQueryCat = `
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX taxon: <http://purl.uniprot.org/taxonomy/>
PREFIX up: <http://purl.uniprot.org/core/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT DISTINCT ?taxon ?taxonName ?protein ?proteinName ?fullName ?sequence 
WHERE {
  # Find virus taxa
  ?taxon a up:Taxon .
  ?taxon rdfs:subClassOf taxon:10239 .  # Virus taxa (taxon ID 10239)
  ?taxon up:scientificName ?taxonName .  # Get the taxon's scientific name

  # Ensure the taxon has cat as host
  ?taxon up:host taxon:9685 .

  # Find proteins associated with the virus
  ?protein up:organism ?taxon .  # Protein belongs to the virus taxonomy
  ?protein rdfs:label ?proteinName .  # Get the protein's name

  # Exclude "Uncharacterized protein" entries
  FILTER (?proteinName != "Uncharacterized protein")

  # Get the protein's full name
  ?protein up:alternativeName ?recommendedName .
  ?recommendedName up:fullName ?fullName .

  # Get the protein sequence
  ?protein up:sequence ?isoform .
  ?isoform rdf:value ?sequence .
}
  Limit 1000000
`;

const sparqlQueryRat = `
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX taxon: <http://purl.uniprot.org/taxonomy/>
PREFIX up: <http://purl.uniprot.org/core/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT DISTINCT ?taxon ?taxonName ?protein ?proteinName ?fullName ?sequence 
WHERE {
  # Find virus taxa
  ?taxon a up:Taxon .
  ?taxon rdfs:subClassOf taxon:10239 .  # Virus taxa (taxon ID 10239)
  ?taxon up:scientificName ?taxonName .  # Get the taxon's scientific name

  # Ensure the taxon has rat as host
  ?taxon up:host taxon:10116 .

  # Find proteins associated with the virus
  ?protein up:organism ?taxon .  # Protein belongs to the virus taxonomy
  ?protein rdfs:label ?proteinName .  # Get the protein's name

  # Exclude "Uncharacterized protein" entries
  FILTER (?proteinName != "Uncharacterized protein")

  # Get the protein's full name
  ?protein up:alternativeName ?recommendedName .
  ?recommendedName up:fullName ?fullName .

  # Get the protein sequence
  ?protein up:sequence ?isoform .
  ?isoform rdf:value ?sequence .
}
  Limit 1000000
`;

// Array to store the dataset grouped by species
let dataSet = [];

// Define the SPARQL endpoint URL
const endpointUrl = 'https://sparql.uniprot.org/sparql';

// Function to execute the SPARQL query
async function runQuery(query, species) {
  try {
    console.log(`Sending query for ${species}...`);
    const response = await fetch(`${endpointUrl}?query=${encodeURIComponent(query)}&format=tsv`);

    if (response.ok) {
      console.log(`Query for ${species} successful, fetching data...`);
      const tsvData = await response.text();
      console.log(`Raw TSV data received for ${species}:`);
      console.log(tsvData);

      const rows = tsvData.split('\n').map(row => row.split('\t'));

      if (rows.length > 1) {
        console.log(`Rows received for ${species}:`, rows); // Log the rows to inspect the data

        const speciesData = [];

        rows.slice(1).forEach(row => {
          if (row.length >= 6) {
            const virusName = row[1];
            const taxonName = row[2];
            const proteinName = row[3];
            const sequence = row[5];
            const sequenceArray = sequence.split(/[, ]+/).filter(Boolean);

            speciesData.push({
              virus: virusName,
              taxon: taxonName,
              protein: proteinName,
              sequence: sequenceArray,
            });
          }
        });

        if (speciesData.length > 0) {
          dataSet.push({
            species,
            data: speciesData,
          });
          console.log(`Data stored for ${species}:`, speciesData);
        } else {
          console.log(`No data found for ${species}`);
        }
      } else {
        console.log(`No rows returned for ${species}.`);
      }
    } else {
      console.error(`Failed to fetch data for ${species}. Response was not OK.`);
    }
  } catch (error) {
    console.error(`Error running query for ${species}:`, error);
  }
}
// Show loading indicator
function showLoading() {
  document.getElementById("loading").style.display = "block";
}

// Hide loading indicator
function hideLoading() {
  document.getElementById("loading").style.display = "none";
}

async function fetchData() {
  showLoading(); // Show loading indicator
  try {
      await runQuery(sparqlQueryHuman, "Human");
      await runQuery(sparqlQueryRat, "Rat");
      await runQuery(sparqlQueryCat, "Cat");
      await runQuery(sparqlQueryDog, "Dog");
      console.log('Data for all species:', dataSet);
  } catch (error) {
      console.error("Error fetching data:", error);
  } finally {
      hideLoading(); // Hide loading indicator
  }
}


// Function to compare binding sites between animal and human viruses
async function compareBindingSites() {
  console.log('Fetching data for all species...');
  showLoading(); // Show loading indicator
    try {
        await fetchData();
        // Visualization and comparison logic here
        createContainer(nodes, links);
    } catch (error) {
        console.error("Error during comparison:", error);
    } finally {
        hideLoading(); // Hide loading indicator
    }

  // Fetch and keep the binding sites grouped by species for each animal
  const humanBindingSites = dataSet.filter(entry => entry.species === "Human").map(entry => entry.data).flat();
  const ratBindingSites = dataSet.filter(entry => entry.species === "Rat").map(entry => entry.data).flat();
  const catBindingSites = dataSet.filter(entry => entry.species === "Cat").map(entry => entry.data).flat();
  const dogBindingSites = dataSet.filter(entry => entry.species === "Dog").map(entry => entry.data).flat();

  console.log('Cat binding sites:', catBindingSites);
  console.log('Rat binding sites:', ratBindingSites);
  console.log('Dog binding sites:', dogBindingSites);
  try {
      // Structure the data for human and animals
      const humanData = humanBindingSites.map((entry) => ({
          species: "Human",
          ...entry
      }));
      const animalData = [
          { species: "Rat", data: ratBindingSites },
          { species: "Cat", data: catBindingSites },
          { species: "Dog", data: dogBindingSites }
      ].flatMap(animal => 
          animal.data.map(entry => ({
              species: animal.species,
              ...entry
          }))
      );
      console.log('Human data:', humanData);
      console.log('Animal data:', animalData);

      let nodes = [];
      let links = [];

      let humanNode = { id: 'human', group: 'human' };
      if (!nodes.some(node => node.id === humanNode.id)) {
          nodes.push(humanNode);
      }
      
      // Compare sequences between human and animal viruses
      animalData.forEach((animalEntry) => {
          humanData.forEach((humanEntry) => {
              const similarity = calculateSequenceSimilarity(animalEntry.sequence, humanEntry.sequence);
              if (similarity >= 90) {
                  console.log(`Similarity between ${animalEntry.virus} (${animalEntry.species}) and ${humanEntry.virus} (Human): ${similarity}%`);

                  const animalNodeId = `${animalEntry.species}`;
                  const animalVirusNodeId = `${animalEntry.species} - ${animalEntry.virus} Virus`;

                  // Add animal node (if needed)
                  if (!nodes.some(node => node.id === animalNodeId)) {
                      nodes.push({ id: animalNodeId, group: "animal" });
                  }

                  // Add animal virus node
                  if (!nodes.some(node => node.id === animalVirusNodeId)) {
                      nodes.push({ id: animalVirusNodeId, group: "animalVirus", similarity: similarity });
                  }

                  // Add link between animal and animal virus
                  links.push({ source: animalNodeId, target: animalVirusNodeId });

                  // Add link between animal virus and human
                  links.push({ source: animalVirusNodeId, target: "human" });
              }
          });
      });
      // Visualize the graph
      createContainer(nodes, links);
  } catch (error) {
      console.error("Error processing data:", error);
  }
}

// This could be a better function but we only had 4-5 weeks to learn all about this "we could do this in python ;("
// Function to calculate sequence similarity - !!!! remember to try if we can check only the begining and end of the sequence for similarity, may work better
function calculateSequenceSimilarity(seq1, seq2) {
  if (!seq1 || !seq2) return 0;

  const length = Math.min(seq1.length, seq2.length);
  let totalMatches = 0;

  for (let i = 0; i < length; i++) {
    if (seq1[i] === seq2[i]) {
      totalMatches++;
    }
  }

  const lengthDifferencePenalty = Math.abs(seq1.length - seq2.length) * 0.1; // Junk code atm but an adjustment may make this relavent
  const totalLength = Math.max(seq1.length, seq2.length) + lengthDifferencePenalty;
  
  return (totalMatches / totalLength) * 100;
}


function createContainer(nodes, links) {
    // Create the SVG container
    const width = window.innerWidth;
    const height = window.innerHeight;

    const svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height);

    // Add a group to contain all graph elements
    const container = svg.append("g");

    // Add zoom and pan functionality
    const zoom = d3.zoom().on("zoom", (event) => {
        container.attr("transform", event.transform); // Transform the group, not the SVG
    });
    svg.call(zoom);

    // Create a simulation for the graph layout with more spread between nodes
    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id).distance(200))  // Increased link distance
        .force("charge", d3.forceManyBody().strength(-1000))  // Stronger repulsion for more spread
        .force("center", d3.forceCenter(width / 2, height / 2));  // Center the graph in the container

    // Create links (edges)
    const link = container.selectAll(".link") // Use the `container` group
        .data(links)
        .enter().append("line")
        .attr("class", "link")
        .attr("stroke-width", 2)
        .attr("stroke", "#999");  // Default link color

    // Create nodes (animal viruses, human viruses, and animals)
    const node = container.selectAll(".node") // Use the `container` group
        .data(nodes)
        .enter().append("circle")
        .attr("class", "node")
        .attr("r", 15)  // Node radius
        .attr("fill", d => {
            if (d.group === 'animalVirus') {
                return getColorBasedOnPercentage(d.similarity);
            }
            if (d.group === 'animal') return 'purple'; //aniamls always get purple
            return 'blue'; //everyhting that is not animal gets blue
        })
        .call(d3.drag()
            .on("start", dragStarted)
            .on("drag", dragged)
            .on("end", dragEnded));
    // Add labels for animal and human nodes
    const labels = container.selectAll(".label")
        .data(nodes)
        .enter().append("text")
        .attr("class", "label")
        .attr("font-size", "12px")
        .attr("fill", "#333")
        .attr("dx", 20) // Offset the label horizontally
        .attr("dy", 5)  // Align vertically to the node center
        .text(d => (d.group === 'animal' || d.group === 'human') ? d.id : ""); // Add labels only for animals and humans

    // Add labels to the nodes
    node.append("title")
        .text(d => `${d.id} ${d.similarity ? d.similarity + "%" : ''}`);  // Show id and similarity when you hover over it

    // Update the positions of the links and nodes on each tick of the simulation
    simulation.on("tick", () => {
        link.attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node.attr("cx", d => d.x)
            .attr("cy", d => d.y);
            
        labels.attr("x", d => d.x)
        .attr("y", d => d.y);
    });

    // Dragging functions
    function dragStarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
    }

    function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
    }

    function dragEnded(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
    }
}

function getColorBasedOnPercentage(percentage) {
    if (percentage < 0) percentage = 0; // it's needed trust me bro
    if (percentage > 100) percentage = 100; // it's needed trust me bro
    console.log(percentage)
    return d3.scaleLinear()
        .domain([0, 100])  
        .range(["green", "red"])(percentage);  
}
// Call the comparison function to test it with fake data
compareBindingSites();
