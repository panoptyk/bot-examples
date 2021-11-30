import { Util } from "@panoptyk/core";
import { Server, MemorySaveLoadDatabase } from "@panoptyk/server";

Util.AppContext.db = new MemorySaveLoadDatabase();

const myServer = new Server();

myServer.start();
