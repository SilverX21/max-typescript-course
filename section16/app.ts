import { z } from "zod";
import fs from "node:fs";

const dataSchema = z.object({
  title: z.string(), // This is a string
  id: z.number(), // This is a number
  values: z.array(z.union([z.string(), z.number()])), // This is an array of strings or numbers
});

// This is a TypeScript type that is inferred from the Zod schema. It will have the same structure as the schema, but with the types of the properties inferred from the Zod definitions.
type Data = z.infer<typeof dataSchema>;

function output(data: Data) {
  console.log(data);
}

const content = JSON.parse(fs.readFileSync("data.json", "utf-8").toString());

var parsedData = dataSchema.parse(content);
output(parsedData);
