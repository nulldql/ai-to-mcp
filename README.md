# ai-to-mcp

turns an openapi spec or a file of typescript functions into a real, working mcp server. no manual wiring, no reading through docs to figure out the sdk's api shape, just point it at something and get a server back.

```bash
ai-to-mcp https://myapi.com/openapi.json
```

```bash
ai-to-mcp ./tools/weather.ts
```

either one generates a full project: package.json, tsconfig, a readme, and one file per tool, ready to install and build.

## why this exists

mcp servers are usually written by hand, one tool at a time, each with its own zod schema and its own handler. if you already have an openapi spec or a file of plain functions, most of that is just a mechanical translation. this does the translation part so you can spend time on the parts that actually need a person.

## install

this hasn't been published to npm yet, so for now clone it and run it directly:

```bash
git clone https://github.com/TheCEO3-rgb/ai-to-mcp.git
cd ai-to-mcp
npm install
npm run build
node dist/cli.js <input>
```

once it's published, the plan is for `npx ai-to-mcp <input>` to work the same way without cloning anything.

## usage

```bash
ai-to-mcp https://petstore3.swagger.io/api/v3/openapi.json
```

```bash
ai-to-mcp ./openapi.yaml --out my-api-mcp
```

```bash
ai-to-mcp ./tools/weather.ts --name weather-mcp
```

after generating, the server still needs its own install and build before it can run:

```bash
cd weather-mcp
npm install
npm run build
node dist/index.js
```

there's a real example you can try right now in `test-fixtures/weather.ts`.

### options

```
--out <dir>     output directory for the generated server (default: derived from the input)
--name <name>   name for the generated server (default: derived from the input)
--help          show usage
--version       print the installed version
```

## how it decides what to generate

**a url ending in `.json`, `.yaml`, or `.yml`, or a local file with one of those extensions**, gets treated as an openapi spec. every operation becomes a tool. path, query, and header parameters become typed arguments. a json request body gets flattened into the tool's arguments too, so calling the tool doesn't mean nesting everything under a `body` key. `$ref` pointers get resolved against the rest of the document, including nested objects and arrays.

if the spec declares an api key or bearer auth scheme, that gets wired into the generated client automatically, reading the actual key from an environment variable at runtime. oauth2 isn't supported yet, since it needs a real token exchange flow rather than just forwarding a static value.

**a local `.ts` file** gets scanned for exported functions using the real typescript compiler, not just pattern matching on the text. each exported function becomes a tool, using its actual parameter types to build the schema and its jsdoc comment (the first line of it) as the tool's description. the original file gets copied into the generated project and the tool just calls the real function directly, no http involved.

destructured parameters (`function foo({ a, b }: Args)`) aren't supported yet. give the function plain named parameters instead.

## what gets generated

```
my-server/
  package.json
  tsconfig.json
  README.md
  src/
    index.ts
    tools/
      tool_one.ts
      tool_two.ts
    client.ts          (openapi mode only)
    source/
      original.ts       (typescript mode only, your file copied in)
```

every tool file is plain, readable typescript. nothing about it is a black box, you can open any generated file and see exactly what it does.

## development

```bash
git clone https://github.com/TheCEO3-rgb/ai-to-mcp.git
cd ai-to-mcp
npm install
npm test
```

`npm test` builds the project and runs the full suite with node's built-in test runner. most of it is unit tests for schema conversion, operation extraction, and function extraction, plus a set of tests that actually run the generated client code against a real local http server to check the request it sends is correct, not just that it compiles.

this was tested against a real public api (the swagger petstore demo) during development, not just fixtures, and caught two real bugs along the way: a relative server url in the spec not getting resolved against the spec's own address, and a url-joining bug that silently dropped a base url's path prefix when the request path started with a slash. both are now covered by tests so they can't come back unnoticed.

## license

mit
