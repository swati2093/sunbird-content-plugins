const path = require('path');
const webpack = require('webpack');
const glob = require('glob');
const uglifyjs = require('uglify-js');
const expose = require('expose-loader');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const baseConfig = require('./webpack.base.config')
const fs = require('fs');
const entryPlus = require('webpack-entry-plus');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const frameWork =  baseConfig[process.env.frameWork];
console.log(frameWork);

// const frameworkPlugins = process.env.frameworkCorePlugins.split(',').map(function (item) {
//     return item.trim();
// });

// Object.defineProperty(RegExp.prototype, "toJSON", {
//     value: RegExp.prototype.toString
// });

let commonConfig =   {
    pluginBasePath: './',
    pluginBundlePath: '/editor/plugin.dist.js',
    packageFileName: 'coreplugins.js',
    outputPath: './app/scripts',
    externalFiles: [
        './app/scripts/coreplugins.js',
    ]
}

let entryFiles = []

function getEntryFiles() {
    entryFiles = [{ 
            entryFiles: packagePlugins(frameWork.corePlugins),
            outputName: commonConfig.packageFileName,
        },
        {
            entryFiles: packageVendorCss(frameworkPlugins),
            outputName: 'plugin-vendor',
        },
    ];
    entryFiles = entryFiles.filter(function(item){
        return item.entryFiles.length !== 0;
    });    
    return entryPlus(entryFiles);
}

function packagePlugins(plugins) {
    let pluginPackageArr = []; // Default coreplugin
    plugins.forEach(function (plugin) {
        let dependenciesArr = [];
        let packagedDepArr = [];
        let manifest = JSON.parse(fs.readFileSync(`${commonConfig.pluginBasePath}${plugin}/manifest.json`))
        let manifestURL = `${commonConfig.pluginBasePath}${plugin}/manifest.json`;        
        let pluginContent = fs.readFileSync(`${commonConfig.pluginBasePath}${plugin}/editor/plugin.js`, 'utf8');  
        let isSetLoadNgModule = commonConfig.hasOwnProperty('replaceLoadNgModule');
        let isSetRegisterMeta = commonConfig.hasOwnProperty('replaceRegisterMeta');  
        let isSetBreadCrumb = commonConfig.hasOwnProperty('replaceBreadCrumb');      
        if (fs.existsSync(`${commonConfig.pluginBasePath}${plugin}${commonConfig.pluginBundlePath}`)) {
            fs.unlinkSync(`${commonConfig.pluginBasePath}${plugin}${commonConfig.pluginBundlePath}`);
        }
        commonConfig.replaceEndComma =  (typeof commonConfig.replaceEndComma === 'string') ? new RegExp(commonConfig.replaceEndComma, '') : new RegExp(commonConfig.replaceEndComma);
        if (manifest.editor.views && pluginContent) {
            let controllerPathArr = [];
            let templatePathArr = [];
            manifest.editor.views.forEach(function (obj, i) {
                controllerPathArr[i] = (obj.controller) ? `require("${obj.controller}")` : undefined;
                templatePathArr[i] = (obj.template) ? `require("${obj.template}")` : undefined;
            });
            let count = 0;
            let matchLoadNgModule = pluginContent.match(commonConfig.replaceLoadNgModule);
            let matchRegisterMeta = pluginContent.match(commonConfig.replaceRegisterMeta);
            let matchBreadCrumb = pluginContent.match(commonConfig.replaceBreadCrumb);
            if (matchLoadNgModule !== null && isSetLoadNgModule) {
                commonConfig.replaceLoadNgModule =  (typeof commonConfig.replaceLoadNgModule === 'string') ? new RegExp(commonConfig.replaceLoadNgModule, 'g') : new RegExp(commonConfig.replaceLoadNgModule, 'g');            
                pluginContent = uglifyjs.minify(pluginContent.replace(commonConfig.replaceLoadNgModule, function ($0) {
                    let dash;                    
                    dash = `loadNgModules(${templatePathArr[count]},${controllerPathArr[count]}, true)`
                    count++;
                    return dash;
                }))
            }
            else if (matchBreadCrumb !== null && isSetBreadCrumb) {
                commonConfig.replaceBreadCrumb =  (typeof commonConfig.replaceBreadCrumb === 'string') ? new RegExp(commonConfig.replaceBreadCrumb, 'g') : new RegExp(commonConfig.replaceLoadNgModule, 'g');            
                pluginContent = uglifyjs.minify(pluginContent.replace(commonConfig.replaceLoadNgModule, function ($0) {
                    let dash;  
                    dash = `registerBreadCrumb({templateURL:${templatePathArr[count]}, controllerURL:${controllerPathArr[count]}, allowTemplateCache: true})`
                    count++;
                    return dash;
                }))
            } else if (matchRegisterMeta !== null && isSetRegisterMeta) {
                commonConfig.replaceRegisterMeta =  (typeof commonConfig.replaceRegisterMeta === 'string') ? new RegExp(commonConfig.replaceRegisterMeta, 'g') : new RegExp(commonConfig.replaceRegisterMeta, 'g');
                pluginContent = uglifyjs.minify(pluginContent.replace(commonConfig.replaceRegisterMeta, function ($1, $2, $3) {
                    let dash;                    
                    dash = `registerMetaPage({${$3}, templateURL: ${templatePathArr[count]}, controllerURL: ${controllerPathArr[count]}, allowTemplateCache: true})`
                    count++;
                    return dash;
                }));
            } else {
                pluginContent = uglifyjs.minify(pluginContent);
            }

        } else {
            pluginContent = uglifyjs.minify(pluginContent);
        }

        if (manifest.editor.dependencies) {

            manifest.editor.dependencies.forEach(function (obj, i) {
                if (obj.type === "js") {
                    dependenciesArr[i] = fs.readFileSync(`${commonConfig.pluginBasePath}${plugin}/${obj.src}`, 'utf8');
                }
            });
        }        
        dependenciesArr.push(`org.ekstep.pluginframework.pluginManager.registerPlugin(${JSON.stringify(manifest)}, ${pluginContent.code.replace(commonConfig.replaceEndComma, "")})`)
        fs.appendFile(`${commonConfig.pluginBasePath}${plugin}${commonConfig.pluginBundlePath}`, [...dependenciesArr].join("\n"))
        pluginPackageArr.push(`${commonConfig.pluginBasePath}${plugin}${commonConfig.pluginBundlePath}`)
    })
    if(commonConfig.externalFiles.length>0) pluginPackageArr.push(...commonConfig.externalFiles) // external files then only push    
    return pluginPackageArr;
}

