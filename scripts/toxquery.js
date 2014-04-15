/* toxquery.js - Universal query widget, that can work with any kit (study or dataset) inside
 *
 * Copyright 2012-2014, IDEAconsult Ltd. http://www.ideaconsult.net/
 * Created by Ivan Georgiev
**/

var jToxQuery = (function () {
  var defaultSettings = { // all settings, specific for the kit, with their defaults. These got merged with general (jToxKit) ones.
    autoInitialize: true,
    dom: {
      kit: null, // ... here.
      widgets: {},
    },

    configuration: {
      // this is the main thing to be configured
      handlers: { }
    }
  };
  
  var cls = function (root, settings) {
    var self = this;
    self.rootElement = root;
    self.handlers = {};
    jT.$(root).addClass('jtox-toolkit'); // to make sure it is there even when manually initialized
    
    self.settings = jT.$.extend(true, {}, defaultSettings, jT.settings, settings);
    self.mainKit = null;
    
    jT.$('.jtox-handler', root)
    .on('change', function (e) {
      var handler = self.settings.configuration.handlers[jT.$(this).data('handler')];
      if (!!handler)
        ccLib.fireCallback(handler, this, this, self);
      else
        console.log("jToxError: referring unknown handler: " + jT.$(this).data('handler'));
    })
    .each(function() {
      self.handlers[jT.$(this).data('handler')] = this;
    });
    
    if (!self.settings.autoInitialize)
      return;
      
    jT.$('.jtox-toolkit', self.rootElement).each(function () {
      if (jT.$(this).hasClass('jtox-widget'))
        self.settings.dom.widgets[jT.$(this).data('kit')] = this;
      else 
        self.settings.dom.kit = this;
    });
  };
  
  cls.prototype = {
    addHandlers: function (handlers) {
      self.settings.configuration.handlers = jT.$.extend(self.settings.configuration.handlers, handlers);
    },
    
    element: function (handler) {
      return this.handlers[handler];
    },
    
    widget: function (name) {
      return this.settings.dom.widgets[name];
    },
    
    kit: function () {
      if (!this.mainKit)
        this.mainKit = jT.kit(this.settings.dom.kit);
        
      return this.mainKit;
    }
  }; // end of prototype
  
  cls.queryKit = function(element) {
    var query = null;
    jT.$(element).parents().each(function() {
      var kit = jT.kit(this);
      if (!kit)
        return;
      if (kit instanceof jToxQuery)
        query = kit;
    });
    
    return query;
  };
  
  return cls;
})();

/* Now comes the jToxSearch component, which implements the compound searching block
*/
var jToxSearch = (function () {
  var defaultSettings = { // all settings, specific for the kit, with their defaults. These got merged with general (jToxKit) ones.
    configuration: {
      handlers: {
        onSearchBox: function (el, query) {
          
        },
      }
    }
  };
  
  var cls = function (root, settings) {
    var self = this;
    self.rootElement = root;
    jT.$(root).addClass('jtox-toolkit'); // to make sure it is there even when manually initialized
    
    self.settings = jT.$.extend({}, defaultSettings, jT.settings, settings);
    self.rootElement.appendChild(jT.getTemplate('#jtox-search'));
    self.searchBox = jT.$('.search-box', self.rootElement)[0];
    self.queryKit = jToxQuery.queryKit(self.rootElement);
    
    var form = jT.$('form', self.rootElement)[0];
    form.onsubmit = function () { return false; }

    jT.$('.jq-buttonset', root).buttonset();
    var onTypeClicked = function () {
      form.searchbox.placeholder = jT.$(this).data('placeholder');
      jT.$('.search-pane .dynamic').addClass('hidden');
      jT.$('.search-pane .' + this.id).removeClass('hidden');
    };
    
    jT.$('.jq-buttonset input', root).on('change', onTypeClicked);
    ccLib.fireCallback(onTypeClicked, jT.$('.jq-buttonset input', root)[0]);
    
  };
  
  cls.prototype = {
    
  }; // end of prototype
  
  return cls;
})();
