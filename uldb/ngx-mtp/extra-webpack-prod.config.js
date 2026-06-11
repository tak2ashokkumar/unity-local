// var BundleTracker = require('webpack-bundle-tracker');
const CompressionPlugin = require(`compression-webpack-plugin`);
var path = require('path');
const webpack = require('webpack');
var BundleTracker = require('./bundle-tracker');

/*...*/
module.exports = {
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                DISABLE_WORLD_MAP: JSON.stringify(process.env.DISABLE_WORLD_MAP)
            }
        }),
        new BundleTracker({ filename: '../webpack-stats-mtp.json' }),
        new CompressionPlugin()
    ],
    "output": {
        "path": path.join(process.cwd(), "../", "static/mtpdist"),
        "filename": "[name]-[fullhash].js",
        "crossOriginLoading": false,
        "publicPath": "static/mtpdist/"
    },
    "devServer": {
        "historyApiFallback": true,
        "headers": {
            'Access-Control-Allow-Origin': '\*'
        }
    },
}