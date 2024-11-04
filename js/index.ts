import { instance } from "@viz-js/viz";

type Vertices = { [key: string]: number };

let counter = 0;


const createFieldColumn = (
    inputName: string,
    labelInnerText: string,
    inputType: string,
    suffix: string,
) => {
    const column = document.createElement("div");
    column.classList.add("col");

    const label = document.createElement("label");
    label.innerText = labelInnerText;
    label.setAttribute("for",`${name}${suffix}`);

    const input = document.createElement("input");
    input.type = inputType;
    input.classList.add("form-control");
    input.required = true;
    input.name = inputName+suffix;

    column.appendChild(label);
    column.appendChild(input);

    return column;
}


const addFormRow = () => {
    const row = document.createElement("div");
    row.classList.add("row", "row-cols-4", "mb-3");
    row.id = (`row-${counter}`);

    const startcol = createFieldColumn("startnode","Start Node", "text", `-${counter}`);
    const endcol = createFieldColumn("endnode","End Node", "text",`-${counter}`);
    const weightcol = createFieldColumn("weight","Weight", "number",`-${counter}`);
    
    const deletecol = document.createElement("div");
    deletecol.classList.add("col", "align-self-end");

    const button = document.createElement("button");
    button.type = "button";
    button.id = counter.toString();
    button.classList.add("btn", "btn-light");
    button.innerHTML = '<i class="fa-solid fa-circle-minus"></i>';
    button.onclick = () => removeFormRow(button.id);
    deletecol.append(button);

    row.append(startcol,endcol,weightcol,deletecol);

    document.getElementById("nodelist")?.querySelector(".nodelist-nodes").appendChild(row);
    counter+=1;
}


const removeFormRow = (id: string) => {
    const row = document.getElementById(`row-${id}`);
    row?.remove();
}

const dijkstra = (
    edges: any[][],
    vertices: Vertices,
    source: number,
    dot_graph: string[]
) => {

    const distance: number[] = [];
    const previous: any[] = [];
    const queue: number[] = [];

    Object.values(vertices).forEach((v) => {
        distance[v] = Infinity;
        previous[v] = undefined;
        queue.push(v);
    });

    distance[source] = 0;

    const visited_vertices: [vertex: number, color:string, style:string][] = [];
    
    
    while(queue.length != 0) {
        const visited_edges: [[start:number,end:number],color:string][] = [];
        const u = queue.reduce((node,min)=> distance[node] < distance[min] ? node : min);
        queue.splice(queue.indexOf(u),1);
        visited_vertices.push([u,"lightgray","filled"]);

        const neighbors = queue.filter((v)=> edges[u][v]);
        //TODO:

        let chosenvertex: number = 0;
        neighbors.forEach((v) => {

            // 
            const alt = distance[u] + edges[u][v];
            if (alt<distance[v]) {
                distance[v] = alt;
                previous[v] = u;
                visited_edges.push([[u,v],"blue"]);
            }
        })

        dot_graph.push(createGraph(edges, vertices,visited_vertices,visited_edges));

    }
    const terminal = document.getElementById("terminal");
    terminal.innerHTML = '';
    distance.forEach((distance,index)=> {
        terminal!.innerHTML+=`<span class="row p">${Object.keys(vertices).find(k=>vertices[k as keyof object]==index)}: ${distance}</span>`
    }
    );
    terminal!.innerHTML += `<span class="row p">Paths:</span>`;
    console.log(previous);
    previous.forEach(((prev_node,index)=>{
        terminal!.innerHTML+=`<span class="row p">${Object.keys(vertices).find(k=>vertices[k as keyof object]==index)}: ${printPath(`${index}`, previous, vertices)}</span>`
    }));
}

const printPath = (target: string, previous: string[], vertices:object):string => {
    if (target == undefined) {
        return "";
    } else {
        return printPath(previous[target as keyof object], previous, vertices) + " => " + Object.keys(vertices).find(k=>vertices[k as keyof object]==target);
    }
}


/**
 * @param { number[][] } edges - the adjacency matrix of the graph.
 * @param { Vertices } vertices - the vertices of the graph.
 * @param { number[] } highlightVertex - the list of nodes / vertices that needs to be colored.
 * @param { [number, number][] } highlightEdges - the list of edges that needs to be colored.
 * @returns { void }
 */
