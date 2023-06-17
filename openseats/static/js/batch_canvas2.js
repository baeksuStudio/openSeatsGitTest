import {stage, layer} from './set_screen.js';

// create our shape
var GUIDELINE_OFFSET = 5;

var addObjectBtn = document.getElementById('add-object-btn');
addObjectBtn.addEventListener('click', function() {
  var selectElement = document.querySelector('.side-space-menubar select');
  var selectedOption = selectElement.options[selectElement.selectedIndex].value;
  
  var objectNameInput = document.getElementById('input-object-name');
  var objectName = objectNameInput.value;
  
  var colorInput = document.getElementById('color-input');
  var color = colorInput.value;
  
  var objectWidthInput = document.getElementById('input-object-width');
  var objectWidth = Number(objectWidthInput.value);

  var objectHeightInput = document.getElementById('input-object-height');
  var objectHeight = Number(objectHeightInput.value);

  console.log(selectElement);
  console.log('선택된 모양:', selectedOption);
  console.log(objectNameInput);
  console.log('객체 이름:', objectName);
  console.log(colorInput);
  console.log('선택된 색:', color);

  console.log(objectWidth);
  console.log(objectHeight);
  
  layer.add(
    new Konva.Rect({
    x: 100,
    y: 100,
    width: objectWidth,
    height: objectHeight,
    fill: color,
    name: 'object',
    draggable: true,
    }).setAttr('objectName',objectName));

    tr.moveToTop() // tr객체 위로 올려줌
});

var rect = new Konva.Rect({
  x: stage.width() / 2,
  y: stage.height() / 2,
  width: 100,
  height: 100,
  fill: '#563d7c',
  name: 'object',
  draggable: true
});
var rect2 = new Konva.Rect({
  x: stage.width() / 2,
  y: stage.height() / 2,
  width: 100,
  height: 100,
  fill: 'green',
  name: 'object',
  draggable: true
});
var rect3 = new Konva.Rect({
  x: stage.width() / 2,
  y: stage.height() / 2,
  width: 100,
  height: 100,
  fill: 'green',
  name: 'object',
  draggable: true
});
var rect4 = new Konva.Rect({
  x: stage.width() / 2,
  y: stage.height() / 2,
  width: 100,
  height: 100,
  fill: 'green',
  name: 'object',
  draggable: true
});

// add the shape to the layer
layer.add(rect);
layer.add(rect2);
layer.add(rect3);
layer.add(rect4);

// add the layer to the stage
stage.add(layer);



var tr = new Konva.Transformer({
  centeredScaling: true,
  rotationSnaps: [0, 90, 180, 270],
});

layer.add(tr);


// add a new feature, lets add ability to draw selection rectangle
var selectionRectangle = new Konva.Rect({
  fill: 'rgba(0,255,100,0.5)',
  visible: false,
});

layer.add(selectionRectangle);


var x1, y1, x2, y2;
stage.on('mousedown touchstart', (e) => {
  // do nothing if we mousedown on any shape

  if (e.target !== stage) {
    return;
  }
  e.evt.preventDefault();
  x1 = stage.getPointerPosition().x;
  y1 = stage.getPointerPosition().y;
  x2 = stage.getPointerPosition().x;
  y2 = stage.getPointerPosition().y;

  selectionRectangle.visible(true);
  selectionRectangle.width(0);
  selectionRectangle.height(0);
});

stage.on('mousemove touchmove', (e) => {
  // do nothing if we didn't start selection
  if (!selectionRectangle.visible()) {
    return;
  }
  e.evt.preventDefault();
  x2 = stage.getPointerPosition().x;
  y2 = stage.getPointerPosition().y;

  selectionRectangle.setAttrs({
    x: Math.min(x1, x2),
    y: Math.min(y1, y2),
    width: Math.abs(x2 - x1),
    height: Math.abs(y2 - y1),
  });
});

