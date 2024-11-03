"use strict";
var _a;
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const viz_1 = __importDefault(require("@viz-js/viz"));
var counter = 0;
var createFieldColumn = function (inputName, labelInnerText, inputType, suffix) {
    var column = document.createElement("div");
    column.classList.add("col");
    var label = document.createElement("label");
    label.innerText = labelInnerText;
    label.setAttribute("for", "".concat(name).concat(suffix));
    var input = document.createElement("input");
    input.type = "text";
    input.classList.add("form-control");
    input.required = true;
    input.name = inputName + suffix;
    column.appendChild(label);
    column.appendChild(input);
    return column;
};
var addFormRow = function () {
    var _a;
    var row = document.createElement("div");
    row.classList.add("row", "row-cols-4", "mb-3");
    row.id = ("row-".concat(counter));
    var startcol = createFieldColumn("startnode", "Start Node", "text", "-".concat(counter));
    var endcol = createFieldColumn("endnode", "End Node", "text", "-".concat(counter));
    var weightcol = createFieldColumn("weight", "Weight", "number", "-".concat(counter));
    var deletecol = document.createElement("div");
    deletecol.classList.add("col", "align-self-end");
    var button = document.createElement("button");
    button.type = "button";
    button.id = counter.toString();
    button.classList.add("btn", "btn-light");
    button.innerHTML = '<i class="fa-solid fa-circle-minus"></i>';
    button.onclick = function () { return removeFormRow(button.id); };
    deletecol.append(button);
    row.append(startcol, endcol, weightcol, deletecol);
    (_a = document.getElementById("nodelist")) === null || _a === void 0 ? void 0 : _a.appendChild(row);
    counter += 1;
};
var removeFormRow = function (id) {
    var row = document.getElementById("row-".concat(id));
    row === null || row === void 0 ? void 0 : row.remove();
};
var dijkstra = function (edges, vertices, source) {
    var distance = [];
    var previous = [];
    var queue = [];
    Object.values(vertices).forEach(function (v) {
        distance[v] = Infinity;
        previous[v] = undefined;
        queue.push(v);
    });
    distance[source] = 0;
    var _loop_1 = function () {
        // search queue for shortest distance
        var u = queue.reduce(function (node, min) { return distance[node] < distance[min] ? node : min; });
        queue.splice(queue.indexOf(u), 1);
        var neighbors = queue.filter(function (v) { return edges[u][v]; });
        neighbors.forEach(function (v) {
            var alt = distance[u] + edges[u][v];
            if (alt < distance[v]) {
                distance[v] = alt;
                previous[v] = u;
            }
        });
    };
    while (queue.length != 0) {
        _loop_1();
    }
    var terminal = document.getElementById("terminal");
    distance.forEach(function (distance, index) {
        terminal.innerHTML += "<span class=\"row p\">".concat(Object.keys(vertices).find(function (k) { return vertices[k] == index; }), ": ").concat(distance, "</span>");
    });
    terminal.innerHTML += "<span class=\"row p\">Paths:</span>";
    console.log(previous);
    previous.forEach((function (prev_node, index) {
        terminal.innerHTML += "<span class=\"row p\">".concat(Object.keys(vertices).find(function (k) { return vertices[k] == index; }), ": ").concat(printPath("".concat(index), previous, vertices), "</span>");
    }));
};
var printPath = function (target, previous, vertices) {
    if (target == undefined) {
        return "";
    }
    else {
        return printPath(previous[target], previous, vertices) + " => " + Object.keys(vertices).find(function (k) { return vertices[k] == target; });
    }
};
var createGraph = function (edges, vertices, highlight) {
    var render_string = [
        "graph G{",
    ];
    // A:1
    Object.keys(vertices).forEach(function (value) {
        render_string.push("".concat(vertices[value], "[shape=circle label=").concat(value, "]"));
    });
    edges.forEach(function (row, startnode) {
        row.forEach(function (node, endnode) {
            if (edges[startnode][endnode]) {
                render_string.push("".concat(startnode, "--").concat(endnode, "[label=").concat(edges[startnode][endnode], "]"));
            }
        });
    });
    render_string.push("}");
    return render_string.join("\n");
};
(_a = document.getElementById("graphform")) === null || _a === void 0 ? void 0 : _a.addEventListener("submit", function (event) {
    var _a;
    event.preventDefault();
    var rows = document.querySelectorAll('[id^=row]');
    var vertices = {};
    var dot_graphs = [];
    rows.forEach(function (row) {
        var _a, _b;
        var startNode = (_a = row.querySelector("input[name^=\"startnode\"")) === null || _a === void 0 ? void 0 : _a.value;
        var endNode = (_b = row.querySelector("input[name^=\"endnode\"")) === null || _b === void 0 ? void 0 : _b.value;
        if (startNode in vertices === false) {
            vertices[startNode] = Object.keys(vertices).length;
        }
        if (endNode in vertices === false) {
            vertices[endNode] = Object.keys(vertices).length;
        }
    });
    var edges = Array.from({ length: Object.keys(vertices).length }, function () { return Array(Object.keys(vertices).length).fill(null); });
    rows.forEach(function (row) {
        var _a, _b, _c;
        var startNode = (_a = row.querySelector("input[name^=\"startnode\"")) === null || _a === void 0 ? void 0 : _a.value;
        var endNode = (_b = row.querySelector("input[name^=\"endnode\"")) === null || _b === void 0 ? void 0 : _b.value;
        var weight = parseInt((_c = row.querySelector("input[name^=\"weight\"")) === null || _c === void 0 ? void 0 : _c.value);
        edges[vertices[startNode]][vertices[endNode]] = weight;
    });
    var source = vertices[((_a = document.getElementById("sourcenode")) === null || _a === void 0 ? void 0 : _a.value)];
    dot_graphs.push(createGraph(edges, vertices, {}));
    dijkstra(edges, vertices, source);
    var mediacontainer = document.getElementById("mediacontainer");
    (0, viz_1.instance)().then(function (viz) {
        var svg = viz.renderSVGElement("digraph { a -> b }");
        document.getElementById("media").appendChild(svg);
    });
});
