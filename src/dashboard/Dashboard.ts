import { Dominion } from "../App";

import express = require("express");
import { Noco } from "nocodb";

export async function Dashboard(dominion: Dominion) {
    dominion.logger.info("dashboard is initializing...");

    try {
        const app = express();
        const httpServer = app.listen(dominion.options.dashboardPort);

        const noco = Noco._this = new Noco();
        noco.config.title = "Dominion";
        noco.config.language = "ts";
        
        const router = await noco.init({}, httpServer, app);

        app.use(router);

        dominion.logger.info("dashboard is running on http://localhost:%d", dominion.options.dashboardPort);
    } catch(e) {
        dominion.logger.error("an exception ocurred while initializing the dashboard:\n%O", e);
    }
}