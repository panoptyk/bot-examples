import { Util } from "@panoptyk/core";
import { Server, MemorySaveLoadDatabase } from "@panoptyk/server";

Util.inject.db = new MemorySaveLoadDatabase();

const myServer = new Server();

myServer.start();
