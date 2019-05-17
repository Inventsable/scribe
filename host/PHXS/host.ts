// var doc = app.documents[0];

function scanSelection() {
    // if (doc.activeLayer) {
    //     for (var i = 0; i < doc.layers.length; i++) {
    //         var child = doc.layers[i];
    //         if (child == doc.activeLayer)
    //             return `${child.name};${i};${toHex(child.color)}`;
    //     }
    // } else {
    //     return '';
    // }
    // return mirror;
}

function findActiveLayer() {
    // var index;
    // for (var i = 0; i < doc.layers.length; i++) {
    //     var child = doc.layers[i];
    //     if (child == doc.activeLayer) {
    //         index = i;
    //     }
    // }
    // return index;
}

function travelUpLayer() {
    // var index = findActiveLayer();    
    // if (index == doc.layers.length - 1)
    //     index = 0;
    // else
    //     index++;
    // doc.activeLayer = doc.layers[index];
}

function renameActiveLayer(name) {
    // var index = findActiveLayer();
    // doc.layers[index].name = name;
}

function travelDownLayer() {
    // var index = findActiveLayer();
    // if (index == 0)
    //     index = doc.layers.length - 1;
    // else
    //     index--;
    // doc.activeLayer = doc.layers[index];
}

// quickSelect(2)
// function quickSelect(index) {
//     if ((index < doc.layers.length) && (doc.layers[index].pageItems.length)) {
//         doc.layers[index].pageItems[0].selected = true; 
//     }
// }