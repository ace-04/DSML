/*globals define*/
/*jshint node:true, browser:true*/

/**
 * Generated by PluginGenerator 1.7.0 from webgme on Tue Nov 08 2016 11:35:44 GMT-0600 (Central Standard Time).
 * A plugin that inherits from the PluginBase. To see source code documentation about available
 * properties and methods visit %host%/docs/source/PluginBase.html.
 */

define([
    'q',
    'common/util/ejs',
    'plugin/PluginBase',
    'text!./metadata.json',
    'text!./_project.ejs',
    'text!./DSML.ejs',
    'text!./MetaType.ejs'
], function (Q,
             ejs,
             PluginBase,
             pluginMetadata,
             PROJECT_TEMPLATE,
             DSML_TEMPLATE,
             META_TYPE_TEMPLATE) {
    'use strict';

    var DEBUG_OUTPUT_DIR = './src/plugins/DSMLTester/',
        IS_DEBUG = typeof window === 'undefined' && process.env.WRITE_FILES;

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
            metaMap = {};   //constructed metaMap


        // PM: It is good practise to define all variables at the top in javascript.
        // Keep in mind there is no block scope in javascript only function scope.

        nodeObject = self.activeNode;

        // PM: metaNode is a badly chosen variable name - metaName is better..
        for (var metaName in self.META) {
            //prints metaNodes to info logger
            //self.logger.info(metaNode);
            metaMap[metaName] = self.getMetaInfo(self.META[metaName]);
           // self.logger.info(JSON.stringify(metaName));
        }

        //print map
        //self.printMap(metaMap);


        var templates = self.getFiles(metaMap);
        //self.printMap(templates);

        self.artifact = self.blobClient.createArtifact('dsmlAPI');

        self.saveFiles(templates)
            .then(function () {
                return self.artifact.save();
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
            metaObj = {},
            temp,
            baseNode,
            childNode,
            childContainment = {},
            pathMap = {};


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

        baseNode = self.core.getBase(meta);

        temp = self.core.getJsonMeta(meta);


        //TODO: Children should be an array objects with info about the META-nodes that can be contained. !
        // {name: <metaName>, isAbstract: <true/false>}
        //self.logger.info(temp.children.items);
        var n = 0;
        for (var v=0; v < temp.children.items.length; v +=1) {
            childContainment[v]  = {
                childName: self.core.getAttribute(meta, 'name'),
                childPath: temp.children.items[v],
                isAbstract: self.core.isAbstract(meta)
            };
            n = n + 1;
            pathMap[temp.children.items[v]] = self.core.getAttribute(meta, 'name');

        };

        //self.logger.info(JSON.stringify(childContainment));

        metaObj = {
            name: self.core.getAttribute(meta, 'name'),
            base: baseNode ? self.core.getAttribute(baseNode, 'name') : null,
            location: {
                path: self.core.getPath(meta),
                relid: self.core.getRelid(meta),
                guid: self.core.getGuid(meta)
            },
            attr: temp.attributes,
            children: temp.children.items, // childContainment, //
            numChildren: n,
            pointers: temp.pointers,
            pathMap : self.getPathMap(self.META,childContainment)
        };


        //TODO: Convert integer and float to number (but keep info that it is an integer/float. !
        //self.logger.info(JSON.stringify(metaObj.attr));
        for (var x in metaObj.attr) {
            //self.logger.info(metaObj.attr[x].type);
            if (metaObj.attr[x].type === "float" || metaObj.attr[x].type === "integer") {
                metaObj.attr[x] = {type: "number"};
            }
        }


        //self.getPathMap(self.META,childContainment);

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

    DSMLApiGenerator.prototype.getPathMap = function (META, childContainment) {
        var self = this,
            pathMap = {};

        for (var metaName in META) {
            var meta = META[metaName];
            var name = self.core.getAttribute(meta, 'name');
            var path = self.core.getPath(meta);
            pathMap[path] = name;
            //self.logger.info(path, pathMap[path], name);
        };

        //self.logger.info(childContainment.childName);
       // self.logger.info('loop',children.childName, chilsdren.childPath);
        //self.logger.info(JSON.stringify(childContainment.childName), JSON.stringify(childContainment.path));
            return pathMap;
    };


    DSMLApiGenerator.prototype.getFiles = function (metaNodeInfo) {
        var self = this,
            templates = {},
            metaName;

        // N.B. The second arugment to render is an object. Inside the template code all keys
        // are available as variables in the scope of the template.
        templates['DSML/Types/_project.js'] = ejs.render(PROJECT_TEMPLATE, {META: self.META});
        templates['DSML/DSML.js'] = ejs.render(DSML_TEMPLATE, {META: metaNodeInfo});

        for (metaName in metaNodeInfo) {
            templates['DSML/Types/' + metaName + '.Dsml.js'] = ejs.render(META_TYPE_TEMPLATE, metaNodeInfo[metaName]);
        }

        return templates;
    };

    DSMLApiGenerator.prototype.saveFiles = function (templates) {
        var self = this,
            fs,
            rimraf;

        if (IS_DEBUG) {
            rimraf = require('rimraf');
            fs = require('fs');
            return Q.nfcall(rimraf, DEBUG_OUTPUT_DIR + 'DSML')
                .then(function () {
                    var promises = [];

                    if (!fs.existsSync(DEBUG_OUTPUT_DIR + 'DSML')) {
                        fs.mkdirSync(DEBUG_OUTPUT_DIR + 'DSML');
                    }

                    if (!fs.existsSync(DEBUG_OUTPUT_DIR + 'DSML/Types')) {
                        fs.mkdirSync(DEBUG_OUTPUT_DIR + 'DSML/Types');
                    }

                    for (var fName in templates) {
                        promises.push(self.saveFile(fName, templates[fName]));
                    }

                    return Q.all(promises);
                });
        } else {
            return self.artifact.addFiles(templates);
        }
    };

    DSMLApiGenerator.prototype.saveFile = function (fName, content) {
        var self = this,
            fs;

        if (IS_DEBUG) {
            fs = require('fs');
            return Q.ninvoke(fs, 'writeFile', DEBUG_OUTPUT_DIR + fName, content);
        } else {
            return self.artifact.addFile(fName, content);
        }
    };

    return DSMLApiGenerator;
});
