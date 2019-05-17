var csInterface = new CSInterface();
loadUniversalJSXLibraries();
loadJSX(csInterface.hostEnvironment.appName + '/host.jsx');
window.Event = new Vue();

Vue.component('app', {
  template: `
    <div class="appGrid" @mouseover="wakeApp" @mouseout="sleepApp">
      <event-manager></event-manager>
      <scanner></scanner>
      <scribe></scribe>
    </div>
  `,
  data() {
    return {
      showFoot: false,
    }
  },
  methods: {
    wakeApp(evt) {
      this.$root.wake();
    },
    sleepApp(evt) {
      this.$root.sleep();
      Event.$emit('clearMods');
    }
  }
})

Vue.component('scribe', {
  template: `
    <div v-if="!hide" class="texter">
      <div class="label" :style="'background-color: ' + label"></div>
      <input
        v-if="showPrefix"
        ref="prefix"
        :class="isWake ? 'texter-prefix' : 'texter-prefix-idle'"
        v-model="prefix" 
        placeholder="prefix"/>
      <input 
        ref="input"
        :class="isWake ? 'texter-input' : 'texter-idle'"
        @keyup.enter="submitTest(msg)" 
        @keyup.tab="autocomplete(placeholder)"
        v-model="msg" 
        :placeholder="placeholder"/>
      <input
        v-if="showSuffix"
        ref="suffix"
        :class="isWake ? 'texter-prefix' : 'texter-prefix-idle'"
        v-model="suffix" 
        placeholder="suffix"/>
    </div>
  `,
  data() {
    return {
      prefix: '',
      label: '',
      suffix: '',
      hide: false,
      msg: '',
      index: 0,
      placeholder: 'layer name',
      activeLayer: [],
      total: [],
    }
  },
  methods: {
    getText(evt) {
      console.log(evt)
    },
    travelUp() {
      // console.log('Travelling up...')
      csInterface.evalScript(`travelUpLayer()`);
    },
    travelDown() {
      // console.log('Travelling down...')
      csInterface.evalScript(`travelDownLayer()`);
    },
    updateSelection(layer) {
      // console.log(layer);
      this.activeLayer = layer;
      this.placeholder = layer[0];
      this.index = layer[1];
      this.label = layer[2];
      if (!this.$root.isWake)
        this.clearFocus();
    },
    getClass() {
      var style = ''
      if (this.$root.isWake) {
        style = 'texter-input';
      } else {
        style = 'texter-idle';
      }
      return style;
    },
    setFocus() {
      this.$nextTick(() => this.$refs.input.focus());
      // this.checkPosition();
    },
    clearFocus() {
      this.$nextTick(() => this.$refs.input.blur());
      // this.checkPosition();
    },
    submitTest(msg) {
      if (msg.length) {
        console.log(`Rename current layer to ${msg}`)
        this.msg = '';
        csInterface.evalScript(`renameActiveLayer('${msg}')`)
        this.travelUp();
      } else {
        this.travelUp();
      }
      // Event.$emit('recheckSelection')
    },
    autocomplete() {
      console.log(`Autocomplete ${msg} => ${placeholder}`)
    },
    clearScribe() {
      this.msg = '';
    }
  },
  computed: {
    isWake: function() {
      return this.$root.isWake;
    },
    showPrefix: function() {
      return this.$root.showPrefix;
    },
    showSuffix: function() {
      return this.$root.showSuffix;
    }
    // placeholder: function () {
    //   return `layer name`;
    // }
  },
  mounted() {
    Event.$on('showTexter', this.displayTexter);
    Event.$on('clearScribe', this.clearScribe);
    Event.$on('clearScribe', this.clearScribe);
    Event.$on('updateSelection', this.updateSelection);
    Event.$on('TravelUp', this.travelUp);
    Event.$on('TravelDown', this.travelDown);
    Event.$on('suffixToggle', this.toggleSuffix);
    Event.$on('prefixToggle', this.togglePrefix);
  }
})

