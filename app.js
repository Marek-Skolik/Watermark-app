const inquirer = require('inquirer');
const Jimp = require('jimp');
const fs = require('fs');

const prepareOutputFilename = inputName => {
  const name = inputName.split('.');
  return name[0] + '-with-watermark.' + name[1];
};

const startApp = async () => {
  try {
    //Ask if user is ready
    const answer = await inquirer.prompt([{
      name: 'start',
      message: 'Hi! Welcome to "Watermark manager". Copy your image files to `/img` folder. Then you\'ll be able to use them in the app. Are you ready?',
      type: 'confirm'
    }]);

    //If answer is no, just quit the app
    if(!answer.start) process.exit();

    //Ask about input file and watermark type
    const options = await inquirer.prompt([{
      name: 'inputImage',
      type: 'input', 
      message: 'What file do you want to mark?',
      default: 'test.jpg'
    }])
    const inputPath = './img/' + options.inputImage;
    if(fs.existsSync(inputPath)){
      const optionsWatermark = await inquirer.prompt([{
        name: 'watermarkType',
        type: 'list',
        choices: ['Text watermark', 'Image watermark']
      }]);
      if(optionsWatermark.watermarkType === 'Text watermark') {
        const text = await inquirer.prompt([{
          name: 'value',
          type: 'input',
          message: 'Type your watermark text:',
        }]);
        optionsWatermark.watermarkText = text.value;
        addTextWatermarkToImage('./img/' + options.inputImage, './img/' + prepareOutputFilename(options.inputImage), optionsWatermark.watermarkText);
        console.log('Success!');
        startApp();
      }
      else {
        const image = await inquirer.prompt([{
          name: 'filename',
          type: 'input',
          message: 'Type your watermark name:',
          default: 'logo.png',
        }]);
        if(fs.existsSync('./img/' + image.filename)){
          optionsWatermark.watermarkImage = image.filename;
          addImageWatermarkToImage('./img/' + options.inputImage, './img/' + prepareOutputFilename(options.inputImage), './img/' + optionsWatermark.watermarkImage);
          console.log('Success!');
          startApp();
        }
        else {
          console.log('watermark file doesnt exist')
        }
      }  
    } else {
      console.log('file doesnt exist')
    }  
  }
  catch(error) {
    console.log('Something went wrong... Try again!');
  };
}

startApp();

prepareOutputFilename('test.jpg')
const addTextWatermarkToImage = async function(inputFile, outputFile, text) {
  const image = await Jimp.read(inputFile);
  const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
const textData = {
    text,
    alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
    alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
  };

  image.print(font, 0, 0, textData, image.getWidth(), image.getHeight());
  await image.quality(100).writeAsync(outputFile);
};


const addImageWatermarkToImage = async function(inputFile, outputFile, watermarkFile) {
  const image = await Jimp.read(inputFile);
  const watermark = await Jimp.read(watermarkFile);
  const x = image.getWidth() / 2 - watermark.getWidth() / 2;
  const y = image.getHeight() / 2 - watermark.getHeight() / 2;

  image.composite(watermark, x, y, {
    mode: Jimp.BLEND_SOURCE_OVER,
    opacitySource: 0.5,
  });
  await image.quality(100).writeAsync(outputFile);
};