import express, { Application } from "express"
import { configDotenv } from "dotenv"
import { connectDB } from "./Lib/Utils/Connection"
import Route from "./Routes/Index"
import logger from "morgan"
import cors from "cors"
import path from "path"

configDotenv()

const app: Application = express()
const port = process.env.PORT ?? 3000

connectDB()
app.use(cors())

app.use(logger("dev"))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use("/api/v1", Route)

app.use(express.static(path.join(__dirname, "../dist")))

app.use(function (req, res) {
	res.sendFile(path.join(__dirname, "../dist", "index.html"))
})

app.listen(port, () => {
	console.log(`Server is running on port http://127.0.0.1:${port}`)
})
