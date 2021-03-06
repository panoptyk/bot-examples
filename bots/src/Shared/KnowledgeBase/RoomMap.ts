import { Room } from "@panoptyk/core";

class RoomMap {
    //#region Singleton Patten
    private static _instance: RoomMap;

    public static get instance(): RoomMap {
        if (!RoomMap._instance) {
            RoomMap._instance = new RoomMap();
        }
        return RoomMap._instance;
    }

    private constructor() {}
    //#endregion

    private nodes: Set<Room> = new Set<Room>();
    private edges: Map<Room, Set<Room>> = new Map<Room, Set<Room>>();

    public addRoom(room: Room): void {
        this.nodes.add(room);
        if (!this.edges.has(room)) {
            this.edges.set(room, new Set());
        }
    }

    public addConnection(room1: Room, room2: Room): void {
        if (!this.nodes.has(room1) || !this.nodes.has(room2)) {
            return;
        }

        if (this.edges.has(room1)) {
            this.edges.get(room1).add(room2);
        }
    }

    public checkForUnexploredRooms(): Room[] {
        return [...this.nodes].filter((x) => this.edges.get(x).size <= 0);
    }

    public findDisconnectedGraphs(): Room[] {
        const startPoints: Set<Room> = new Set<Room>();
        const visited: Set<Room> = new Set<Room>();
        const toVisit: Set<Room> = new Set<Room>();
        let setDifference = new Set(
            [...this.nodes].filter((x) => !visited.has(x))
        );

        while (visited.size < this.nodes.size) {
            const room: Room = setDifference.values[0];
            startPoints.add(room);
            toVisit.add(room);

            while (toVisit.size > 0) {
                const r: Room = toVisit.values[0];
                toVisit.delete(r);
                visited.add(r);
                this.edges.get(r).forEach((element) => {
                    if (!visited.has(element)) {
                        toVisit.add(element);
                    }
                });
            }

            setDifference = new Set(
                [...this.nodes].filter((x) => !visited.has(x))
            );
        }

        return Array.from(startPoints);
    }

    public findPath(start: Room, end: Room): Room[] {
        const openSet: Set<Room> = new Set<Room>();
        openSet.add(start);
        const cameFrom: Map<Room, Room> = new Map<Room, Room>();
        const gScore: Map<Room, number> = new Map<Room, number>();
        const fScore: Map<Room, number> = new Map<Room, number>();
        let current: Room;

        this.nodes.forEach((room) => {
            gScore.set(room, Infinity);
            fScore.set(room, Infinity);
        });

        fScore.set(start, 0);
        gScore.set(start, 0);

        while (openSet.size > 0) {
            current = this.minFScore(fScore, openSet);
            if (current === end) {
                return this.reconstruct(cameFrom, current, start);
            }
            openSet.delete(current);
            this.edges.get(current).forEach((neighbor) => {
                const tempG = gScore.get(current) + 1;
                if (tempG < gScore.get(neighbor)) {
                    cameFrom.set(neighbor, current);
                    gScore.set(neighbor, tempG);
                    fScore.set(neighbor, gScore.get(neighbor));
                    if (!openSet.has(neighbor)) {
                        openSet.add(neighbor);
                    }
                }
            });
        }
        return undefined;
    }

    private reconstruct(
        cameFrom: Map<Room, Room>,
        current: Room,
        start: Room
    ): Room[] {
        const totalPath = new Array<Room>();
        totalPath.push(current);
        while (current !== start) {
            current = cameFrom.get(current);
            totalPath.push(current);
        }
        totalPath.reverse();
        return totalPath.slice(1);
    }

    private minFScore(fScore: Map<Room, number>, openSet: Set<Room>): Room {
        let min: Room = [...openSet][0];

        openSet.forEach((room) => {
            if (fScore.get(room) < fScore.get(min)) {
                min = room;
            }
        });
        return min;
    }
}

export { RoomMap };
export default RoomMap.instance;
