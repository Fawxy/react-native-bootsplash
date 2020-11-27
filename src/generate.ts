import chalk from "chalk";
import fs from "fs-extra";
import jimp from "jimp";
import path from "path";

const logoFileName = "bootsplash_logo";
const backgroundImageFileName = "bootsplash_background_image";
const xclogoassetName = "BootSplashLogo";
const xcbackgroundassetName = "BootSplashBackground";
const xccolourassetName = "BootSplashBackgroundColor";
const androidColorName = "bootsplash_background";
const androidColorRegex = /<color name="bootsplash_background">#\w+<\/color>/g;

const LogoImageContentsJson = `{
  "images": [
    {
      "idiom": "universal",
      "filename": "${logoFileName}.png",
      "scale": "1x"
    },
    {
      "idiom": "universal",
      "filename": "${logoFileName}@2x.png",
      "scale": "2x"
    },
    {
      "idiom": "universal",
      "filename": "${logoFileName}@3x.png",
      "scale": "3x"
    }
  ],
  "info": {
    "version": 1,
    "author": "xcode"
  }
}
`;

const BackgroundImageContentsJson = `{
  "images": [
    {
      "idiom": "universal",
      "filename": "${backgroundImageFileName}.png",
      "scale": "1x"
    },
    {
      "idiom": "universal",
      "filename": "${backgroundImageFileName}@2x.png",
      "scale": "2x"
    },
    {
      "idiom": "universal",
      "filename": "${backgroundImageFileName}@3x.png",
      "scale": "3x"
    }
  ],
  "info": {
    "version": 1,
    "author": "xcode"
  }
}
`;

const getStoryboard = ({
  height,
  width,
  backgroundColor: hex,
}: {
  height: number;
  width: number;
  backgroundColor: string;
}) => {
  const r = (parseInt(hex[1] + hex[2], 16) / 255).toPrecision(15);
  const g = (parseInt(hex[3] + hex[4], 16) / 255).toPrecision(15);
  const b = (parseInt(hex[5] + hex[6], 16) / 255).toPrecision(15);

  return `<?xml version="1.0" encoding="UTF-8"?>
  <document type="com.apple.InterfaceBuilder3.CocoaTouch.Storyboard.XIB" version="3.0" toolsVersion="17506" targetRuntime="iOS.CocoaTouch" propertyAccessControl="none" useAutolayout="YES" launchScreen="YES" useTraitCollections="YES" useSafeAreas="YES" colorMatched="YES" initialViewController="01J-lp-oVM">
      <device id="retina4_7" orientation="portrait" appearance="light"/>
      <dependencies>
          <deployment identifier="iOS"/>
          <plugIn identifier="com.apple.InterfaceBuilder.IBCocoaTouchPlugin" version="17505"/>
          <capability name="Named colors" minToolsVersion="9.0"/>
          <capability name="Safe area layout guides" minToolsVersion="9.0"/>
          <capability name="documents saved in the Xcode 8 format" minToolsVersion="8.0"/>
      </dependencies>
      <scenes>
          <!--View Controller-->
          <scene sceneID="EHf-IW-A2E">
              <objects>
                  <viewController id="01J-lp-oVM" sceneMemberID="viewController">
                      <view key="view" autoresizesSubviews="NO" userInteractionEnabled="NO" contentMode="scaleToFill" id="Ze5-6b-2t3">
                          <rect key="frame" x="0.0" y="0.0" width="375" height="667"/>
                          <autoresizingMask key="autoresizingMask"/>
                          <subviews>
                              <imageView clipsSubviews="YES" userInteractionEnabled="NO" contentMode="scaleAspectFill" horizontalHuggingPriority="251" verticalHuggingPriority="251" image="BootSplashBackground" translatesAutoresizingMaskIntoConstraints="NO" id="iyb-cr-9SU">
                                  <rect key="frame" x="0.0" y="0.0" width="375" height="667"/>
                              </imageView>
                              <imageView autoresizesSubviews="NO" clipsSubviews="YES" userInteractionEnabled="NO" contentMode="scaleAspectFit" image="BootSplashLogo" translatesAutoresizingMaskIntoConstraints="NO" id="3lX-Ut-9ad">
                              <rect key="frame" x="${(375 - width) / 2}" y="${
    (667 - height) / 2
  }" width="${width}" height="${height}"/>
                                  <accessibility key="accessibilityConfiguration">
                                      <accessibilityTraits key="traits" image="YES" notEnabled="YES"/>
                                  </accessibility>
                              </imageView>
                          </subviews>
                          <viewLayoutGuide key="safeArea" id="Bcu-3y-fUS"/>
                          <color key="backgroundColor" name="${xccolourassetName}"/>
                          <accessibility key="accessibilityConfiguration">
                              <accessibilityTraits key="traits" notEnabled="YES"/>
                          </accessibility>
                          <constraints>
                              <constraint firstItem="iyb-cr-9SU" firstAttribute="top" secondItem="Ze5-6b-2t3" secondAttribute="top" id="0ej-08-UY0"/>
                              <constraint firstItem="3lX-Ut-9ad" firstAttribute="centerX" secondItem="Ze5-6b-2t3" secondAttribute="centerX" id="Fh9-Fy-1nT"/>
                              <constraint firstAttribute="bottom" secondItem="iyb-cr-9SU" secondAttribute="bottom" id="Rte-OK-5et"/>
                              <constraint firstAttribute="trailing" secondItem="iyb-cr-9SU" secondAttribute="trailing" id="ap5-Il-Vnn"/>
                              <constraint firstItem="iyb-cr-9SU" firstAttribute="leading" secondItem="Ze5-6b-2t3" secondAttribute="leading" id="j0w-0S-jTC"/>
                              <constraint firstItem="3lX-Ut-9ad" firstAttribute="centerY" secondItem="Ze5-6b-2t3" secondAttribute="centerY" id="nvB-Ic-PnI"/>
                          </constraints>
                      </view>
                  </viewController>
                  <placeholder placeholderIdentifier="IBFirstResponder" id="iYj-Kq-Ea1" userLabel="First Responder" sceneMemberID="firstResponder"/>
              </objects>
              <point key="canvasLocation" x="-0.80000000000000004" y="-0.44977511244377816"/>
          </scene>
      </scenes>
      <resources>
          <image name="${xcbackgroundassetName}" width="800" height="800"/>
          <image name="${xclogoassetName}" width="${width}" height="${height}"/>
          <namedColor name="BootSplashBackgroundColor">
              <color red="${r}" green="${g}" blue="${b}" alpha="1" colorSpace="custom" customColorSpace="sRGB"/>
          </namedColor>
      </resources>
  </document>
  `;
};

