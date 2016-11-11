/*globals define*/
/*jshint node:true, browser:true*/

/**
 * Generated by PluginGenerator 1.7.0 from webgme on Tue Nov 08 2016 11:35:44 GMT-0600 (Central Standard Time).
 * A plugin that inherits from the PluginBase. To see source code documentation about available
 * properties and methods visit %host%/docs/source/PluginBase.html.
 */

define([
    'common/util/ejs',
    'plugin/PluginBase',
    'text!./metadata.json',
    'text!./_project.ejs',
    'text!./DSML.ejs',
    'text!./MetaType.ejs'
], function (ejs,
             PluginBase,
             pluginMetadata,
             PROJECT_TEMPLATE,
             DSML_TEMPLATE,
             META_TYPE_TEMPLATE) {
    'use strict';

    pluginMetadata = JSON.parse(pluginMetadata);

    /**
     * Initializes a new instance of DSMLApiGenerator.
     * @class
     * @augments {PluginBase}
     * @classdesc This class represents the plugin DSMLApiGenerator.
     * @constructor
     */
    var DSMLApiGenerator = function () {
        // Call base class' constructor.
        PluginBase.call(this);
        this.pluginMetadata = pluginMetadata;
    };

    /**
     * Metadata associated with the plugin. Contains id, name, version, description, icon, configStructue etc.
     * This is also available at the instance at this.pluginMetadata.
     * @type {object}
     */
    DSMLApiGenerator.metadata = pluginMetadata;

    // Prototypical inheritance from PluginBase.
    DSMLApiGenerator.prototype = Object.create(PluginBase.prototype);
    DSMLApiGenerator.prototype.constructor = DSMLApiGenerator;

    /**
     * Main function for the plugin to execute. This will perform the execution.
     * Notes:
     * - Always log with the provided logger.[error,warning,info,debug].
     * - Do NOT put any user interaction logic UI, etc. inside this method.
     * - callback always has to be called even if error happened.
     *
     * @param {function(string, plugin.PluginResult)} callback - the result callback
     */
    DSMLApiGenerator.prototype.main = function (callback) {
        // Use self to access core, project, result, logger etc from PluginBase.
        // These are all instantiated at this point.
        var self = this,
            nodeObject,
            metaNodeInfoJson, // object containing metaInfo
            metaMap = {},   //constructed metaMap
            children,
            attr,
            pointers;


        // PM: It is good practise to define all variables at the top in javascript.
        // Keep in mind there is no block scope in javascript only function scope.

        nodeObject = self.activeNode;

        // PM: metaNode is a badly chosen variable name - metaName is better..
        for (var metaName in self.META) {

            //prints metaNodes to info logger
            //self.logger.info(metaNode);

            // PM: All this business can go inside getMetaInfo
            //path = self.core.getPath(self.META[metaName]);
            //relid = self.core.getRelid(self.META[metaName]);
            //guid = self.core.getGuid(self.META[metaName]);
            metaNodeInfoJson = self.getMetaInfo(self.META[metaName]);

            /**
             * in obj there are:
             * children
             * minItems
             * maxItems
             * attributes
             * pointers
             * aspects
             * constraints
             **/

            attr = metaNodeInfoJson["attributes"];
            children = metaNodeInfoJson["children"].items;
            pointers = metaNodeInfoJson["pointers"];

            //self.logger.info(JSON.stringify(metaNodeInfoJson))

            // PM: And add it directly here.
            metaMap[metaName] = {
                name: metaName,
                attr: attr,
                path: metaNodeInfoJson["location"].path,
                relid: metaNodeInfoJson["location"].relid,
                guid: metaNodeInfoJson["location"].guid,
                children: children,
                pointers: pointers,
            };
        }

        //print map
        self.printMap(metaMap);

        var templates = self.getFiles(metaMap);
        self.printMap(templates);

        var artifact = self.blobClient.createArtifact('dsmlAPI');

        artifact.addFiles(templates)
            .then(function () {
                return artifact.save();
            })
            .then(function (artifactHash) {
                self.result.addArtifact(artifactHash);
                self.result.setSuccess(true);
                callback(null, self.result);
            })
            .catch(function (err) {
                self.logger.error(err.stack);
                // Result success is false at invocation.
                callback(err, self.result);
            });

    };

    DSMLApiGenerator.prototype.getMetaInfo = function (meta) {
        var self = this,
            metaObj,
            location = {};

        metaObj = self.core.getJsonMeta(meta);
        metaObj.location = {
            path: self.core.getPath(meta),
            relid: self.core.getRelid(meta),
            guid: self.core.getGuid(meta)
        };
        return metaObj;
    };


    /**
     * prints map of metaNodes
     **/
    DSMLApiGenerator.prototype.printMap = function (metaMap) {
        var self = this,
            mapStr = JSON.stringify(metaMap, null, 2);

        self.logger.info(mapStr);
    };

    DSMLApiGenerator.prototype.getFiles = function (metaNodeInfo) {
        var templates = {},
            metaName;

        // N.B. The second arugment to render is an object. Inside the template code all keys
        // are available as variables in the scope of the template.
        templates['DSML/Types/_project.js'] = ejs.render(PROJECT_TEMPLATE, {});
        templates['DSML/API.js'] = ejs.render(PROJECT_TEMPLATE, {names: Object.keys(metaNodeInfo)});

        for (metaName in metaNodeInfo) {
            templates['DSML/Types/' + metaName + '.Dsml.js'] = ejs.render(META_TYPE_TEMPLATE, metaNodeInfo[metaName]);
        }

        return templates;
    };

    return DSMLApiGenerator;
});
