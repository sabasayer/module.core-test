import { authModule } from "./configurations/module";
import { AuthController} from "./auth";
import { SessionStorageCache } from "@sabasayer/module.core";

const cache = authModule.resolveCache(SessionStorageCache);
const controller = authModule.resolveController(AuthController);
console.log("index", cache, controller?.cache);