function packageVendorCss(plugins) {
    let cssDependencies = [];
    plugins.forEach(function (plugin) {
        let manifest = JSON.parse(fs.readFileSync(`${plugin}/manifest.json`));
        if (manifest.editor.dependencies) {
            manifest.editor.dependencies.forEach(function (dep) {
                if (dep.type == "css") {
                    cssDependencies.push(`${commonConfig.pluginBasePath}${plugin}/${dep.src}`)
                }
            })
        };
    })
    return cssDependencies;
}

module.exports = {

    entry: getEntryFiles(),

    output: {
        filename: '[name]',
        path: path.resolve(__dirname, commonConfig.outputPath),
    },
    resolve: {
        alias: {
            'jquery': path.resolve('./node_modules/jquery/dist/jquery.js'),
            'angular': path.resolve('./node_modules/angular/angular.js'),
            'iziToast': path.resolve('./node_modules/izitoast/dist/js/iziToast.min.js'),
            'clipboard': path.resolve('./node_modules/clipboard/dist/clipboard.min.js'),
            'E2EConverter': path.resolve(`${commonConfig.pluginBasePath}org.ekstep.viewecml-1.0/editor/libs/src/converter.js`),
            'xmlbuilder': path.resolve('./node_modules/xmlbuilder/lib/index.js'),
            'spectrum': path.resolve('./node_modules/spectrum-colorpicker/spectrum.js'),
            'X2JS': path.resolve(`${commonConfig.pluginBasePath}org.ekstep.assessmentbrowser-1.1/editor/libs/xml2json.js`)
        }
    },
    module: {
        rules: [{
                test: require.resolve(`${commonConfig.pluginBasePath}org.ekstep.viewecml-1.0/editor/libs/src/converter.js`),
                use: [{
                    loader: 'expose-loader',
                    options: 'E2EConverter'
                }]
            }, {
                test: require.resolve(`${commonConfig.pluginBasePath}org.ekstep.assessmentbrowser-1.1/editor/libs/xml2json.js`),
                use: [{
                    loader: 'expose-loader',
                    options: 'X2JS'
                }]
            },
            {
                test: require.resolve(`${commonConfig.pluginBasePath}org.ekstep.colorpicker-1.0/editor/libs/spectrum.js`),
                use: [{
                    loader: 'expose-loader',
                    options: 'spectrum'
                }]
            },
            {
                test: require.resolve('./node_modules/izitoast/dist/js/iziToast.min.js'),
                use: [{
                    loader: 'expose-loader',
                    options: 'iziToast'
                }]
            },
            {
                test: /\.(html)$/,
                use: {
                    loader: 'html-loader',
                    options: {
                        attrs: [':data-src']
                    }
                }
            },
            {
                test: /\.(s*)css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: {
                            sourceMap: false,
                            minimize: true,
                            "preset": "advanced",
                            discardComments: {
                                removeAll: true
                            }
                        }
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            sourceMap: false,
                            minimize: true,
                            "preset": "advanced",
                            discardComments: {
                                removeAll: true
                            }
                        }
                    }
                ]
            }, {
                test: /\.(gif|png|jpe?g|svg)$/,
                use: [
                    'file-loader',
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 50, //it's important
                            outputPath: './images/assets',
                            name: '[name].[ext]',
                        }
                    },
                ],
            }
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: "[name].min.css",
        }),
        new webpack.ProvidePlugin({
            iziToast: 'iziToast',
            E2EConverter: 'E2EConverter',
            spectrum: 'spectrum'
        }),
        new UglifyJsPlugin({
            cache: false,
            parallel: true,
            uglifyOptions: {
                compress: {
                    dead_code: true,
                    drop_console: commonConfig.dropConsole,
                    global_defs: {
                        DEBUG: true
                    },
                    passes: 1,
                },
                ecma: 5,
                mangle: commonConfig.mangle
            },
            sourceMap: true
        }),
    ],
    optimization: {
        minimize: true,
        splitChunks: {
            chunks: 'async',
            minSize: 30000,
            minChunks: 1,
            maxAsyncRequests: 5,
            maxInitialRequests: 3,
            automaticNameDelimiter: '~',
        }
    }
};