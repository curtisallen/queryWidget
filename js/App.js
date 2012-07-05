
//
// Models
// 
var Criteria = Backbone.Model.extend({
      validate: function(attribs) {
        if (attribs.title) {
          if (!_.isString(attribs.title) || attribs.title.length === 0) {
            return 'Title must be a string with a length';
          }
        }
        // check for required fields
        if(!_.isString(attribs.selector)) {
          return "Selector must be a Number"; 
        }
        if(!_.isString(attribs.operator)) {
          return "Operator invalid";
        }
        if(typeof attribs.selectorValue !== "object") {
          return "Selector value has to be array of values";
        }
        // make sure operator is valid
        if(! _.include(['IS', 'IS EQUAL', 'IS NOT', 'IS IN THE RANGE'], attribs.operator)) {
          return "Invalid operator must be in set ['IS', 'IS EQUAL', 'IS NOT', 'IS IN THE RANGE']";
        }
      },
      
      defaults: {
        "selectors": [{"selector": "SELECTOR1"}, {"selector": "SELECTOR2"}, {"selector": "SELECTOR3"}, {"selector": "SELECTOR4"}, {"selector": "SELECTOR5"}],
        "operators": [{"operator": "IS"}, {"operator": "IS NOT"}, {"operator": "IS EQUAL"}, {"operator": "IS IN THE RANGE"}],
        "values": 1,
        "createValueText": function(){
            return function(text, render) {
                var output = '';
                for (i=0; i<parseInt(text); i++){
                    output = output + '<input class="input-small span1 mininum" type="text"/>';
                }
                return output;
            }
        }
        }
    });

var QueryCollection = Backbone.Collection.extend({
  model: Criteria
});

// 
// Views
//
var QueryView = Backbone.View.extend({
  initialize: function(args) {
    _.bindAll(this, 'operatorChange', 'valueChange');
    this.model.bind('operator:change', this.operatorChange);
    this.model.bind('value:change', this.valueChange);
  },

  events: {
    'change .operator': 'operatorChange',
    'blur .mininum': 'valueChange'
  },

  render: function() {
    var template = $('#queryCriteria').html();
    var context = _.extend(this.model.toJSON(), {cid: this.model.cid});
    $(this.el).html(Mustache.to_html(template, context));
    return this;
  },

  operatorChange: function() {
    var selectedOption = this.$('.operator option:selected').text();
    // if RANGE term selected add another text box
    if(selectedOption === 'IS IN THE RANGE') {
      //this.$('.criteria').append('<input type="text" class="input-small span1 maxRange" placeholder="Max"/>');
      //this.$('.mininum').replaceWith('<input type="text" class="input-small span1 minimum" placeholder="Min"/>');
      //console.log(app);
      app.navigate("criteria/modify/" + this.model.cid, {trigger:  true});
    } else { // make sure there is a single text box
      //this.$('.maxRange').remove();
    }
    //this.$('.operator').onChange(console.log("Operator clicked!"));
  },

  valueChange: function() {
     console.log("Value Changed");
  }
 
});

//
// Application model
//
var CloudQueryAppModel = Backbone.Model.extend({
  initialize: function() {
    this.queryCondition = new QueryCollection();
  }
});

var CloudQueryAppView = Backbone.View.extend({
  initialize: function() {
    _.bindAll(this, "addCriteria", "removeCriteria" /*,"addSet", "removeSet"*/);
    this.model.queryCondition.bind('add', this.addCriteria);
    this.model.queryCondition.bind('remove', this.removeCriteria);

  },

  render: function() {
    var template = $('#queryBuilder').html();
    $(this.el).html(Mustache.to_html(template, this.model.toJSON()));
    this.criteriaList = this.$('#criteriaList');
    return this;
  },

  addCriteria: function(criteria) {
    var view = new QueryView({model: criteria});
    this.criteriaList.append(view.render().el);
  },

  removeCriteria: function(criteria) {
    this.$('#criteria_'+criteria.cid).remove();
  }
});

var CloudQueryAppRouter = Backbone.Router.extend({ //(Backbone.js 0.5.3, use Router instead of Controller)
  initialize: function(params) {
    this.model = new CloudQueryAppModel();
    this.view = new CloudQueryAppView({model: this.model});
    params.append_at.append(this.view.render().el);
  },

  routes: {
    "criteria/add": "add",
    "criteria/remove/:number": "remove",
    "criteria/modify/:number": "modifyCriteria"
  },

  add: function() {
    app.model.queryCondition.add(new Criteria());
    this.navigate('criteria'); // reset location so we can trigger again (Backbone.js 0.5.3, use navigate instead of saveLocation)
  },

  remove: function(cid) {
    app.model.queryCondition.remove(app.model.queryCondition.getByCid(cid));
  },
  
  modifyCriteria: function(cid) {
    console.log("I see this cid: " + cid);  
    var modified = app.model.queryCondition.getByCid(cid);
    modified.set({values: 2});
    //app.model.queryCondition.set(modified);
  }
});
$(function() {
      var QueryApp = new CloudQueryAppRouter({append_at: $('body')});
      window.app = QueryApp;
      Backbone.history.start();
      app.model.queryCondition.add(new Criteria());
});
