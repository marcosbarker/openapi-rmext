/**
 * @file Convert Swagger to OpenAPI 3.0 and remove OpenAPI extensions taking as source the swagger downloaded from API Platform.
 * @author Raphael Santos <raphaelsantosdev@gmail.com>
 * @version 1.0.0
 */

'use strict';

import { readFileSync, writeFileSync } from 'fs';
import fetch from 'node-fetch';
import chalk from 'chalk';

const log = console.log;

const swagger = process.argv[2];

const rawdata = readFileSync(`./${swagger}`);
const data = JSON.parse(rawdata);

/**
 * Makes a call to convert swagger to openapi3.0
 * @async
 */
log(chalk.blackBright(`Converting Swagger to OpenAPI 3.0`));
const url = 'https://converter.swagger.io/api/convert';
const response = await fetch(url, {
    method: 'post',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' }
});
const json = await response.json();


/**
 * Removes all existing 'openapi extensions'
 * @param {object} json - is the openapi3 file that have its files removed
 */
(function (json) {
    log(chalk.blackBright('Removing extensions...'))
    const rmExt = (json) => {
        for (let props in json) {
            let isExt = props.includes('x-');
            if (isExt) delete json[props];
        }
    }
    const paths = json.paths
    for (let item in paths) {
        let path = paths[item];
        rmExt(path);
        for (let item in path) {
            const method = path[item];
            rmExt(method);
        }
    }
    rmExt(json);
}(json));

/**
 * Generates a file that has the name respecting the convention 
 * adopted by team/client to deploy in Dev Portal
 */
const title = json.info.title.replace(' ', '_');
const version = json.info.version.replaceAll('.', '_');
const file = `${title}_${version}.swagger.json`;
const body = JSON.stringify(json, 0, 2);

log(chalk.blackBright(`Generating file: ${file}`));
writeFileSync(file, body);

log(chalk.yellowBright('File was generated!'))