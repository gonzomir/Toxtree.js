/* toxquery.js - Universal query widget, that can work with any kit (study or compound) inside
 *
 * Copyright 2012-2014, IDEAconsult Ltd. http://www.ideaconsult.net/
 * Created by Ivan Georgiev
**/

var jToxQuery = (function () {
  var defaultSettings = { // all settings, specific for the kit, with their defaults. These got merged with general (jToxKit) ones.
    scanDom: true,
    initialQuery: false,
    dom: {
      kit: null, // ... here.
      widgets: {},
    },

    configuration: {
      // this is the main thing to be configured
      handlers: { 
        query: function (e, query) { query.query(); },
      }
    }
  };
  
  var cls = function (root, settings) {
    var self = this;
    self.rootElement = root;
    jT.$(root).addClass('jtox-toolkit'); // to make sure it is there even when manually initialized
    
    self.settings = jT.$.extend(true, {}, defaultSettings, jT.settings, settings);
    self.mainKit = null;
        
    if (self.settings.scanDom) {
      jT.$('.jtox-toolkit', self.rootElement).each(function () {
        if (jT.$(this).hasClass('jtox-widget'))
          self.settings.dom.widgets[jT.$(this).data('kit')] = this;
        else 
          self.settings.dom.kit = this;
      });
    }

    self.initHandlers();
    // finally, wait a bit for everyone to get initialized and make a call, if asked to
    if (!!self.settings.initialQuery)
      setTimeout(function () { self.query(); }, 200);
  };
  
  cls.prototype = {
    addHandlers: function (handlers) {
      self.settings.configuration.handlers = jT.$.extend(self.settings.configuration.handlers, handlers);
    },
    
    widget: function (name) {
      return this.settings.dom.widgets[name];
    },
    
    kit: function () {
      if (!this.mainKit)
        this.mainKit = jT.kit(this.settings.dom.kit);
        
      return this.mainKit;
    },
    
    initHandlers: function () {
      var self = this;
      var fireHandler = function (e) {
        var handler = self.settings.configuration.handlers[jT.$(this).data('handler')];
        if (!!handler)
          ccLib.fireCallback(handler, this, e, self);
        else
          console.log("jToxQuery: referring unknown handler: " + jT.$(this).data('handler'));
      };
      
      jT.$(document).on('change', 'input.jtox-handler', fireHandler);
      jT.$(document).on('click', 'button.jtox-handler', fireHandler);
    },
    
    /* Perform the actual query, traversing all the widgets and asking them to
    alter the given URL, then - makes the call */
    query: function () {
      var uri = this.settings.service || '';
      for (var w in this.settings.dom.widgets) {
        var widget = jT.kit(this.settings.dom.widgets[w]);
        if (!widget) 
          console.log("jToxError: the widget [" + w + "] is not recognized: ignored");
        else if (!widget['modifyUri'])
          console.log("jToxError: the widget [" + w + "] doesn't have 'modifyUri' method: ignored");
        else
          uri = widget.modifyUri(uri);
      }
      
      if (!!uri)
        this.kit().query(uri);
    }
  }; // end of prototype
  
  return cls;
})();

