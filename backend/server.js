const app = require("./index")
const mongoDBConnect = require("../backend/config/db");
const { startHealthScheduler } = require("./src/services/systemHealth.service");

mongoDBConnect();
app.listen(3000,() => {
    console.log("Server is running on 3000");
    startHealthScheduler(5 * 60 * 1000);
})