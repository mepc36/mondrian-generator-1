const CANVAS_WIDTH = 1920
const CANVAS_HEIGHT = 1080
const legalColors = ['red', 'yellow', 'blue']

const getRandomItem = array => array[Math.floor(Math.random() * array.length)];

const canvasColor = getRandomItem(legalColors)

function getContext(fillStyle = 'white', isTransparent) {
  const canvas = document.getElementById('compositionCanvas');
  canvas.width = CANVAS_WIDTH
  canvas.height = CANVAS_HEIGHT
  const context = canvas.getContext('2d');
  if (!isTransparent) {
    context.fillStyle = canvasColor
    context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }
  return { context, canvas }
}

function clearCanvas() {
  let { context, canvas } = getContext()
  context.clearRect(0, 0, canvas.width, canvas.height);
}

function autoSaveImg(image, fileName) {
  const link = document.createElement('a');
  link.href = image;
  link.download = `${fileName}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function saveCanvas(fileName) {
  const canvas = document.getElementById('compositionCanvas');
  let image = canvas.toDataURL("image/png");
  image = image.replace(/^data:image\/[^;]*/, 'data:application/octet-stream');
  image = image.replace(/^data:application\/octet-stream/, 'data:application/octet-stream;headers=Content-Disposition%3A%20attachment%3B%20filename=mondrian.png');
  this.href = image;

  autoSaveImg(image, fileName)
}

const colorToHexMap = {
  red: '#fe0000',
  yellow: '#ffff00',
  blue: '#0000fe',
  black: '#000000',
  tan: '#e7e0b8'
}

const colors = ['red', 'yellow', 'black', 'blue'];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function orientXYtoTopLeft(innerLines, xOrY) {
  const lineStarts = xOrY === 'x' ? innerLines.sort((a, b) => a - b) : innerLines.sort((a, b) => a - b).reverse();

  return lineStarts
}

function addBorders(innerLines) {
  const BORDER_WIDTH = 2
  const linesWithBorders = [BORDER_WIDTH, ...innerLines, CANVAS_WIDTH - BORDER_WIDTH]
  return linesWithBorders
}

function getInnerLines(numLines) {
  const innerLines = [];
  const PADDING_MARGIN = 10

  for (let i = 0; i < numLines; i++) {
    innerLines.push(getRandomInt(PADDING_MARGIN, CANVAS_WIDTH - PADDING_MARGIN))
  };

  const linesWithBorders = addBorders(innerLines)
  return linesWithBorders
}

function getLineStarts(xOrY) {
  const numLines = getRandomInt(2, 4);
  const innerLines = getInnerLines(numLines)
  const lineStarts = orientXYtoTopLeft(innerLines, xOrY)

  return lineStarts
}

function getLineWidths(linePositions, LINE_WIDTHS) {
  const BORDER_WIDTH = 4

  const lineWidths = linePositions.map((_, idx) => {
    const lineWidth = isBorder(linePositions, idx) ? BORDER_WIDTH : LINE_WIDTHS[getRandomInt(0, LINE_WIDTHS.length - 1)]
    return lineWidth
  })

  return lineWidths
}

const isBorder = (linePositions, idx) => idx === 0 || idx === linePositions.length - 1

function getLinePoints(artistName, linePositions, idx) {
  let linePoints

  if (artistName === 'Mondrian') {
    linePoints = {
      xStart: 0,
      yStart: 0,
      xStop: CANVAS_HEIGHT,
      yStop: CANVAS_WIDTH
    }
  } else if (artistName === 'Brown') {
    linePoints = {
      xStart: getRandomInt(10, 380),
      xStop: getRandomInt(10, 380),
      yStart: getRandomInt(10, 380),
      yStop: getRandomInt(10, 380)
    }
  }

  return linePoints
}

function addLinesToContext(context, linePositions, xOrY, lineWidths, artistName) {
  linePositions.forEach((linePosition, idx) => {
    const { xStart, xStop, yStart, yStop } = getLinePoints(artistName, linePositions, idx)
    const moveToArgs = xOrY === 'x' ? [linePosition, xStart] : [yStart, linePosition]
    const lineToArgs = xOrY === 'x' ? [linePosition, xStop] : [yStop, linePosition]

    context.beginPath();
    context.moveTo(...moveToArgs);
    context.lineTo(...lineToArgs);
    context.stroke();
    context.lineWidth = lineWidths[idx];
    context.strokeStyle = 'black';
    context.stroke();
  })

  return context
}

function getRectDims(xLineStarts, yLineStarts, xLineWidths, yLineWidths) {
  const xPtr = getRandomInt(0, xLineStarts.length - 1)
  const yPtr = getRandomInt(0, yLineStarts.length - 1)

  const X_START = xLineStarts[xPtr]
  const Y_START = yLineStarts[yPtr]
  const RECT_WIDTH = xLineStarts[xPtr + 1] - X_START
  const RECT_HEIGHT = yLineStarts[yPtr + 1] - Y_START

  return { X_START, Y_START, RECT_WIDTH, RECT_HEIGHT }
}

function fillContextSquares(context, xLineStarts, yLineStarts, xLineWidths, yLineWidths, opts) {
  const numColors = getRandomInt(3, 10);

  for (let c = 0; c < numColors; c++) {
    const { X_START, Y_START, RECT_HEIGHT, RECT_WIDTH } = getRectDims(xLineStarts, yLineStarts, xLineWidths, yLineWidths)
    const randColor = colors[getRandomInt(0, colors.length - 1)];
    context = drawRect(context, colorToHexMap[randColor], X_START, Y_START, RECT_WIDTH, RECT_HEIGHT)
  }

  return context
}

const imgParams = {

}

const makeArtistImgFuncs = {
  Mondrian: (artistName, shouldSave, opts, fileName) => {
    let { context, canvas } = getContext()

    const xLineStarts = imgParams.xLineStarts || getLineStarts('x')
    const yLineStarts = imgParams.yLineStarts || getLineStarts('y')
    imgParams.xLineStarts = xLineStarts
    imgParams.yLineStarts = yLineStarts

    const lineWidths = [2, 7, 12, 17]
    const xLineWidths = imgParams.xLineWidths || getLineWidths(xLineStarts, lineWidths)
    const yLineWidths = imgParams.yLineWidths || getLineWidths(yLineStarts, lineWidths)
    imgParams.xLineWidths = xLineWidths
    imgParams.yLineWidths = yLineWidths

    context = fillContextSquares(context, xLineStarts, yLineStarts, xLineWidths, yLineWidths, opts)
    context = addLinesToContext(context, xLineStarts, 'x', xLineWidths, 'Mondrian')
    context = addLinesToContext(context, yLineStarts, 'y', yLineWidths, 'Mondrian')

    if (shouldSave) {
      saveCanvas(fileName)
    }
  },
  Brown: (artistName, shouldSave, opts, fileName) => {
    const xLineStarts = getLineStarts('x')
    const yLineStarts = getLineStarts('y')

    let { context, canvas } = getContext()
    const lineWidths = [2, 7, 12, 17]

    const xLineWidths = getLineWidths(xLineStarts, lineWidths)
    const yLineWidths = getLineWidths(yLineStarts, lineWidths)

    context = addLinesToContext(context, xLineStarts, 'x', xLineWidths, 'Brown')
    context = addLinesToContext(context, yLineStarts, 'y', yLineWidths, 'Brown')
    // const linesWithBorders = addBorders(innerLines)

    if (shouldSave) {
      saveCanvas(fileName)
    }
  },
  LeWitt: (artistName, shouldSave, opts, fileName, idx) => {
    let { context, canvas } = getContext(colorToHexMap.tan)

    context = drawRect(context, colorToHexMap.black, 20, 20, 360, 360)

    for (let i = 0; i < 7; i++) {
      if (idx !== 0 && Math.random() > .9) {
        continue
      }
      const xStart = (i * 48) + 40
      const yStart = 40
      const width = 28
      const height = 160
      context = drawRect(context, colorToHexMap.tan, xStart, yStart, width, height)
    }

    for (let i = 0; i < 3; i++) {
      if (idx !== 0 && Math.random() > .7) {
        continue
      }
      const xStart = 40
      const yStart = (i * 48) + 220
      const width = 318
      const height = 30
      context = drawRect(context, colorToHexMap.tan, xStart, yStart, width, height)
    }

    if (shouldSave) {
      saveCanvas(fileName)
    }
  },
  CGI: (artistName, shouldSave, opts, fileName, idx) => {
    let { context, canvas } = getContext('', true)

    context = drawPolygon(context, ['#fe0000', '#ffcece'])

    if (shouldSave) {
      saveCanvas(fileName)
    }
  },
  ClipImage: (artistName, shouldSave, opts, fileName, idx) => {
    let { context, canvas } = getContext('', true)

    context = clipImage(context, canvas)

    if (shouldSave) {
      saveCanvas(fileName)
    }
  },
}

function drawPolygonOutline(context, lineWidth) {
  context.lineWidth = lineWidth;
  context.strokeStyle = 'black';
  context.stroke();
  return context
}

const shuffle = (array) => array.sort(() => .5 - Math.random())

function drawPolygon(context) {
  const ptRanges = getPtRanges()

  const notPickedColor = getRandomItem(legalColors)
  const fillColors = legalColors.filter(color => color !== notPickedColor)
  const canvasSides = ['top', 'right', 'bottom', 'left']
  const removedSide = getRandomItem(canvasSides)
  const polygonSides = Math.random() > .5 ? canvasSides.filter(canvasSide => canvasSide !== removedSide) : canvasSides
  const polygonPts = polygonSides.map(polygonSide => {
    const polygonSideRange = ptRanges[polygonSide]
    const x = getRandomInt(polygonSideRange.x.min, polygonSideRange.x.max)
    const y = getRandomInt(polygonSideRange.y.min, polygonSideRange.y.max)
    return { x, y }
  })

  context.beginPath();

  polygonPts.forEach((polygonPt, idx) => {
    if (idx === 0) {
      context.moveTo(polygonPt.x, polygonPt.y);
    } else {
      context.lineTo(polygonPt.x, polygonPt.y);
    }
  })

  context.closePath();
  context.clip();

  // context = drawPolygonOutline(context, 5)

  // const gradient = context.createLinearGradient(0, 540, 1920, 540);
  // gradient.addColorStop(0, fillColors[0]);
  // gradient.addColorStop(.4, 'black');
  // context.fillStyle = gradient;
  // context.fill();

  // RADIAL GRADIENT:
  const centerX = polygonPts.reduce((acc, currVal) => acc + currVal.x, 0) / polygonSides.length
  const centerY = polygonPts.reduce((acc, currVal) => acc + currVal.y, 0) / polygonSides.length
  const randomTriPt = getRandomItem(polygonPts)
  const radius1 = getRandomInt(300, 1000)
  const radius2 = getRandomInt(1000, 2000)

  const gradient = context.createRadialGradient(randomTriPt.x, randomTriPt.y, radius1, randomTriPt.x, randomTriPt.y, radius2);
  // const gradColors = ['red', 'blue', 'yellow', 'black', '#dbdbdb']
  const gradColors = ['red', 'blue', 'yellow', '#dbdbdb']

  const notColors = [getRandomItem(gradColors)]
  const trueColors = shuffle(gradColors.filter(gradColor => !notColors.includes(gradColor)))

  const stopPt1 = getRandomInt(0, 20)
  const stopPt2 = getRandomInt(stopPt1, 49)
  const stopPt3 = getRandomInt(stopPt2, 100)

  gradient.addColorStop(stopPt1 / 100, trueColors[0]);
  gradient.addColorStop(stopPt2 / 100, trueColors[1]);
  gradient.addColorStop(stopPt3 / 100, trueColors[2]);

  context.fillStyle = gradient;
  context.fill()
  context = drawSomeDots(context)
}

async function clipImage(context, canvas) {
  const ptRanges = getPtRanges()

  const notPickedColor = getRandomItem(legalColors)
  const fillColors = legalColors.filter(color => color !== notPickedColor)
  const canvasSides = ['top', 'right', 'bottom', 'left']
  const removedSide = getRandomItem(canvasSides)
  const polygonSides = Math.random() > .5 ? canvasSides.filter(canvasSide => canvasSide !== removedSide) : canvasSides
  const polygonPts = polygonSides.map(polygonSide => {
    const polygonSideRange = ptRanges[polygonSide]
    const x = getRandomInt(polygonSideRange.x.min, polygonSideRange.x.max)
    const y = getRandomInt(polygonSideRange.y.min, polygonSideRange.y.max)
    return { x, y }
  })

  context.beginPath();

  polygonPts.forEach((polygonPt, idx) => {
    if (idx === 0) {
      context.moveTo(polygonPt.x, polygonPt.y);
    } else {
      context.lineTo(polygonPt.x, polygonPt.y);
    }
  })

  context.closePath();
  context.clip();

  const imgUrl = 'https://previews.123rf.com/images/bravissimos/bravissimos1803/bravissimos180300420/97459917-ink-in-the-water-a-splash-of-multicolor-red-blue-yellow-and-green-paint-abstract-background-color.jpg'

  const getDataUri = function (targetUrl, callback) {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      const reader = new FileReader();
      reader.onloadend = function () {
        callback(reader.result);
      };
      reader.readAsDataURL(xhr.response);
    };
    const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
    xhr.open('GET', proxyUrl + targetUrl);
    xhr.responseType = 'blob';
    xhr.send();
  };
  getDataUri(imgUrl, function (base64) {
    const image = new Image();
    image.onload = function () {
      context.drawImage(image, 0, 0);
      saveCanvas()
    };
    image.src = base64
  })
}

function drawSomeDots(context) {
  const dotMargin = 30
  const numRows = 20
  const numCols = 40

  const dotHeight = getRandomInt(15, 30)
  const yMargin = (CANVAS_HEIGHT - (2 * dotMargin + numRows * dotHeight)) / numRows
  const dotRadius = dotHeight * 0.5

  const dotColors = ['#ff39e2', '#00ff5d', '#6effff']
  const color = getRandomItem(dotColors)
  const stopColors = {
    '#ff39e2': '#ffcef8',
    '#00ff5d': '#e3ffee',
    '#6effff': '#e2ffff',
  }
  const stopColor = stopColors[color]
  const startX = getRandomInt(0, 1920)
  const startY = getRandomInt(0, 1080)

  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numCols; j++) {
      const x = j * (dotHeight + dotMargin) + dotMargin + dotMargin / 2 + dotRadius
      const y = i * (dotHeight + yMargin) + dotMargin + yMargin / 2 + dotRadius
      drawDot(x + startX, y + startY, dotRadius, color, context, stopColor)
    }
  }
  return context
}

function drawDot(x, y, radius, color, context, stopColor) {
  context.beginPath()
  context.arc(x, y, radius, 0, 2 * Math.PI, false)
  const gradient = context.createRadialGradient(x, y, radius / 4, x, y, radius);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, stopColor);
  context.fillStyle = gradient
  context.fill()
}

function drawRect(context, fillStyle, xStart, yStart, width, height) {
  context.beginPath();
  context.rect(xStart, yStart, width, height);
  context.fillStyle = fillStyle
  context.fill();
  context.stroke();

  return context
}

function makeArtistImg(artistName, shouldSave, opts) {
  for (let i = 0; i < opts.variations; i++) {
    makeArtistImgFuncs[artistName](artistName, shouldSave, opts, `polygon-${i + 1}`, i)
  }
}

const getPtRanges = () => ({
  top: {
    x: {
      min: 0,
      max: CANVAS_WIDTH - 1,
    },
    y: {
      min: 0,
      max: 0,
    },
  },
  right: {
    x: {
      min: CANVAS_WIDTH - 1,
      max: CANVAS_WIDTH - 1,
    },
    y: {
      min: 0,
      max: CANVAS_HEIGHT - 1,
    },
  },
  bottom: {
    x: {
      min: 0,
      max: CANVAS_WIDTH - 1,
    },
    y: {
      min: CANVAS_HEIGHT - 1,
      max: CANVAS_HEIGHT - 1,
    },
  },
  left: {
    x: {
      min: 0,
      max: 0,
    },
    y: {
      min: 0,
      max: CANVAS_HEIGHT - 1,
    },
  },
})

// makeMondrianImg(true)

// TO DO:
// 1. Mock Sol LeWitt image.
// -- express all dims in LeWitt func in terms of CANVAS_HEIGHT and CANVAS_WIDTH.
// 2. Mock van Doesburg image.
// 3. Make Brown's "4 Systems" (with prependicular-only lines.)
// 4. Fix border width bug.
// 5. Create a demo of my vision for the video animations in FinalCut Pro.
// --Re-do the .png word images in 4 new colors: black, yellow, red, and blue. -- DONE
// --Create 1 demo with photographs, and 1 with mocked .pngs.
// --If mocked .pngs are too boring, explore photo-manipulation software that
// will make the photographs sharper. 