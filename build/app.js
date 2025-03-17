"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = require("dotenv");
const Connection_1 = require("./Lib/Utils/Connection");
const Index_1 = __importDefault(require("./Routes/Index"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
(0, dotenv_1.configDotenv)();
const app = (0, express_1.default)();
const port = (_a = process.env.PORT) !== null && _a !== void 0 ? _a : 3000;
(0, Connection_1.connectDB)();
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use("/api/v1", Index_1.default);
app.use(express_1.default.static(path_1.default.join(__dirname, "../dist")));
app.use(function (req, res) {
    res.sendFile(path_1.default.join(__dirname, "../dist", "index.html"));
});
app.listen(port, () => {
    console.log(`Server is running on port http://127.0.0.1:${port}`);
});