Vue.component('scanner', {
  template: `
    <div class="visualizerScanning"></div>
  `,
  data() {
    return {
      isScanning: false,
      lastSelection: [],
      timer: {
        selection: null,
      },
    }
  },
  methods: {
    selectionRead(msg) {
      // msg is CSV of pageItem.index
      if (msg !== this.lastSelection) {
        console.log(msg);
        var result = [];
        if (!/./.test(msg)) {
          result = [];
          console.log(`Empty values`);
        } else if (/\;/.test(msg)) {
          result = msg.split(';');
          // Event.$emit('updateSelection', result)
          // console.log(`Values are CSV`);
        }
        this.lastSelection = msg;
        Event.$emit('updateSelection', result)
      }
    },
    selectionCheck() {
      var self = this;
      // console.log(this.$root.activeApp)
      if (this.$root.activeApp == 'ILST' || 'AEFT')
        csInterface.evalScript(`scanSelection()`, self.selectionRead)
    },
    scanSelection(state) {
      var self = this;
      if (state)
        this.timer.selection = setInterval(self.selectionCheck, 250);
    },
    stopSelectionScan() {
      clearInterval(this.timer.selection);
    },
    toggleSelectionScan(e) {
      console.log('World?')
      this.isScanning = !this.isScanning;
      if (this.isScanning) {
        console.log('Currently scanning...')
        this.scanSelection(this.isScanning);
      } else {
        console.log('Not currently scanning')
        this.stopSelectionScan();
      }
      // console.log(`Selection is ${this.isScanning}`);
    },
    toggleScans() {
      console.log('Hello?')
      this.toggleSelectionScan()
      if (!this.isScanning) {
        this.stopSelectionScan();
      }
    },
  },
  mounted() {
    var self = this;
    Event.$on('stopSelectionScan', self.stopSelectionScan);
    Event.$on('startSelectionScan', self.startSelectionScan);
    this.toggleScans();
  }
})

Vue.component('event-manager', {
  template: `
    <div 
      v-mousemove-outside="onMouseOutside"
      v-keydown-outside="onKeyDownOutside"
      v-keyup-outside="onKeyUpOutside"
      v-click-outside="onClickOutside"
      class="visualizerModKeys" 
      :style="'grid-template-columns: repeat(' + this.activeList.length + ', 1fr);'">
      <div v-for="modKey in activeList"></div>
    </div>
  `,
  data() {
    return {
      activeList: [
        { name: 'Ctrl' },
        { name: 'Shift' },
        { name: 'Alt' },
      ],
      Shift: false,
      Ctrl: false,
      Alt: false,
    }
  },
  mounted() {
    var self = this;
    this.activeMods();
  },
  methods: {
    activeMods() {
      var mirror = [], child = {};
      if (this.Ctrl) {
        child = { name: 'Ctrl', key: 0 }
        mirror.push(child);
      }
      if (this.Shift) {
        child = { name: 'Shift', key: 1 }
        mirror.push(child);
      }
      if (this.Alt) {
        child = { name: 'Alt', key: 2 }
        mirror.push(child);
      }
      this.activeList = mirror;
    },
    clearMods() {
      this.Shift = false, this.Alt = false, this.Ctrl = false;
      this.activeList = [];
    },
    updateMods() {
      this.Ctrl = this.$root.Ctrl, this.Shift = this.$root.Shift, this.Alt = this.$root.Alt;
      this.activeMods();
    },
    onMouseOutside(e, el) {
      this.$root.parseModifiers(e);
    },
    onClickOutside(e, el) {
      if (this.$root.showCrosshair) {
        Event.$emit('setMarker');
      }
    },
    onKeyDownOutside(e, el) {
      this.$root.parseModifiers(e);
    },
    onKeyUpOutside(e, el) {
      if (e.key == 'ArrowDown') {
        Event.$emit('TravelUp');
      } else if (e.key == 'ArrowUp') {
        Event.$emit('TravelDown');
      }
      this.$root.parseModifiers(e);
    },
  },
  computed: {
    isDefault: function () { return this.$root.isDefault },
  },
})

