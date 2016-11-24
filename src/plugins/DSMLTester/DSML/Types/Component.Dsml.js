/**
 * Some description..
 */

// TODO: If there is a base we need to include it here.. !
define(['./_project'  ,'./FCO.Dsml' ], function (Project, FCO) {
    'use strict';

//TODO: Replace all FCO with actual name. !

    /**
     * Initializes a new instance of Component.
     *
     * @class
     * @classdesc This class represents a(n) Component.
     * @property {Project.Component.Attributes} attributes The attributes of the Component.
     * @param {object} node - The wrapped CoreNode object.
     * @constructor
     */
    Project.Component = function (node) {
         FCO.call(this,node);
        // TODO: Add check that core.getBaseType(node) is the correct one.
        if( Project._core.getBaseType(node) !== FCO ){
            throw new TypeError("Wrong Type");
        }
        this._node = node;
        this.attributes = new Project.Component.Attributes(this._node);
    };

    /**
     * Initializes a new instance of Component.Attributes
     *
     * @class
     * @classdesc This class wraps the attributes of Component.
     * @param {object} node - The wrapped CoreNode object of Component.
     * @constructor
     */
    Project.Component.Attributes = function (node) {
        FCO.Attributes.call(this,node);
        this._node = node;
    };


    Project.Component.prototype = Object.create(FCO.prototype);
    Project.Component.prototype.constructor = Project.Component;

    Project.Component.Attributes.prototype = Object.create(FCO.Attributes.prototype);
    Project.Component.Attributes.prototype.constructor = Project.Component.Attributes;


    /**
     * WebGME node object that represents Component type.
     * @type {Object}
     * @static
     */
    Project.Component.Type = null; // Populated at Project.initialize

    /**
     * WebGME node object's meta type ID of Component.
     * @type {string}
     * @static
     */
    Project.Component.ID = "/W";

    /**
     * WebGME node object's meta type GUID of Component.
     * @type {string}
     * @static
     */
    Project.Component.GUID = "a4de4d98-7c27-fcf1-2169-8b9cc1822ce0";

    /**
     * Creates a new Component inside given parent.
     * @returns {Project.Component} The newly created Component.
     * @param {Project.Component} parent Instance where the new Component should be created.
     * @public
     */
    Project.Component.createObj = function (parent) {
        var node = Project._core.createNode({parent: parent._node, base: Project.Component.Type});
        return new Project.Component(node);
    };

    /**
     * Gets the ID of the Component instance.
     * @returns {string} The ID.
     * @public
     */
    Project.Component.prototype.getID = function () {
        return Project._core.getPath(this._node);
    };

    /**
     * Gets the GUID of the Component instance.
     * @returns {string} The GUID.
     * @public
     */
    Project.Component.prototype.getGUID = function () {
        return Project._core.getGuid(this._node);
    };


    /**
     * Gets or sets the attribute name of the Component instance.
     * @param {string} [value] - If defined sets the attribute value to this
     * @returns {string} Currently set name.
     * @public
     */
    Project.Component.Attributes.prototype.name = function (value) {
        if (typeof value !== 'undefined') {
            Project._core.setAttribute(this._node, 'name', value);
        }

        return Project._core.getAttribute(this._node, 'name');
    };

    /**
     * Gets or sets the attribute name of the Component instance.
     * @param {integer} [value] - If defined sets the attribute value to this
     * @returns {string} Currently set name.
     * @public
     */
    Project.Component.Attributes.prototype.id = function (value) {
        if (typeof value !== 'undefined') {
            Project._core.setAttribute(this._node, 'id', value);
        }

        return Project._core.getAttribute(this._node, 'id');
    };


// TODO: Add create children, see UMLStateDiagram.Dsml.js
    Project.Component.prototype.createChildren = function () {
        return Project.Component.createObj(this);
    }

    return Project.Component;
});