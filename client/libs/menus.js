var csInterface = new CSInterface();
// var isFlipped = false;

var menu_FlyoutXML = '<Menu> \
  <MenuItem Id="refresh" Label="Refresh panel" Enabled="true" Checked="false"/> \
</Menu>';
// \
// <MenuItem Label="---" /> \
// \

csInterface.setPanelFlyoutMenu(menu_FlyoutXML);
csInterface.addEventListener("com.adobe.csxs.events.flyoutMenuClicked", setPanelCallback);


function setPanelCallback(event) {
  if (event.data.menuId == "refresh") {
    location.reload();
  }
}

// var menu_ContextXML = '<Menu> \
//    <MenuItem Id="refresh" Label="Refresh panel" Enabled="true" Checked="false"/> \
//    <MenuItem Id="width" Label="Check width" Enabled="true" Checked="false"/> \
//    <MenuItem Id="resize" Label="Resize" Enabled="true" Checked="false"/> \
//    <MenuItem Label="---" /> \
//   </Menu>';

// csInterface.setContextMenu(menu_ContextXML, setContextMenuCallback);

// function setContextMenuCallback(event) {
//   if (event == "refresh") {
//     location.reload();
//   } else if (event == "width") {
//     alert(window.innerWidth);
//   } else if (event === 'resize') {
//     // csInterface.resizeContent(200, 200)
//   } else {
//     console.log(event);
//   }
// }
