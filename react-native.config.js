const path = require("path");
const { generate } = require("./dist/commonjs/generate");

module.exports = {
  commands: [
    {
      name: "generate-bootsplash <logoPath>",
      description: "Generate a launch screen using an original logo file",
      options: [
        {
          name: "--background-color <color>",
          description:
            "color used as launch screen background (in hexadecimal format)",
          default: "#fff",
        },
        {
          name: "--dark-background-color <color>",
          description:
            "color used as launch screen background (in hexadecimal format)",
          default: "#000",
        },
        {
          name: "--logo-width <width>",
          description:
            "logo width at @1x (in dp - we recommand approximately ~100)",
          default: 100,
          parse: (value) => parseInt(value, 10),
        },
        {
          name: "--assets-path [path]",
          description:
            "path to your static assets directory (useful to require the logo file in JS)",
        },
        {
          name: "--background-path [path]",
          description: "path to your background image",
        },
      ],
      func: (
        [logoPath],
        { project: { android, ios } },
        {
          backgroundColor,
          darkBackgroundColor,
          logoWidth,
          assetsPath,
          backgroundPath,
        },
      ) => {
        const workingDirectory =
          process.env.INIT_CWD || process.env.PWD || process.cwd();

        return generate({
          android,
          ios,

          workingDirectory,
          logoPath: path.resolve(workingDirectory, logoPath),
          backgroundColor,
          logoWidth,
          assetsPath: assetsPath
            ? path.resolve(workingDirectory, assetsPath)
            : undefined,
          backgroundPath: backgroundPath
            ? path.resolve(workingDirectory, backgroundPath)
            : undefined,
          darkBackgroundColor,
        }).catch((error) => {
          console.error(error);
        });
      },
    },
  ],
};