const createGraph = (
    edges: number[][],
    vertices: Vertices,
    highlightVertex: [vertex: number, color: string, style: string][],
    highlightEdges: [edge: [number, number], color: string][],
) => {
    const render_string: string[] = [
        "graph G{",
    ];
    
    Object.keys(vertices).forEach((value) => {
        const id = vertices[value];

        let shouldBeHighlighted: boolean = false;
        let color: string | null = null;
        let style: string | null = null;
        for (const [vertex, chosenColor, chosenStyle] of highlightVertex) {
            if (vertex == id) {
                shouldBeHighlighted = true;
                color = chosenColor;
                style = chosenStyle;
                break;
            }
        }

        const message = `${id}[shape=circle label=${value}`
            + (shouldBeHighlighted ? ` color="${color}" style="${style}"` : ``)
            + ']';
        
        render_string.push(message);
    });

    // added :: number -> number -> boolean
    const added: {[key: number]: {[key: number]: boolean}} = {};
    edges.forEach((row, startnode)=>{
        row.forEach((node, endnode) => {
            const weight = edges[startnode][endnode];

            let shouldBeHighlighted: boolean = false;
            let color: string | null = null;
            for (const [edge, chosenColor] of highlightEdges) {
                if (edge[0] == startnode && edge[1] == endnode ||
                    edge[0] == endnode && edge[1] == startnode) {
                    shouldBeHighlighted = true;
                    color = chosenColor;
                    break;
                }
            }

            // [hasBeenAdded] is necessary as the symmetric nature of the adjacency matrix
            // would cause [a -- b ; b -- a] duplication.
            const hasBeenAdded = added[startnode]?.[endnode] || added[endnode]?.[startnode];
            if (!hasBeenAdded && weight) {
                render_string.push(`${startnode}--${endnode}[label=${weight}`
                    + (shouldBeHighlighted ? ` color=${color}` : ``)
                    + `]`);
                
                (added[startnode] ??= {})[endnode] = true;
                (added[endnode] ??= {})[startnode] = true;
            }
        });
    });

    render_string.push("}");

    console.log(render_string.join("\n"));
    return render_string.join("\n");
}

let step = 0;

document.getElementById("addrow")?.addEventListener("click", addFormRow);

document.getElementById("previous")?.addEventListener("click", () => {
    step -= 1;

    const previousSvg = document.getElementById(`svg-${step + 1}`);
    if (previousSvg != undefined) {
        previousSvg.classList.add("d-none");
    }
    
    const activeSvg = document.getElementById(`svg-${step}`);
    if (activeSvg != undefined) {
        activeSvg.classList.remove("d-none");
    }
    
});

document.getElementById("next")?.addEventListener("click", () => {
    step += 1;

    const previousSvg = document.getElementById(`svg-${step - 1}`);
    if (previousSvg != undefined) {
        previousSvg.classList.add("d-none");
    }
    
    const activeSvg = document.getElementById(`svg-${step}`);
    if (activeSvg != undefined) {
        activeSvg.classList.remove("d-none");
    }
    
});

document.getElementById("graphform")?.addEventListener("submit", function(event) {
    event.preventDefault();
    const rows = document.querySelectorAll('[id^=row]');
    const vertices: {[key:string]: number} = {};
    const dot_graphs: string[] = [];

    rows.forEach(row => {
        const startNode = (row.querySelector(`input[name^="startnode"`) as HTMLInputElement)?.value;
        const endNode = (row.querySelector(`input[name^="endnode"`) as HTMLInputElement)?.value;

        if (startNode in vertices === false) {
            vertices[startNode as keyof object] = Object.keys(vertices).length
        }
        if (endNode in vertices === false) {
            vertices[endNode] = Object.keys(vertices).length
        }
    });

    const edges: number[][] = Array.from({ length: Object.keys(vertices).length }, () => Array(Object.keys(vertices).length).fill(null));

    rows.forEach(row=>{
        const startNode = (row.querySelector(`input[name^="startnode"`) as HTMLInputElement)?.value;
        const endNode = (row.querySelector(`input[name^="endnode"`) as HTMLInputElement)?.value;
        const weight = parseInt((row.querySelector(`input[name^="weight"`) as HTMLInputElement)?.value);

        edges[vertices[startNode]][vertices[endNode]] = weight;
        edges[vertices[endNode]][vertices[startNode]] = weight; // symmetric dapat
    });

    const source = vertices[((document.getElementById("sourcenode") as HTMLInputElement)?.value)];

    /// 
    dot_graphs.push(createGraph(edges, vertices, [], []));
    dijkstra(edges, vertices, source, dot_graphs);

    const mediacontainer = document.getElementById("mediacontainer");
    mediacontainer.innerHTML = '';
    const imageid = parseInt(mediacontainer.getAttribute("image"));
    instance().then(viz => {
        for (let i = 0; i < dot_graphs.length; ++i) {
            const dot = dot_graphs[i];
            const svg = viz.renderSVGElement(dot);
            const holder = document.createElement("div");
            holder.id = `svg-${i}`;
            holder.classList.add("d-none","child");
            holder.appendChild(svg);            
            mediacontainer.appendChild(holder);
        }

        const firstSvg = document.getElementById(`svg-0`);
        firstSvg.classList.remove("d-none");
    });
});