/* Now comes the jToxSearch component, which implements the compound searching block
*/
var jToxSearch = (function () {
  var defaultSettings = { // all settings, specific for the kit, with their defaults. These got merged with general (jToxKit) ones.
    defaultSmiles: '50-00-0',
    smartsList: 'funcgroups',
    configuration: {
      handlers: { }
    }
  };
  
  var queries = {
    'auto': "/query/compound/search/all",
    'url': "/query/compound/url/all",
    'similarity': "/query/similarity",
    'smarts': "/query/smarts"
  };
  
  var cls = function (root, settings) {
    var self = this;
    self.rootElement = root;
    jT.$(root).addClass('jtox-toolkit'); // to make sure it is there even when manually initialized
    
    self.settings = jT.$.extend({}, defaultSettings, jT.settings, settings);
    self.rootElement.appendChild(jT.getTemplate('#jtox-search'));
    self.queryKit = jT.parentKit(jToxQuery, self.rootElement);
    
    self.search = { mol: "", type: ""};
    
    var form = jT.$('form', self.rootElement)[0];
    form.onsubmit = function () { return false; }

    var radios = jT.$('.jq-buttonset', root).buttonset();
    var onTypeClicked = function () {
      form.searchbox.placeholder = jT.$(this).data('placeholder');
      jT.$('.search-pane .dynamic').addClass('hidden');
      jT.$('.search-pane .' + this.id).removeClass('hidden');
    };
    
    jT.$('.jq-buttonset input', root).on('change', onTypeClicked);
    ccLib.fireCallback(onTypeClicked, jT.$('.jq-buttonset input', root)[0]);
    
    jT.$(form.searchbox)
    .on('focus', function () {
      var gap = jT.$(form).width() - jT.$(radios).width() - 30 - jT.$('.search-pane').width();
      var oldSize = $(this).width();
      jT.$(this).css('width', '' + (oldSize + gap) + 'px');
    })
    .on('blur', function () {
      jT.$(this).css('width', '');
    })
    .on('change', function () { // when we change the value here - all, possible MOL caches should be cleared.
      if (this.value.indexOf('http') > -1)
        self.setURL();
      else
        self.setAuto();
    });
    
    // spend some time to setup the SMARTS groups
    if (!!window[self.settings.smartsList]) {
      var list = window[self.settings.smartsList];
      var familyList = [];
      var familyIdx = {};
      
      for (var i = 0, sl = list.length; i < sl; ++i) {
        var entry = list[i];
        if (familyIdx[entry.family] === undefined) {
          familyIdx[entry.family] = familyList.length;
          familyList.push([]);
        }

        familyList[familyIdx[entry.family]].push(entry);        
      }
      
      // now we can iterate over them
      var df = document.createDocumentFragment();
      for (fi = 0, fl = familyList.length; fi < fl; ++fi) {
        var grp = document.createElement('optgroup');
        grp.label = familyList[fi][0].family;

        for (i = 0, el = familyList[fi].length; i < el; ++i) {
          var e = familyList[fi][i];
          var opt = document.createElement('option');
          opt.innerHTML = e.name;
          opt.value = e.smarts;
          if (!!e.hint)
            jT.$(opt).attr('data-hint', e.hint);
          grp.appendChild(opt);
        }
        df.appendChild(grp);
      }
      
      // now it's time to add all this and make the expected behavior
      form.smarts.appendChild(df);
      form.smarts.firstElementChild.checked = true;
      
      jT.$(form.smarts).on('change', function () {
        var hint = jT.$(this[this.selectedIndex]).data('hint');
        form.smarts.title = (!!hint ? hint : '');
        self.setAuto(this.value);
      });
    }
    
    // Now, deal with KETCHER - make it show, attach handlers to/from it, and handlers for showing/hiding it.
    var ketcherBox = jT.$('.ketcher', root)[0];
    var ketcherReady = false;
    var onKetcher = function (service, method, async, parameters, onready) {
      if (service == "knocknock")
        onready("You are welcome!", null);
      else
        jT.call(self.queryKit.kit(), '/ui/' + service, {dataType: "text", data: parameters}, function (res, jhr) { onready(res, jhr); });
    };
    
    var ensureKetcher = function () {
      if (!ketcherReady) {
        jT.insertTool('ketcher', ketcherBox);
        ketcher.init({ root: ketcherBox, ajaxRequest: onKetcher });
        
        var emptySpace = jT.$('.toolEmptyCell', ketcherBox)[0];
        jT.$(emptySpace.appendChild(jT.getTemplate('#ketcher-usebutton'))).on('click', function () {
          var smiles = ketcher.getSmiles();
          var mol = ketcher.getMolfile();
          self.setMol(mol);
          if (!!smiles)
            form.searchbox.value = smiles;
        });
        jT.$(emptySpace.appendChild(jT.getTemplate('#ketcher-drawbutton'))).on('click', function () {
          ketcher.setMolecule(self.search.mol || form.searchbox.value);
        });
        ketcherReady = true;
      }
    };
    
    jT.$(form.drawbutton).on('click', function () { 
      if (jT.$(ketcherBox).hasClass('shrinken')) {
        ensureKetcher();
        jT.$(ketcherBox).css('display', '');
      }
      else
        setTimeout(function () { jT.$(ketcherBox).css('display', 'none'); }, 500);

      setTimeout(function () { jT.$(ketcherBox).toggleClass('shrinken') }, 50);
    });

    // finally - parse the URL-passed parameters and setup the values appropriately.
    if (!!self.settings.b64search) {
      self.setMol($.base64.decode(self.settings.b64search));
    }
    else if (!!self.settings.search) {
      if (self.settings.search.indexOf('http') > -1)
        self.setURL(self.settings.search);
      else
        self.setAuto(self.settings.search);
    }
  };
  
  cls.prototype = {
    // required from jToxQuery - this is how we add what we've collected
    modifyUri: function (uri) {
      var form = jT.$('form', this.rootElement)[0];
      var params = { type: this.search.type };
      var type = jT.$('input[name="searchtype"]:checked', form).val();
      
      if (type == "auto" && params.type == 'url')
        type = "url";
        
      var res = queries[type] + (uri.indexOf('?') > -1 ? '' : '?') + uri;

      if (!!this.search.mol) {
        params.b64search = $.base64.encode(this.search.mol);
      }
      else {
        params.search = form.searchbox.value;
        if (!params.search)
          params.search = this.settings.defaultSmiles;
          this.setAuto(params.search);
      }
        
      if (type == 'similarity')
        params.threshold = form.threshold.value;
      
      return ccLib.addParameter(res, $.param(params));
    },
    
    // some shortcuts for outer world.
    makeQuery: function (needle) {
      if (!!needle) 
        this.setAuto(needle);
      this.queryKit.query();
    },
    
    getNeedle: function () {
      return this.search.type == 'mol' ? this.search.mol : jT.$('form', this.rootElement)[0].searchbox.value;
    },
    
    setAuto: function (needle) {
      this.search.mol = null;
      this.search.type = 'auto';

      var box = jT.$('form', this.rootElement)[0].searchbox;
      if (!!this.search.oldplace)
        box.placeholder = this.search.oldplace;
      if (needle != null)
        box.value = needle;
    },
    
    setMol: function (mol) {
      var box = jT.$('form', this.rootElement)[0].searchbox;
      this.search.mol = mol;
      this.search.type = 'mol';
      this.search.oldplace = box.placeholder;
      
      box.placeholder = "MOL formula saved_";
      box.value = '';
    },
    
    setURL: function (url) {
      this.search.mol = null;
      this.search.type = 'url';
      var box = jT.$('form', this.rootElement)[0].searchbox;

      if (!!this.search.oldplace)
        box.placeholder = this.search.oldplace;
        
      if (url != null)
        box.value = url;
    }
  }; // end of prototype
  
  return cls;
})();