const getColours = ({
  backgroundColorHex: hex,
  darkBackgroundColorHex: dHex,
}: {
  backgroundColorHex: string;
  darkBackgroundColorHex: string;
}) => {
  const r = (parseInt(hex[1] + hex[2], 16) / 255).toPrecision(15);
  const g = (parseInt(hex[3] + hex[4], 16) / 255).toPrecision(15);
  const b = (parseInt(hex[5] + hex[6], 16) / 255).toPrecision(15);

  const dr = (parseInt(dHex[1] + dHex[2], 16) / 255).toPrecision(15);
  const dg = (parseInt(dHex[3] + dHex[4], 16) / 255).toPrecision(15);
  const db = (parseInt(dHex[5] + dHex[6], 16) / 255).toPrecision(15);

  return `{
    "colors" : [
      {
        "color" : {
          "color-space" : "srgb",
          "components" : {
            "alpha" : "1.000",
            "blue" : "${b}",
            "green" : "${g}",
            "red" : "${r}"
          }
        },
        "idiom" : "universal"
      },
      {
        "appearances" : [
          {
            "appearance" : "luminosity",
            "value" : "dark"
          }
        ],
        "color" : {
          "color-space" : "srgb",
          "components" : {
            "alpha" : "1.000",
            "blue" : "${db}",
            "green" : "${dg}",
            "red" : "${dr}"
          }
        },
        "idiom" : "universal"
      }
    ],
    "info" : {
      "author" : "xcode",
      "version" : 1
    }
  }
  `;
};

const bootSplashXml = `<?xml version="1.0" encoding="utf-8"?>

<layer-list xmlns:android="http://schemas.android.com/apk/res/android" android:opacity="opaque">
    <item android:drawable="@color/${androidColorName}" />

    <item>
        <bitmap android:src="@mipmap/${logoFileName}" android:gravity="center" />
    </item>
</layer-list>
`;

