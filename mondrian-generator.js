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

const imgParams = {}

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

  const centerX = polygonPts.reduce((acc, currVal) => acc + currVal.x, 0) / polygonSides.length
  const centerY = polygonPts.reduce((acc, currVal) => acc + currVal.y, 0) / polygonSides.length
  const randomTriPt = getRandomItem(polygonPts)
  const radius1 = getRandomInt(300, 1000)
  const radius2 = getRandomInt(1000, 2000)

  const gradient = context.createRadialGradient(randomTriPt.x, randomTriPt.y, radius1, randomTriPt.x, randomTriPt.y, radius2);
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

const imgUrls = [
  'https://images.squarespace-cdn.com/content/v1/58d436d42994cafbe9ea41da/1509648057409-4OTBXYH1V441X0P3OCEU/ke17ZwdGBToddI8pDm48kBnD1PuHq1ChlNNw8HY5Bat7gQa3H78H3Y0txjaiv_0fDoOvxcdMmMKkDsyUqMSsMWxHk725yiiHCCLfrh8O1z4YTzHvnKhyp6Da-NYroOW3ZGjoBKy3azqku80C789l0hZPx-jNbZA_TaS-5l2nNKFuX3vssmPvjGd_aUGjvQdj0mO7zdgnfiNhBvsKx2QkvA/francis.jpg?format=2500w',
  'https://i2.wp.com/files.123freevectors.com/wp-content/original/170617-red-yellow-and-blue-watercolor-background-image.jpg?w=800&q=95',
  'https://images.unsplash.com/photo-1545231097-cbd796f1d95f?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1286&q=80',
  'https://images.masterworksfineart.com/product/untitled-1980-3/sam-francis-monotype-on-paper-untitled-1980-closeup-1.jpg',
  'https://images.squarespace-cdn.com/content/v1/58d436d42994cafbe9ea41da/1509648057409-4OTBXYH1V441X0P3OCEU/ke17ZwdGBToddI8pDm48kBnD1PuHq1ChlNNw8HY5Bat7gQa3H78H3Y0txjaiv_0fDoOvxcdMmMKkDsyUqMSsMWxHk725yiiHCCLfrh8O1z4YTzHvnKhyp6Da-NYroOW3ZGjoBKy3azqku80C789l0hZPx-jNbZA_TaS-5l2nNKFuX3vssmPvjGd_aUGjvQdj0mO7zdgnfiNhBvsKx2QkvA/francis.jpg?format=2500w',
  'https://content.ngv.vic.gov.au/retrieve.php?size=1280&type=image&vernonID=27159',
  'https://www.christies.com/img/LotImages/2013/NYR/2013_NYR_02697_0259_000(sam_francis_untitled041810).jpg?mode=max',
  'https://images.masterworksfineart.com/product/untitled-1980-3/sam-francis-monotype-on-paper-untitled-1980-closeup-3.jpg',
  'https://a.1stdibscdn.com/sam-francis-paintings-sklye-for-sale/a_2612/1547909086838/FRANCIS_Sam_Sklye__master.jpg',
  'https://fineartmultiple.com/media/product/715/pink-venus-kiki-from-1-life-sfr-59-1506593379-2000-3cd.jpg',
  // 'https://c.wallhere.com/photos/0b/d1/wall_colorful_graffiti-250248.jpg!d', // RETURNS 503
  // 'https://c.pxhere.com/photos/9d/9a/abstract_abstract_expressionism_abstract_painting_acrylic_acrylic_paint_art_artistic_background-1539191.jpg!d', // RETURNS 503
  'https://i.pinimg.com/originals/6a/9b/bb/6a9bbb2f743e807be85bba488a00229b.jpg',
  'https://sothebys-md.brightspotcdn.com/dims4/default/b3aa8ea/2147483647/strip/true/crop/2000x2480+0+0/resize/2048x2540!/quality/90/?url=http%3A%2F%2Fsothebys-brightspot.s3.amazonaws.com%2Fmedia-desk%2Fc7%2F61%2F00862d0d4816a29904c6b4e463f0%2Fn10370-111-web-crop.jpg',
  'https://fisunguner.com/wp-content/uploads/2016/12/rothko_untitled.jpg',
  'https://i.redd.it/fp5z6fuaiocy.png',
  // IMAGES WITH MORE STRUCTURE TO THEM:
  'https://i.pinimg.com/originals/da/25/9e/da259ecca2fc09510e93d5541c5cb6aa.jpg',
  'https://www.moma.org/d/assets/W1siZiIsIjIwMTcvMDYvMjIvODljcmkzc3NiNl8xNDEyNjMwNzM2XzY5MF9CbHVlX051ZGVzLmpwZyJdLFsicCIsImNvbnZlcnQiLCItcXVhbGl0eSA5MCAtcmVzaXplIDIwMDB4MjAwMFx1MDAzZSJdXQ/1412630736_690_Blue_Nudes.jpg?sha=c93f67536c56e8aa',
  'https://cdn.shopify.com/s/files/1/0049/4197/1571/products/image_db896678-11a5-468d-b995-db1d3b950c79_1024x1024@2x.jpg?v=1592659379',
  'https://cdn.shopify.com/s/files/1/1021/8371/products/XDB7_006_bd35b659-41b5-4106-b46c-61b672c72ce0_1200x1200.jpg?v=1569607723',
  'https://cdn.shopify.com/s/files/1/0049/4197/1571/products/image_d766adfc-02c8-4728-9fd0-2b7ad913bd1c_1024x1024.jpg?v=1592659378',
  'https://arthistoryproject.com/site/assets/files/18965/charmion-von-wiegand-individual-worlds-1947-trivium-art-history.jpg',
  'https://arthistoryproject.com/site/assets/files/18933/charmion_von_wiegand-untitled-1945-trivium-art-history.jpg',
  // IMGUR PHOTOS:
  'https://i.imgur.com/ZlPSFHg.png',
  'https://i.imgur.com/RA85QJ6.jpeg',
  'https://i.imgur.com/RicxCWy.jpg',
  'https://i.imgur.com/i91FYmB.jpg',
  'https://i.imgur.com/261dlRr.jpg',
]

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
  context.clip()

  const imgUrl = getRandomItem(imgUrls)

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
      saveCanvas('polygon-img')
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