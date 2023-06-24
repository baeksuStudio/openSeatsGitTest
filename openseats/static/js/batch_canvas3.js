const stage = new Konva.Stage({
  container: 'container',
  width: window.innerWidth,
  height: window.innerHeight,
});

const layer = new Konva.Layer();
stage.add(layer);

// generate random shapes
for (var i = 0; i < 10; i++) {
  const shape = new Konva.Circle({
    x: Math.random() * stage.width(),
    y: Math.random() * stage.height(),
    radius: Math.random() * 30 + 5,
    fill: Konva.Util.getRandomColor(),
    draggable: true,
    // each shape MUSH have uniq name
    // so we can easily update the preview clone by name
    name: 'shape-' + i,
  });
  layer.add(shape);
}

function updatePreview() {
  const scale = 1 / 4;
  // use pixelRatio to generate smaller preview
  const url = stage.toDataURL({ pixelRatio: scale });
  document.getElementById('preview').src = url;
}

// update preview only on dragend for performance
stage.on('dragend', updatePreview);

// add new shapes on double click or double tap
stage.on('dblclick dbltap', () => {
  const shape = new Konva.Circle({
    x: stage.getPointerPosition().x,
    y: stage.getPointerPosition().y,
    radius: Math.random() * 30 + 5,
    fill: Konva.Util.getRandomColor(),
    draggable: true,
    // each shape MUSH have uniq name
    // so we can easily update the preview clone by name
    name: 'shape-' + layer.children.length,
  });
  layer.add(shape);

  updatePreview();
});

// show initial preview
updatePreview();