import express, { type Express } from "express";
import cors from "cors";
import router from "./routes";

const app: Express = express();

app.use((req: any, res: any, next: any) => {
  next();
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;
