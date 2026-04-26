import {z} from "zod";
import fs from "node:fs"

const dataSchema = z.string();
const content = fs.readFileSync("data.json", "utf-8");

dataSchema.parse(content);