stage.on('mouseup touchend', (e) => {

  // do nothing if we didn't start selection
  if (!selectionRectangle.visible()) {
    return;
  }
  e.evt.preventDefault();
  // update visibility in timeout, so we can check it in click event
  setTimeout(() => {
    selectionRectangle.visible(false);
  });

  var shapes = stage.find('.object');
  var selectBox = selectionRectangle.getClientRect();
  var selected = shapes.filter((shape) =>
    Konva.Util.haveIntersection(selectBox, shape.getClientRect())
  );
  
  
  tr.nodes(selected);
});

// clicks should select/deselect shapes
stage.on('click tap', function (e) {
  // if we are selecting with rect, do nothing
  if (selectionRectangle.visible()) {
    console.log("selectionRectangle visible false1");
    return;
  }

  // if click on empty area - remove all selections
  if (e.target === stage) {
    console.log("selectionRectangle visible false2");
    tr.nodes([]);
    return;
  }

  // do nothing if clicked NOT on our rectangles
  if (!e.target.hasName('object')) {
    console.log("selectionRectangle visible false3");
    console.log(e.target);
    return;
  }
  console.log("selectionRectangle visible true");
  console.log(e.target);

  // do we pressed shift or ctrl?
  const metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
  const isSelected = tr.nodes().indexOf(e.target) >= 0;

  if (!metaPressed && !isSelected) {
    // if no key pressed and the node is not selected
    // select just one
    tr.nodes([e.target]);
  } else if (metaPressed && isSelected) {
    // if we pressed keys and node was selected
    // we need to remove it from selection:

    const nodes = tr.nodes().slice(); // use slice to have new copy of array
    // remove node from array
    nodes.splice(nodes.indexOf(e.target), 1);
    tr.nodes(nodes);
    
  } else if (metaPressed && !isSelected) {
    // add the node into selection
    const nodes = tr.nodes().concat([e.target]);
    tr.nodes(nodes);
  }
});

// 여기서 부터 GUIDLINE

// were can we snap our objects?
function getLineGuideStops(skipShape) {
  // we can snap to stage borders and the center of the stage
  var vertical = [0, stage.width() / 2, stage.width()];
  var horizontal = [0, stage.height() / 2, stage.height()];

  // and we snap over edges and center of each object on the canvas


  stage.find('.object').forEach((guideItem) => {
    if (guideItem === skipShape) {
      return;
    }
    var box = guideItem.getClientRect();
    // and we can snap to all edges of shapes
    vertical.push([box.x, box.x + box.width, box.x + box.width / 2]);
    horizontal.push([box.y, box.y + box.height, box.y + box.height / 2]);
  });
  return {
    vertical: vertical.flat(),
    horizontal: horizontal.flat(),
  };

}


// what points of the object will trigger to snapping?
// it can be just center of the object
// but we will enable all edges and center
function getObjectSnappingEdges(node) {
  var box = node.getClientRect();
  var absPos = node.absolutePosition();

  return {
    vertical: [
      {
        guide: Math.round(box.x),
        offset: Math.round(absPos.x - box.x),
        snap: 'start',
      },
      {
        guide: Math.round(box.x + box.width / 2),
        offset: Math.round(absPos.x - box.x - box.width / 2),
        snap: 'center',
      },
      {
        guide: Math.round(box.x + box.width),
        offset: Math.round(absPos.x - box.x - box.width),
        snap: 'end',
      },
    ],
    horizontal: [
      {
        guide: Math.round(box.y),
        offset: Math.round(absPos.y - box.y),
        snap: 'start',
      },
      {
        guide: Math.round(box.y + box.height / 2),
        offset: Math.round(absPos.y - box.y - box.height / 2),
        snap: 'center',
      },
      {
        guide: Math.round(box.y + box.height),
        offset: Math.round(absPos.y - box.y - box.height),
        snap: 'end',
      },
    ],
  };
}

