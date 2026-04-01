/**
 * Babel config for Jest (CommonJS format required).
 * The custom plugin transforms `import.meta` → `{ env: process.env }`
 * so Vite-style env references work in the Node/jsdom test environment.
 */

const importMetaPlugin = ({ types: t }) => ({
  visitor: {
    MetaProperty(path) {
      if (
        path.node.meta.name === "import" &&
        path.node.property.name === "meta"
      ) {
        path.replaceWith(
          t.objectExpression([
            t.objectProperty(
              t.identifier("env"),
              t.memberExpression(
                t.identifier("process"),
                t.identifier("env")
              )
            ),
          ])
        );
      }
    },
  },
});

module.exports = {
  presets: [
    ["@babel/preset-env", { targets: { node: "current" } }],
    ["@babel/preset-react", { runtime: "automatic" }],
  ],
  plugins: [importMetaPlugin],
};
