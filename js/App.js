
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
      }
    });

var QueryCollection = Backbone.Collection.extend({
  model: Criteria
});

var QuerySet = Backbone.Collection.extend({
  model: QueryCollection
});
// 
// Views
//
var QueryView = Backbone.View.extend({
  initialize: function(args) {
    _.bindAll(this, 'changeTitle', 'operatorChange');
    this.model.bind('change:title', this.changeTitle);
    this.model.bind('operator:change', this.operatorChange);
  },

  events: {
    'click .title': 'handleTitleClick',
    'change .operator': 'operatorChange'
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
      this.$('.criteria').append('<input type="text" class="input-small span1 maxRange" />');
    } else { // make sure there is a single text box
      this.$('.maxRange').remove();
    }
    //this.$('.operator').onChange(console.log("Operator clicked!"));
  },

  changeTitle: function() {
    this.$('.title').text(this.model.get('title'));
  },

  handleTitleClick: function() {
    alert('you clicked the title: '+this.model.get('title'));
  }
});

//
// Application model
//
var CloudQueryAppModel = Backbone.Model.extend({
  initialize: function() {
    this.queryCondition = new QueryCollection();
    //this.querySet = new QuerySet();
  }
});

var CloudQueryAppView = Backbone.View.extend({
  initialize: function() {
    _.bindAll(this, "addCriteria", "removeCriteria" /*,"addSet", "removeSet"*/);
    this.model.queryCondition.bind('add', this.addCriteria);
    this.model.queryCondition.bind('remove', this.removeCriteria);

    //this.model.querySet.bind('add', this.addSet);
    //this.model.querySet.bind('add', this.removeSet);
  },

  render: function() {
    var template = '\
      <!--h1>Cloud Query Widget</h1-->\
      <ul id="criteriaList" class="unstyled"></ul>';
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
  },

  add: function() {
    app.model.queryCondition.add(new Criteria({
      selectors: [{"selector": "SELECTOR1"}, {"selector": "SELECTOR2"}, {"selector": "SELECTOR3"}, {"selector": "SELECTOR4"}, {"selector": "SELECTOR5"}],
      operators: [{"operator": "IS"}, {"operator": "IS NOT"}, {"operator": "IS EQUAL"}, {"operator": "IS IN THE RANGE"}]
      })
    );
    //app.model.queryCondition.add(defaultCriteria);
    this.navigate('criteria'); // reset location so we can trigger again (Backbone.js 0.5.3, use navigate instead of saveLocation)
  },

  remove: function(cid) {
    app.model.queryCondition.remove(app.model.queryCondition.getByCid(cid));
  },
});
$(function() {
      var QueryApp = new CloudQueryAppRouter({append_at: $('body')});
      window.app = QueryApp;
      Backbone.history.start();

      var defaultCriteria = new Criteria({
      selectors: [{"selector": "SELECTOR1"}, {"selector": "SELECTOR2"}, {"selector": "SELECTOR3"}, {"selector": "SELECTOR4"}, {"selector": "SELECTOR5"}],
      operators: [{"operator": "IS"}, {"operator": "IS NOT"}, {"operator": "IS EQUAL"}, {"operator": "IS IN THE RANGE"}]
      });

      app.model.queryCondition.add(defaultCriteria);
});