const log = (text: string, dim = false) => {
  console.log(dim ? chalk.dim(text) : text);
};

const isValidHexadecimal = (value: string) =>
  /^#?([0-9A-F]{3}){1,2}$/i.test(value);

const toFullHexadecimal = (hex: string) => {
  const prefixed = hex[0] === "#" ? hex : `#${hex}`;
  const up = prefixed.toUpperCase();

  return up.length === 4
    ? "#" + up[1] + up[1] + up[2] + up[2] + up[3] + up[3]
    : up;
};

export const generate = async ({
  android,
  ios,

  workingDirectory,
  backgroundPath,
  logoPath,
  backgroundColor,
  darkBackgroundColor,
  logoWidth,
  assetsPath,
}: {
  android: {
    sourceDir: string;
    appName: string;
  } | null;
  ios: {
    projectPath: string;
  } | null;

  workingDirectory: string;
  backgroundPath: string | null;
  logoPath: string;
  backgroundColor: string;
  darkBackgroundColor: string | null;
  logoWidth: number;
  assetsPath?: string;
}) => {
  if (!isValidHexadecimal(backgroundColor)) {
    throw new Error(
      "--background-color value is not a valid hexadecimal color.",
    );
  }
  let backgroundImage: any;
  let darkBackgroundColorHex;

  const logoImage = await jimp.read(logoPath);
  backgroundImage = backgroundPath && (await jimp.read(backgroundPath));
  const backgroundColorHex = toFullHexadecimal(backgroundColor);
  darkBackgroundColorHex = darkBackgroundColor
    ? toFullHexadecimal(darkBackgroundColor)
    : backgroundColorHex;

  const logoImages: {
    filePath: string;
    width: number;
    height: number;
  }[] = [];

  const backgroundImages: {
    filePath: string;
    width: number;
    height: number;
  }[] = [];

  const getHeight = (size: number) =>
    Math.ceil(size * (logoImage.bitmap.height / logoImage.bitmap.width));

  const width = {
    "@1x": logoWidth,
    "@1.5x": logoWidth * 1.5,
    "@2x": logoWidth * 2,
    "@3x": logoWidth * 3,
    "@4x": logoWidth * 4,
  };

  const height = {
    "@1x": getHeight(width["@1x"]),
    "@1.5x": getHeight(width["@1.5x"]),
    "@2x": getHeight(width["@2x"]),
    "@3x": getHeight(width["@3x"]),
    "@4x": getHeight(width["@4x"]),
  };

  const backgroundImageWidth = {
    "@1x": 1024,
    "@1.5x": 1920,
    "@2x": 2732,
    "@3x": 2688,
    "@4x": 3840,
  };

  const backgroundImageHeight = {
    "@1x": 1024,
    "@1.5x": 1920,
    "@2x": 2732,
    "@3x": 2688,
    "@4x": 3840,
  };

  if (assetsPath && fs.existsSync(assetsPath)) {
    logoImages.push(
      {
        filePath: path.resolve(assetsPath, logoFileName + ".png"),
        width: width["@1x"],
        height: height["@1x"],
      },
      {
        filePath: path.resolve(assetsPath, logoFileName + "@1.5x.png"),
        width: width["@1.5x"],
        height: height["@1.5x"],
      },
      {
        filePath: path.resolve(assetsPath, logoFileName + "@2x.png"),
        width: width["@2x"],
        height: height["@2x"],
      },
      {
        filePath: path.resolve(assetsPath, logoFileName + "@3x.png"),
        width: width["@3x"],
        height: height["@3x"],
      },
      {
        filePath: path.resolve(assetsPath, logoFileName + "@4x.png"),
        width: width["@4x"],
        height: height["@4x"],
      },
    );

    backgroundImages.push(
      {
        filePath: path.resolve(assetsPath, backgroundImageFileName + ".png"),
        width: backgroundImageWidth["@1x"],
        height: backgroundImageHeight["@1x"],
      },
      {
        filePath: path.resolve(
          assetsPath,
          backgroundImageFileName + "@1.5x.png",
        ),
        width: backgroundImageWidth["@1.5x"],
        height: backgroundImageHeight["@1.5x"],
      },
      {
        filePath: path.resolve(assetsPath, backgroundImageFileName + "@2x.png"),
        width: backgroundImageWidth["@2x"],
        height: backgroundImageHeight["@2x"],
      },
      {
        filePath: path.resolve(assetsPath, backgroundImageFileName + "@3x.png"),
        width: backgroundImageWidth["@3x"],
        height: backgroundImageHeight["@3x"],
      },
      {
        filePath: path.resolve(assetsPath, backgroundImageFileName + "@4x.png"),
        width: backgroundImageWidth["@4x"],
        height: backgroundImageHeight["@4x"],
      },
    );
  }

  if (android) {
    const appPath = android.appName
      ? path.resolve(android.sourceDir, android.appName)
      : path.resolve(android.sourceDir); // @react-native-community/cli 2.x & 3.x support

    const resPath = path.resolve(appPath, "src", "main", "res");
    const drawablePath = path.resolve(resPath, "drawable");
    const valuesPath = path.resolve(resPath, "values");

    fs.ensureDirSync(drawablePath);
    fs.ensureDirSync(valuesPath);

    const bootSplashXmlPath = path.resolve(drawablePath, "bootsplash.xml");
    fs.writeFileSync(bootSplashXmlPath, bootSplashXml, "utf-8");
    log(`✨  ${path.relative(workingDirectory, bootSplashXmlPath)}`, true);

    const colorsXmlPath = path.resolve(valuesPath, "colors.xml");
    const colorsXmlEntry = `<color name="${androidColorName}">${backgroundColorHex}</color>`;

    if (fs.existsSync(colorsXmlPath)) {
      const colorsXml = fs.readFileSync(colorsXmlPath, "utf-8");

      if (colorsXml.match(androidColorRegex)) {
        fs.writeFileSync(
          colorsXmlPath,
          colorsXml.replace(androidColorRegex, colorsXmlEntry),
          "utf-8",
        );
      } else {
        fs.writeFileSync(
          colorsXmlPath,
          colorsXml.replace(
            /<\/resources>/g,
            `    ${colorsXmlEntry}\n</resources>`,
          ),
          "utf-8",
        );
      }

      log(`✏️   ${path.relative(workingDirectory, colorsXmlPath)}`, true);
    } else {
      fs.writeFileSync(
        colorsXmlPath,
        `<resources>\n    ${colorsXmlEntry}\n</resources>\n`,
        "utf-8",
      );

      log(`✨  ${path.relative(workingDirectory, colorsXmlPath)}`, true);
    }

    logoImages.push(
      {
        filePath: path.resolve(resPath, "mipmap-mdpi", logoFileName + ".png"),
        width: width["@1x"],
        height: height["@1x"],
      },
      {
        filePath: path.resolve(resPath, "mipmap-hdpi", logoFileName + ".png"),
        width: width["@1.5x"],
        height: height["@1.5x"],
      },
      {
        filePath: path.resolve(resPath, "mipmap-xhdpi", logoFileName + ".png"),
        width: width["@2x"],
        height: height["@2x"],
      },
      {
        filePath: path.resolve(resPath, "mipmap-xxhdpi", logoFileName + ".png"),
        width: width["@3x"],
        height: height["@3x"],
      },
      {
        filePath: path.resolve(
          resPath,
          "mipmap-xxxhdpi",
          logoFileName + ".png",
        ),
        width: width["@4x"],
        height: height["@4x"],
      },
    );

    backgroundImages.push(
      {
        filePath: path.resolve(
          resPath,
          "mipmap-mdpi",
          backgroundImageFileName + ".png",
        ),
        width: backgroundImageWidth["@1x"],
        height: backgroundImageHeight["@1x"],
      },
      {
        filePath: path.resolve(
          resPath,
          "mipmap-hdpi",
          backgroundImageFileName + ".png",
        ),
        width: backgroundImageWidth["@1.5x"],
        height: backgroundImageHeight["@1.5x"],
      },
      {
        filePath: path.resolve(
          resPath,
          "mipmap-xhdpi",
          backgroundImageFileName + ".png",
        ),
        width: backgroundImageWidth["@2x"],
        height: backgroundImageHeight["@2x"],
      },
      {
        filePath: path.resolve(
          resPath,
          "mipmap-xxhdpi",
          backgroundImageFileName + ".png",
        ),
        width: backgroundImageWidth["@3x"],
        height: backgroundImageHeight["@3x"],
      },
      {
        filePath: path.resolve(
          resPath,
          "mipmap-xxxhdpi",
          logoFileName + ".png",
        ),
        width: width["@4x"],
        height: backgroundImageHeight["@4x"],
      },
    );
  }

  if (ios) {
    const projectPath = ios.projectPath.replace(/.xcodeproj$/, "");
    const imagesPath = path.resolve(projectPath, "Images.xcassets");

    if (fs.existsSync(projectPath)) {
      const storyboardPath = path.resolve(projectPath, "BootSplash.storyboard");

      fs.writeFileSync(
        storyboardPath,
        getStoryboard({
          height: height["@1x"],
          width: width["@1x"],
          backgroundColor: backgroundColorHex,
        }),
        "utf-8",
      );

      log(`✨  ${path.relative(workingDirectory, storyboardPath)}`, true);
    } else {
      log(
        `No "${projectPath}" directory found. Skipping iOS storyboard generation…`,
      );
    }

    if (fs.existsSync(imagesPath)) {
      const logoImageSetPath = path.resolve(
        imagesPath,
        xclogoassetName + ".imageset",
      );
      fs.ensureDirSync(logoImageSetPath);

      fs.writeFileSync(
        path.resolve(logoImageSetPath, "Contents.json"),
        LogoImageContentsJson,
        "utf-8",
      );

      logoImages.push(
        {
          filePath: path.resolve(logoImageSetPath, logoFileName + ".png"),
          width: width["@1x"],
          height: height["@1x"],
        },
        {
          filePath: path.resolve(logoImageSetPath, logoFileName + "@2x.png"),
          width: width["@2x"],
          height: height["@2x"],
        },
        {
          filePath: path.resolve(logoImageSetPath, logoFileName + "@3x.png"),
          width: width["@3x"],
          height: height["@3x"],
        },
      );

      const backgroundImageSetPath = path.resolve(
        imagesPath,
        xcbackgroundassetName + ".imageset",
      );
      fs.ensureDirSync(backgroundImageSetPath);

      fs.writeFileSync(
        path.resolve(backgroundImageSetPath, "Contents.json"),
        BackgroundImageContentsJson,
        "utf-8",
      );

      backgroundImages.push(
        {
          filePath: path.resolve(
            backgroundImageSetPath,
            backgroundImageFileName + ".png",
          ),
          width: backgroundImageWidth["@1x"],
          height: backgroundImageHeight["@1x"],
        },
        {
          filePath: path.resolve(
            backgroundImageSetPath,
            backgroundImageFileName + "@2x.png",
          ),
          width: backgroundImageWidth["@2x"],
          height: backgroundImageHeight["@2x"],
        },
        {
          filePath: path.resolve(
            backgroundImageSetPath,
            backgroundImageFileName + "@3x.png",
          ),
          width: backgroundImageWidth["@3x"],
          height: backgroundImageHeight["@3x"],
        },
      );

      const colorSetPath = path.resolve(
        imagesPath,
        xccolourassetName + ".imageset",
      );
      fs.ensureDirSync(colorSetPath);

      fs.writeFileSync(
        path.resolve(colorSetPath, "Contents.json"),
        getColours({ backgroundColorHex, darkBackgroundColorHex }),
        "utf-8",
      );
    } else {
      log(
        `No "${imagesPath}" directory found. Skipping iOS images generation…`,
      );
    }
  }

  await Promise.all([
    logoImages.map(({ filePath, width, height }) =>
      logoImage
        .clone()
        .cover(width, height)
        .writeAsync(filePath)
        .then(() => {
          log(
            `✨  ${path.relative(
              workingDirectory,
              filePath,
            )} (${width}x${height})`,
            true,
          );
        }),
    ),
    backgroundImage &&
      backgroundImages.map(({ filePath, width, height }) =>
        backgroundImage
          .clone()
          .cover(width, height)
          .writeAsync(filePath)
          .then(() => {
            log(
              `✨  ${path.relative(
                workingDirectory,
                filePath,
              )} (${width}x${height})`,
              true,
            );
          }),
      ),
  ]);

  log(
    `✅  Done! Thanks for using ${chalk.underline("react-native-bootsplash")}.`,
  );
};
