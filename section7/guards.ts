type FileSource = { path: string };
const fileSource: FileSource = { path: "path/to/file.txt" };

type DBSource = { connectionUrl: string };
const dbSource: DBSource = { connectionUrl: "localhost:5432" };

type Source = FileSource | DBSource;

function loadData(source: Source) {}
