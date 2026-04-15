// var BundleTracker = require('webpack-bundle-tracker');
var path = require('path');
const webpack = require('webpack');
var BundleTracker = require('./bundle-tracker');
const CompressionPlugin = require(`compression-webpack-plugin`);

/*...*/
module.exports = {
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                DISABLE_WORLD_MAP: JSON.stringify(process.env.DISABLE_WORLD_MAP)
            }
        }),
        new BundleTracker({ filename: '../webpack-stats.json' }),
        new CompressionPlugin()
    ],
    "output": {
        "path": path.join(process.cwd(), "dist"),
        "filename": "[name]-[fullhash].js",
        "crossOriginLoading": false,
        "publicPath":"http://10.192.11.207:8090/"
    },
    "devServer": {
        "historyApiFallback": true,
        "headers": {
            'Access-Control-Allow-Origin': '\*'
        }
    }
}
