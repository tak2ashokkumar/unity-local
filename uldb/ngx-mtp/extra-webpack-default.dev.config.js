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
        new BundleTracker({ filename: '../webpack-stats-mtp.json' }),
        new CompressionPlugin()
    ],
    "output": {
        "path": path.join(process.cwd(), "dist"),
        "filename": "[name]-[fullhash].js",
        "crossOriginLoading": false,
        "publicPath":"http://localhost:8060/"
    },
    "devServer": {
        "historyApiFallback": true,
        "headers": {
            'Access-Control-Allow-Origin': '\*'
        }
    }
}
