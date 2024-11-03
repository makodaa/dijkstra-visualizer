import {instance} from "@viz-js/viz";
let counter = 0;


const createFieldColumn = (inputName: string, labelInnerText:string, inputType:string, suffix: string) => {
    const column = document.createElement("div");
    column.classList.add("col");

    const label = document.createElement("label");
    label.innerText = labelInnerText;
    label.setAttribute("for",`${name}${suffix}`);

    const input = document.createElement("input");
    input.type = "text";
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

    document.getElementById("nodelist")?.appendChild(row);
    counter+=1;
}


const removeFormRow = (id: string) => {
    const row = document.getElementById(`row-${id}`);
    row?.remove();
}

const dijkstra = (edges: any[][], vertices: object, source: number) => {

    const distance: number[] = [];
    const previous: any[] = [];
    const queue: number[] = [];

    Object.values(vertices).forEach((v) => {
        distance[v] = Infinity;
        previous[v] = undefined;
        queue.push(v);
    });

    distance[source] = 0;

    while(queue.length != 0) {
        // search queue for shortest distance
        const u = queue.reduce((node,min)=> distance[node] < distance[min] ? node : min);
        queue.splice(queue.indexOf(u),1);

        const neighbors = queue.filter((v)=> edges[u][v]);
        neighbors.forEach((v) => {
            const alt = distance[u] + edges[u][v];
            if (alt<distance[v]) {
                distance[v] = alt;
                previous[v] = u;
            }
        })
    }
    const terminal = document.getElementById("terminal");
    
    distance.forEach((distance,index)=> {
        terminal!.innerHTML+=`<span class="row p">${Object.keys(vertices).find(k=>vertices[k as keyof object]==index)}: ${distance}</span>`
    }
    );
    terminal!.innerHTML+=`<span class="row p">Paths:</span>`
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

const createGraph = (edges: number[][], vertices: object, highlight: object) => {
    const render_string: string[] = [
        "graph G{",
    ];
    // A:1

    Object.keys(vertices).forEach((value)=>{
        render_string.push(`${vertices[value as keyof object]}[shape=circle label=${value}]`);
    });


    edges.forEach((row, startnode)=>{
        row.forEach((node, endnode)=> {
            if (edges[startnode][endnode]) {
                render_string.push(`${startnode}--${endnode}[label=${edges[startnode][endnode]}]`);
            }
        });
    });

    render_string.push("}");
    return render_string.join("\n");
}

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
    });

    const source = vertices[((document.getElementById("sourcenode") as HTMLInputElement)?.value)];
    dot_graphs.push(createGraph(edges,vertices, {}));
    dijkstra(edges, vertices, source);

    const mediacontainer = document.getElementById("mediacontainer");
    instance().then(viz => {
        const svg = viz.renderSVGElement("digraph { a -> b }");
        document.getElementById("media")!.appendChild(svg);
    });
});