var app = new Vue({
  el: '#app',
  data: {
    macOS: false,
    panelWidth: 100,
    panelHeight: 200,
    showPrefix: true,
    showSuffix: true,
    persistent: true,
    // storage: window.localStorage,
    activeApp: csInterface.hostEnvironment.appName,
    activeTheme: 'darkest',
    isWake: false,
    Shift: false,
    Ctrl: false,
    Alt: false,
    context: {
      menu: [
        { id: "refresh", label: "Refresh panel", enabled: true, checkable: false, checked: false, },
        // { id: "persistent", label: "Persistent Y/N", enabled: true, checkable: true, checked: true, },
        { label: "---" },
        { id: "prefix", label: "Show prefix", enabled: true, checkable: true, checked: true, },
        { id: "suffix", label: "Show suffix", enabled: true, checkable: true, checked: true, },
        { label: "---" },
        {
          id: "autocorrect", label: "Autocorrect copies", menu: [
            { id: "isauto", label: "Autocorrecting", enabled: true, checkable: true, checked: true, },
            { label: "---" },
            { id: "sequence", label: "As sequence", enabled: true, checkable: true, checked: true, ingroup: true },
            { id: "blank", label: "Leave blank", enabled: true, checkable: true, checked: false, ingroup: true } ]
        },
      ],
    },
  },
  computed: {
    menuString: function () { return JSON.stringify(this.context); },
    isDefault: function () {
      var result = true;
      if ((this.Shift) | (this.Ctrl) | (this.Alt))
        result = false;
      return result;
    },
  },
  mounted: function () {
    var self = this;
    if (navigator.platform.indexOf('Win') > -1) { this.macOS = false; } else if (navigator.platform.indexOf('Mac') > -1) { this.macOS = true; }
    // this.startStorage();
    this.readStorage();
    this.setContextMenu();
    this.handleResize(null);
    window.addEventListener('resize', this.handleResize);
    Event.$on('modsUpdate', self.parseModifiers);
    Event.$on('updateStorage', self.updateStorage);
    csInterface.addEventListener('documentAfterActivate', self.reset);
    csInterface.addEventListener('applicationActive', self.activate);
    csInterface.addEventListener(CSInterface.THEME_COLOR_CHANGED_EVENT, self.appThemeChanged);
    this.appThemeChanged();
  },
  methods: {
    reset() {
      location.reload();
      // console.log('reset');
    },
    activate() {
      console.log('activated');
    },
    togglePrefix(state) {
      // console.log(`Receiving state of prefix as ${state}`)
      this.showPrefix = state;
    },
    toggleSuffix(state) {
      // console.log(`Receiving state of suffix as ${state}`)
      this.showSuffix = state;
    },
    startStorage(storage) {
      storage.setItem('contextmenu', JSON.stringify(this.context.menu));
      storage.setItem('persistent', JSON.stringify(false));
      // storage.setItem('theme', 'darkest');
      storage.setItem('prefix', this.showPrefix);
      storage.setItem('suffix', this.showSuffix);
    },
    readStorage() {
      var storage = window.localStorage;
      if (!storage.length) {
        console.log('There was no pre-existing session data');
        // this.startStorage();
        // storage.setItem('appName', self.activeApp);
      } else {
        console.log('Detected previous session data');
        this.context.menu = JSON.parse(storage.getItem('contextmenu'));
        this.persistent = JSON.parse(storage.getItem('persistent'));
        // this.activeTheme = storage.getItem('theme');
        // this.activeApp = storage.getItem('appName');
        // this.showPrefix = storage.getItem('prefix');
        // this.showSuffix = storage.getItem('suffix');
      }
      this.showPrefix = this.context.menu[2].checked;
      this.showSuffix = this.context.menu[3].checked;
      // if (!this.showPrefix)
      console.log(`${this.showPrefix} : ${this.showSuffix}`);
    },
    updateStorage() {
      var storage = window.localStorage, self = this;
      storage.setItem('contextmenu', JSON.stringify(self.context.menu));
      storage.setItem('persistent', JSON.stringify(self.persistent));
      storage.setItem('theme', self.activeTheme);
      // storage.setItem('appName', self.activeApp);
      console.log(`Updating local storage:
        Persistent: ${this.persistent}
        Theme: ${this.activeTheme}`)
    },
    appThemeChanged(event) {
      var skinInfo = JSON.parse(window.__adobe_cep__.getHostEnvironment()).appSkinInfo;
      this.findTheme(skinInfo);
      console.log(`Theme changed to ${this.activeTheme}`);
      this.updateStorage();
    },
    findTheme(appSkin) {
      // AE uses smooth gradients. Isolate the others apps from it
      if ((this.activeApp == 'ILST') || (this.activeApp == 'PHXS')) {
        if (toHex(appSkin.panelBackgroundColor.color) == '#f0f0f0') {
          this.activeTheme = 'lightest';
          if (this.activeApp == 'ILST') {
            this.setCSS('color-scroll', '#fbfbfb');
            this.setCSS('color-scroll-thumb', '#dcdcdc');
            this.setCSS('color-scroll-thumb-hover', '#a6a6a6');
          } else if (this.activeApp == 'PHXS') {
            this.setCSS('color-scroll', '#e3e3e3');
            this.setCSS('color-scroll-thumb', '#bdbdbd');
            this.setCSS('color-scroll-thumb-hover', '#bdbdbd');
          }
        } else if (toHex(appSkin.panelBackgroundColor.color) == '#b8b8b8') {
          this.activeTheme = 'light';
          if (this.activeApp == 'ILST') {
            this.setCSS('color-scroll', '#c4c4c4');
            this.setCSS('color-scroll-thumb', '#a8a8a8');
            this.setCSS('color-scroll-thumb-hover', '#7b7b7b');
          } else if (this.activeApp == 'PHXS') {
            this.setCSS('color-scroll', '#ababab');
            this.setCSS('color-scroll-thumb', '#858585');
            this.setCSS('color-scroll-thumb-hover', '#858585');
          }
        } else if (toHex(appSkin.panelBackgroundColor.color) == '#535353') {
          this.activeTheme = 'dark';
          if (this.activeApp == 'ILST') {
            this.setCSS('color-scroll', '#4b4b4b');
            this.setCSS('color-scroll-thumb', '#606060');
            this.setCSS('color-scroll-thumb-hover', '#747474');
          } else if (this.activeApp == 'PHXS') {
            this.setCSS('color-scroll', '#4a4a4a');
            this.setCSS('color-scroll-thumb', '#696969');
            this.setCSS('color-scroll-thumb-hover', '#696969');
          }
        } else if (toHex(appSkin.panelBackgroundColor.color) == '#323232') {
          this.activeTheme = 'darkest';
          if (this.activeApp == 'ILST') {
            this.setCSS('color-scroll', '#2a2a2a');
            this.setCSS('color-scroll-thumb', '#383838');
            this.setCSS('color-scroll-thumb-hover', '#525252');
          } else if (this.activeApp == 'PHXS') {
            this.setCSS('color-scroll', '#292929');
            this.setCSS('color-scroll-thumb', '#474747');
            this.setCSS('color-scroll-thumb-hover', '#474747');
          }
        }
        this.setCSS('color-bg', toHex(appSkin.panelBackgroundColor.color));
        this.setCSS('color-ui-hover', this.getCSS('color-scroll'));
        if (this.activeApp == 'ILST') {
          this.setCSS('scroll-radius', '20px');
          this.setCSS('thumb-radius', '10px');
        } else {
          this.setCSS('scroll-radius', '1px');
          this.setCSS('thumb-width', '8px');
        }
      } else {
        console.log('This is an After Effects theme');
        this.activeTheme = 'gradient';
        this.setCSS('color-bg', toHex(appSkin.panelBackgroundColor.color));
        this.setCSS('color-ui-hover', toHex(appSkin.panelBackgroundColor.color, -10));
        this.setCSS('color-scroll', toHex(appSkin.panelBackgroundColor.color, -20));
        this.setCSS('color-scroll-thumb', toHex(appSkin.panelBackgroundColor.color));
        this.setCSS('color-scroll-thumb-hover', toHex(appSkin.panelBackgroundColor.color, 10));
        this.setCSS('scroll-radius', '20px');
        this.setCSS('thumb-width', '10px');
      }
    },
    findMenuItemParentById(id) {
      var result;
      for (var i = 0; i < this.context.menu.length; i++) {
        for (let [key, value] of Object.entries(this.context.menu[i])) {
          if (key == "menu") {
            for (var v = 0; v < value.length; v++) {
              // console.log(value[v])
              for (let [index, data] of Object.entries(value[v])) {
                // console.log(`${index} : ${data}`)
                if ((index == "id") && (data == id))
                  result = this.context.menu[i];
              }
            }
          }
          if ((key == "id") && (value == id)) {
            result = this.context.menu[i];
          }
        }
      }
      return result;
    },
    findMenuItemById(id) {
      var result;
      for (var i = 0; i < this.context.menu.length; i++) {
        for (let [key, value] of Object.entries(this.context.menu[i])) {
          if (key == "menu") {
            for (var v = 0; v < value.length; v++) {
              for (let [index, data] of Object.entries(value[v])) {
                if ((index == "id") && (data == id))
                  result = value[v];
              }
            }
          }
          if ((key == "id") && (value == id)) {
            result = this.context.menu[i];
          }
        }
      }
      return result;
    },
    toggleMenuItemSiblings(parent, exclude, state) {
      if (parent.length) {
        for (var i = 0; i < parent.length; i++) {
          if (parent[i].id !== exclude)
            console.log(`Should turn ${parent[i].id} to ${state}`)
            csInterface.updateContextMenuItem(parent[i].id, true, state);
        }
      }
    },
    setContextMenu() {
      var self = this;
      csInterface.setContextMenuByJSON(self.menuString, self.contextMenuClicked);
      csInterface.updateContextMenuItem('persistent', true, self.persistent);
    },
    contextMenuClicked(id) {
      var target = this.findMenuItemById(id), mirror;
      var parent = this.findMenuItemParentById(id);
      if ((target.checkable) && (target.ingroup) && (!target.checked)) {
        console.log(`${target.id} is ${target.checked}`)
        this.toggleMenuItemSiblings(parent.menu, target.id, target.checked);
        target.checked = !target.checked;
        console.log(`${target.id} is ${target.checked}`)
        csInterface.updateContextMenuItem(target.id, true, target.checked);
      } else if ((target.checkable) && (target.ingroup) && (target.checked)) {
        console.log('Already checked');
        csInterface.updateContextMenuItem(id, true, true);
      } else {
        target.checked = !target.checked;
        // target.checked = true;
      }
      if (target.id == this.context.menu[5].menu[0].id) {
        mirror = this.context.menu[5].menu[0];
        mirror.checked = target.checked;
        this.context.menu[5].menu[1].checked = !target.checked;
        // console.log('This is by sequence')
      } else if (target.id == this.context.menu[5].menu[1].id) {
        mirror = this.context.menu[5].menu[1];
        mirror.checked = target.checked;
        this.context.menu[5].menu[0].checked = !target.checked;
        // console.log('This is blank')
      }
      if (id == 'refresh')
        location.reload();
      if (id == 'suffix'||'prefix') {
        // Event.$emit(`${target.id}Toggle`, target.checked)
        if (id == 'suffix') {
          this.toggleSuffix(target.checked);
        } else {
          this.togglePrefix(target.checked);
        }
      }
      console.log(target)
      this.updateStorage();
    },
    handleResize(evt) {
      if (this.$root.activeApp == 'AEFT') {
        // console.log(`w: ${this.panelWidth}, h: ${this.panelHeight}`);
        this.panelHeight = document.documentElement.clientHeight;
        // this.setPanelCSS();
        console.log(evt);
      } else {
        this.panelWidth = document.documentElement.clientWidth;
        this.panelHeight = document.documentElement.clientHeight;
        this.setPanelCSS();
      }
    },
    flushModifiers() {
      this.Ctrl = false;
      this.Shift = false;
      this.Alt = false;
      Event.$emit('clearMods');
    },
    parseModifiers(evt, key=null) {
      // console.log(evt)
      var lastMods = [this.Ctrl, this.Shift, this.Alt]
      if (this.isWake) {
        if (((!this.macOS) && (evt.ctrlKey)) || ((this.macOS) && (evt.metaKey))) {
          this.Ctrl = true;
        } else {
          this.Ctrl = false;
        }
        if (evt.shiftKey)
          this.Shift = true;
        else
          this.Shift = false;
        if (evt.altKey) {
          evt.preventDefault();
          this.Alt = true;
        } else {
          this.Alt = false;
        };
        var thisMods = [this.Ctrl, this.Shift, this.Alt]
        if (!this.isEqualArray(lastMods, thisMods)) {

          console.log(`${thisMods} : ${lastMods}`)
        }
        // Event.$emit('updateModsUI');
      } else {
        Event.$emit('clearMods');
      }
    },
    flushModifiers() {
      this.Ctrl = false;
      this.Shift = false;
      this.Alt = false;
      Event.$emit('clearMods');
    },
    wake() {
      this.isWake = true;
    },
    sleep() {
      this.isWake = false;
      this.flushModifiers();
    },
    testCS(evt) {
      this.cs.evalScript(`alert('${evt}')`)
    },
    setPanelCSS() {
      this.setCSS('panel-height', `${this.panelHeight - 10}px`);
      // this.setCSS('panel-width', `${this.panelWidth}px`);
    },
    getCSS(prop) {
      return window.getComputedStyle(document.documentElement).getPropertyValue('--' + prop);
    },
    setCSS(prop, data) {
      document.documentElement.style.setProperty('--' + prop, data);
    },
    isEqualArray(array1, array2) {
      array1 = array1.join().split(','), array2 = array2.join().split(',');
      var errors = 0, result;
      for (var i = 0; i < array1.length; i++) {
        if (array1[i] !== array2[i])
          errors++;
      }
      if (errors > 0)
        result = false;
      else
        result = true;
      return result;
    },
    removeEmptyValues(keyList, mirror = []) {
      // console.log(keyList);
      for (var i = 0; i < keyList.length; i++) {
        var targ = keyList[i];
        if ((/\s/.test(targ)) || (targ.length < 6)) {
          // console.log('Empty');
        } else {
          mirror.push(targ);
        }
      }
      return mirror;
    },
    removeDuplicatesInArray(keyList) {
      try {
        var uniq = keyList
          .map((name) => {
            return { count: 1, name: name }
          })
          .reduce((a, b) => {
            a[b.name] = (a[b.name] || 0) + b.count
            return a
          }, {})
        var sorted = Object.keys(uniq).sort((a, b) => uniq[a] < uniq[b])
      } catch (err) {
        sorted = keyList
      } finally {
        return sorted;
      }
    },
  }
});

// Vue.component('test-btn', {
//   props: ['label'],
//   template: `
//     <div
//       class="btn"
//       @click="runTest(label)">
//       {{label}}
//     </div>
//   `,
//   methods: {
//     runTest: function(e) {
//       var targ = this.$root.compi, self = this;
//       try {
//         if (/run/.test(e))
//           csInterface.evalScript(`kickstart()`, self.recolor)
//         else if (/color/.test(e))
//           csInterface.evalScript(`colorcode()`, this.$root.getNames)
//         else if (/reset/.test(e))
//           csInterface.evalScript(`displayColorLabels()`)
//         else
//           csInterface.evalScript(`${e}()`)
//           // console.log('nothing happened');
//       } catch(err) {
//         console.log(err.data);
//       } finally {
//         console.log(`Ran ${e}`);
//       }
//     },
//     recolor: function(e) {
//       var targ = this.$root.compi;
//       csInterface.evalScript(`colorcode()`, this.$root.getNames)
//     }
//   }
// })

// Vue.component('test-toolbar', {
//   template: `
//     <div class="testToolbar">
//       <test-btn label="run"></test-btn>
//       <test-btn label="color"></test-btn>
//       <test-btn label="reset"></test-btn>
//     </div>
//   `,
// })
