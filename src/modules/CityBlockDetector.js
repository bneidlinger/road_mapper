/**
 * Detects city blocks formed by road networks using computational geometry
 */
export class CityBlockDetector {
    constructor(elementManager) {
        this.elementManager = elementManager;
    }

    /**
     * Find all city blocks (polygons) formed by roads
     */
    detectBlocks() {
        const roads = this.elementManager.getRoads();
        const intersections = this.elementManager.getIntersections();
        
        // Build a graph of road network
        const graph = this.buildRoadGraph(roads, intersections);
        
        // Find all cycles in the graph (which represent blocks)
        const cycles = this.findAllCycles(graph);
        
        // Convert cycles to polygon blocks
        const blocks = cycles.map(cycle => this.cycleToBlock(cycle, graph));
        
        // Filter out invalid or overlapping blocks
        return this.filterValidBlocks(blocks);
    }

    /**
     * Build a graph representation of the road network
     */
    buildRoadGraph(roads, intersections) {
        const graph = {
            nodes: new Map(), // intersection id -> {x, y, edges: []}
            edges: new Map()  // edge id -> {from, to, road}
        };

        // Add all intersections as nodes
        intersections.forEach(intersection => {
            graph.nodes.set(intersection.id, {
                id: intersection.id,
                x: intersection.x,
                y: intersection.y,
                edges: []
            });
        });

        // Process roads to create edges between intersections
        roads.forEach(road => {
            const endpoints = this.findRoadEndpoints(road, intersections);
            if (endpoints.start && endpoints.end) {
                const edgeId = `${road.id}_edge`;
                graph.edges.set(edgeId, {
                    id: edgeId,
                    from: endpoints.start.id,
                    to: endpoints.end.id,
                    road: road
                });

                // Add edge references to nodes
                graph.nodes.get(endpoints.start.id).edges.push(edgeId);
                graph.nodes.get(endpoints.end.id).edges.push(edgeId);
            }
        });

        return graph;
    }

    /**
     * Find which intersections a road connects
     */
    findRoadEndpoints(road, intersections) {
        const firstPoint = road.points[0];
        const lastPoint = road.points[road.points.length - 1];
        const tolerance = 10;

        let start = null;
        let end = null;

        intersections.forEach(intersection => {
            const distToFirst = Math.sqrt(
                Math.pow(intersection.x - firstPoint.x, 2) + 
                Math.pow(intersection.y - firstPoint.y, 2)
            );
            const distToLast = Math.sqrt(
                Math.pow(intersection.x - lastPoint.x, 2) + 
                Math.pow(intersection.y - lastPoint.y, 2)
            );

            if (distToFirst < tolerance) {
                start = intersection;
            }
            if (distToLast < tolerance) {
                end = intersection;
            }
        });

        return { start, end };
    }

    /**
     * Find all simple cycles in the graph using DFS
     */
    findAllCycles(graph) {
        const cycles = [];
        const visited = new Set();
        const recursionStack = new Set();
        const paths = new Map();

        // Helper function for DFS
        const dfs = (nodeId, startId, path = []) => {
            visited.add(nodeId);
            recursionStack.add(nodeId);
            path.push(nodeId);

            const node = graph.nodes.get(nodeId);
            
            // Check all adjacent nodes
            node.edges.forEach(edgeId => {
                const edge = graph.edges.get(edgeId);
                const nextNodeId = edge.from === nodeId ? edge.to : edge.from;

                // Found a cycle back to start
                if (nextNodeId === startId && path.length > 2) {
                    // Only keep the smallest cycle for each set of nodes
                    const cycleKey = [...path].sort().join('-');
                    if (!paths.has(cycleKey) || paths.get(cycleKey).length > path.length) {
                        paths.set(cycleKey, [...path]);
                    }
                } else if (!recursionStack.has(nextNodeId) && path.length < 8) {
                    // Continue DFS (limit depth to avoid very large cycles)
                    dfs(nextNodeId, startId, path);
                }
            });

            path.pop();
            recursionStack.delete(nodeId);
        };

        // Start DFS from each unvisited node
        graph.nodes.forEach((node, nodeId) => {
            if (!visited.has(nodeId)) {
                dfs(nodeId, nodeId);
            }
        });

        // Convert paths to cycles
        paths.forEach(path => {
            if (path.length >= 3 && path.length <= 6) { // Only keep reasonable sized blocks
                cycles.push(path);
            }
        });

        return cycles;
    }

    /**
     * Convert a cycle of node IDs to a polygon block
     */
    cycleToBlock(cycle, graph) {
        const points = cycle.map(nodeId => {
            const node = graph.nodes.get(nodeId);
            return { x: node.x, y: node.y };
        });

        return {
            points: points,
            bounds: this.calculateBounds(points),
            area: this.calculateArea(points)
        };
    }

    /**
     * Calculate bounds of a polygon
     */
    calculateBounds(points) {
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;

        points.forEach(point => {
            minX = Math.min(minX, point.x);
            minY = Math.min(minY, point.y);
            maxX = Math.max(maxX, point.x);
            maxY = Math.max(maxY, point.y);
        });

        return {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY
        };
    }

    /**
     * Calculate area of a polygon using shoelace formula
     */
    calculateArea(points) {
        let area = 0;
        const n = points.length;

        for (let i = 0; i < n; i++) {
            const j = (i + 1) % n;
            area += points[i].x * points[j].y;
            area -= points[j].x * points[i].y;
        }

        return Math.abs(area / 2);
    }

    /**
     * Filter out invalid or tiny blocks
     */
    filterValidBlocks(blocks) {
        const minArea = 1000; // Minimum block area
        
        return blocks.filter(block => {
            // Check minimum area
            if (block.area < minArea) return false;
            
            // Check if block is reasonably shaped (not too elongated)
            const aspectRatio = block.bounds.width / block.bounds.height;
            if (aspectRatio > 5 || aspectRatio < 0.2) return false;
            
            return true;
        });
    }

    /**
     * Check if a point is inside a polygon
     */
    pointInPolygon(point, polygon) {
        let inside = false;
        const n = polygon.length;

        for (let i = 0, j = n - 1; i < n; j = i++) {
            const xi = polygon[i].x, yi = polygon[i].y;
            const xj = polygon[j].x, yj = polygon[j].y;

            const intersect = ((yi > point.y) !== (yj > point.y))
                && (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
            
            if (intersect) inside = !inside;
        }

        return inside;
    }
}