/*globals define*/
/*jshint node:true, browser:true*/

/**
 * Generated by PluginGenerator 1.7.0 from webgme on Thu Nov 17 2016 21:03:00 GMT-0600 (Central Standard Time).
 * A plugin that inherits from the PluginBase. To see source code documentation about available
 * properties and methods visit %host%/docs/source/PluginBase.html.
 */

define([
    'plugin/PluginConfig',
    'text!./metadata.json',
    'plugin/PluginBase',
    './DSML/DSML'
], function (
    PluginConfig,
    pluginMetadata,
    PluginBase,
    DSML) {
    'use strict';

    pluginMetadata = JSON.parse(pluginMetadata);

    /**
     * Initializes a new instance of DSMLTester.
     * @class
     * @augments {PluginBase}
     * @classdesc This class represents the plugin DSMLTester.
     * @constructor
     */
    var DSMLTester = function () {
        // Call base class' constructor.
        PluginBase.call(this);
        this.pluginMetadata = pluginMetadata;
    };

    /**
     * Metadata associated with the plugin. Contains id, name, version, description, icon, configStructue etc.
     * This is also available at the instance at this.pluginMetadata.
     * @type {object}
     */
    DSMLTester.metadata = pluginMetadata;

    // Prototypical inheritance from PluginBase.
    DSMLTester.prototype = Object.create(PluginBase.prototype);
    DSMLTester.prototype.constructor = DSMLTester;

    /**
     * Main function for the plugin to execute. This will perform the execution.
     * Notes:
     * - Always log with the provided logger.[error,warning,info,debug].
     * - Do NOT put any user interaction logic UI, etc. inside this method.
     * - callback always has to be called even if error happened.
     *
     * @param {function(string, plugin.PluginResult)} callback - the result callback
     */
    DSMLTester.prototype.main = function (callback) {
        // Use self to access core, project, result, logger etc from PluginBase.
        // These are all instantiated at this point.
        var self = this,
            nodeObject;


        // Using the logger.
        // self.logger.debug('This is a debug message.');
        // self.logger.info('This is an info message.');
        // self.logger.warn('This is a warning message.');
        // self.logger.error('This is an error message.');

        // Using the coreAPI to make changes.

        nodeObject = self.activeNode;


        // This will save the changes. If you don't want to save;
        // exclude self.save and call callback directly from this scope.
        self.loadNodes(self.rootNode)
            .then(function (nodes) {
                var dsmlNode,
                    rootObj;

                rootObj = DSML.initialize(self.core, nodes, self.META, self.rootNode);
                dsmlNode = new DSML.System(self.activeNode);

                //self.logger.info(rootObj.childrenPaths);

                self.logger.info();
                //self.logger.info('ROOT', self.core.getOwnChildrenPaths(rootObj));

                // self.logger.info('nodeObject', self.core.getAttribute(nodeObject, 'name'));
                // self.logger.info('activeNode', self.core.getAttribute(self.activeNode, 'name'));

                //System
                self.logger.info('name: ', dsmlNode.attributes.name());
                self.logger.info('ID', dsmlNode.getID());
                self.logger.info('GUID', dsmlNode.getGUID());
                self.logger.info('Type', self.core.getAttribute(self.core.getBase(self.activeNode), 'name'));
                self.logger.info('reliability', dsmlNode.attributes.reliability());
                self.logger.info('scalability', dsmlNode.attributes.scalability())
                self.logger.info('isTop', dsmlNode.attributes.isTop());
                self.logger.info('isSafe', dsmlNode.attributes.isSafe());
                //self.logger.info('children', dsmlNode.getBambino());





                self.result.setSuccess(true);
                callback(null, self.result);
            })
            .catch(function (err) {
                // Result success is false at invocation.
                self.logger.error(err.stack);
                callback(err, self.result);
            });

    };


    //load Nodes
    DSMLTester.prototype.loadNodes = function (node) {
        var self = this;
        return self.core.loadSubTree(node)
            .then(function (nodeArr) {
                var nodes = {},
                    i;
                for (i = 0; i < nodeArr.length; i += 1) {
                    nodes[self.core.getPath(nodeArr[i])] = nodeArr[i];
                }
                return nodes;
            });
    };

    return DSMLTester;
});
