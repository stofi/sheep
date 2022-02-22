const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCSSExtractPlugin = require('mini-css-extract-plugin')
const path = require('path')
const webpack = require('webpack');

module.exports = {
    entry: path.resolve(__dirname, '../src/main.ts'),
    output: {
        hashFunction: 'xxhash64',
        filename: 'bundle.[contenthash].js',
        path: path.resolve(__dirname, '../dist'),
    },
    devtool: 'source-map',
    plugins: [
        new CopyWebpackPlugin({
            patterns: [{ from: path.resolve(__dirname, '../static') }],
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '../src/index.html'),
            minify: true,
        }),
        new MiniCSSExtractPlugin(),
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
        }),
        new webpack.ProvidePlugin({
            process: 'process/browser',
        }),
    ],
    resolve: {
        extensions: ['.ts', '.js', '.json'],
        alias: {
            buffer: 'buffer',
        },
    },
    module: {
        rules: [
            // HTML
            {
                test: /\.(html)$/,
                use: ['html-loader'],
            },

            // TS
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },

            // JS
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: ['babel-loader'],
            },

            // CSS
            {
                test: /\.css$/,
                use: [MiniCSSExtractPlugin.loader, 'css-loader', 'postcss-loader'],
            },

            // Images
            {
                test: /\.(jpg|png|gif|svg)$/,
                type: 'asset/resource',
                generator: {
                    filename: 'assets/images/[hash][ext]',
                },
            },

            // Media
            {
                test: /\.(mp3)$/,
                type: 'asset/resource',
                generator: {
                    filename: 'assets/media/[hash][ext]',
                },
            },

            // Fonts
            {
                test: /\.(ttf|eot|woff|woff2)$/,
                type: 'asset/resource',
                generator: {
                    filename: 'assets/fonts/[hash][ext]',
                },
            },
            // Shaders
            {
                test: /\.(glsl|frag|vert)$/,
                exclude: /node_modules/,
                use: ['raw-loader'],
            },
        ],
    },
}
