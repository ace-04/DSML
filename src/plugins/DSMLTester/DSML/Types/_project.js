define([], function () {
    // TODO: Consider adding more methods here.
    // For instance a wrapped rootNode could be help-full.

    var Project = function () {
    };

    Project.initialize = function (core, nodes, META, rootNode) {
        var name;

        for (name in META) {
            if (Project.hasOwnProperty(name)) {
                Project[name].Type = META[name];
            } else {
                Project[name] = {};
                Project[name].Type = META[name];
            }
        }

        Project._core = core;
        Project._nodes = nodes;

        // TODO: Create Project.ROOT and return with it
        return new Project.ROOT(rootNode, META);
    };

    //TODO: fill in similar to MetaType

    /**
    * Initializes a new instance of Project.ROOT.Children
    *
    * @class
    * @classdesc This class wraps the attributes of ROOT
    * @param {object} node - The wrapped CoreNode object of Project.ROOT.
    * @constructor
    */
    Project.ROOT = function (node, META) {
        var name;
        this.Children = new Project.ROOT.Children(node, META);
    };

    /**
    * Initializes a new instance of Project.ROOT.Children
    *
    * @class
    * @classdesc This class wraps the children of Project.ROOT
    * @param {object} node - The wrapped CoreNode object of Project.ROOT
    * @constructor
    */
    Project.ROOT.Children = function (node, META) {
        this._node = node;
    };


    // get id


    // get guid

    // For each meta-type add
    //JS DOC
    Project.ROOT.Children.prototype.FCO = function () {
    // TODO: get all children (core) nodes and match with Project.MetaType
    // Filter out based on dsmlNode instanceof Project.FCO.

    }


    return Project;
});