// find all snapping possibilities
function getGuides(lineGuideStops, itemBounds) {
  var resultV = [];
  var resultH = [];

  lineGuideStops.vertical.forEach((lineGuide) => {
    itemBounds.vertical.forEach((itemBound) => {
      var diff = Math.abs(lineGuide - itemBound.guide);
      // if the distance between guild line and object snap point is close we can consider this for snapping
      if (diff < GUIDELINE_OFFSET) {
        resultV.push({
          lineGuide: lineGuide,
          diff: diff,
          snap: itemBound.snap,
          offset: itemBound.offset,
        });
      }
    });
  });

  lineGuideStops.horizontal.forEach((lineGuide) => {
    itemBounds.horizontal.forEach((itemBound) => {
      var diff = Math.abs(lineGuide - itemBound.guide);
      if (diff < GUIDELINE_OFFSET) {
        resultH.push({
          lineGuide: lineGuide,
          diff: diff,
          snap: itemBound.snap,
          offset: itemBound.offset,
        });
      }
    });
  });

  var guides = [];

  // find closest snap
  var minV = resultV.sort((a, b) => a.diff - b.diff)[0];
  var minH = resultH.sort((a, b) => a.diff - b.diff)[0];
  if (minV) {
    guides.push({
      lineGuide: minV.lineGuide,
      offset: minV.offset,
      orientation: 'V',
      snap: minV.snap,
    });
  }
  if (minH) {
    guides.push({
      lineGuide: minH.lineGuide,
      offset: minH.offset,
      orientation: 'H',
      snap: minH.snap,
    });
  }
  return guides;
}

function drawGuides(guides) {
  guides.forEach((lg) => {
    if (lg.orientation === 'H') {
      var line = new Konva.Line({
        points: [-6000, 0, 6000, 0],
        stroke: 'rgb(0, 161, 255)',
        strokeWidth: 1,
        name: 'guid-line',
        dash: [4, 6],
      });
      layer.add(line);
      line.absolutePosition({
        x: 0,
        y: lg.lineGuide,
      });
    } else if (lg.orientation === 'V') {
      var line = new Konva.Line({
        points: [0, -6000, 0, 6000],
        stroke: 'rgb(0, 161, 255)',
        strokeWidth: 1,
        name: 'guid-line',
        dash: [4, 6],
      });
      layer.add(line);
      line.absolutePosition({
        x: lg.lineGuide,
        y: 0,
      });
    }
  });
}

layer.on('dragmove', function (e) {

  // 만약 여러 객체가 선택되어 있으면 가이드 라인을 그리지 않음
  var selectedNodes = tr.nodes();
  if (selectedNodes.length >= 1) {
    return;
  }
  // clear all previous lines on the screen
  layer.find('.guid-line').forEach((l) => l.destroy());

  // find possible snapping lines
  var lineGuideStops = getLineGuideStops(e.target);
  // find snapping points of current object
  var itemBounds = getObjectSnappingEdges(e.target);
  // now find where can we snap current object
  var guides = getGuides(lineGuideStops, itemBounds);

  // do nothing of no snapping
  if (!guides.length) {
    return;
  }

  drawGuides(guides);

  var absPos = e.target.absolutePosition();
  // now force object position
  guides.forEach((lg) => {
    switch (lg.snap) {
      case 'start': {
        switch (lg.orientation) {
          case 'V': {
            absPos.x = lg.lineGuide + lg.offset;
            break;
          }
          case 'H': {
            absPos.y = lg.lineGuide + lg.offset;
            break;
          }
        }
        break;
      }
      case 'center': {
        switch (lg.orientation) {
          case 'V': {
            absPos.x = lg.lineGuide + lg.offset;
            break;
          }
          case 'H': {
            absPos.y = lg.lineGuide + lg.offset;
            break;
          }
        }
        break;
      }
      case 'end': {
        switch (lg.orientation) {
          case 'V': {
            absPos.x = lg.lineGuide + lg.offset;
            break;
          }
          case 'H': {
            absPos.y = lg.lineGuide + lg.offset;
            break;
          }
        }
        break;
      }
    }
  });
  e.target.absolutePosition(absPos);
});

layer.on('dragend', function (e) {
  // clear all previous lines on the screen
  layer.find('.guid-line').forEach((l) => l.destroy());
});
