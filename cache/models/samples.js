/**
 * Copyright (c) 2017, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or
 * https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * cache/models/samples.js
 */
'use strict'; // eslint-disable-line strict

const helper = require('../../api/v1/helpers/nouns/samples');
const u = require('../../api/v1/helpers/verbs/utils');
const httpStatus = require('../../api/v1/constants').httpStatus;
const sampleStore = require('../sampleStore');
const redisClient = require('../redisCache').client.sampleStore;
const constants = sampleStore.constants;
const apiConstants = require('../../api/v1/constants');
const defaults = require('../../config').api.defaults;
const redisErrors = require('../redisErrors');
const ZERO = 0;
const ONE = 1;

function getCustomAttrCommand(attrsToFilter, sampleKey) {
  const command = [
    'hmget',
    sampleKey,
  ];

  attrsToFilter.forEach((attr) => {
    command.push(attr);
  });
  return command;
}

function sampObjFromRedis(attrsToFilter, sampleRes) {
  let sampleObj = {};
  if (attrsToFilter) {
    // if hmget, response is an array of values, so create sample object
    for (let i = 0; i < attrsToFilter.length; i++) {
      sampleObj[attrsToFilter[i]] = sampleRes[i];
    }
  } else {
    sampleObj = sampleRes; // if hgetAll, object is returned
  }

  return sampleObj;
}

/**
 * [getOptionsFromReq description]
 * @param  {[type]} params [description]
 * @return {[type]}        [description]
 */
function getOptionsFromReq(params) {
  // eg. ?fields=x,y,z. Adds as opts.attributes = [array of fields]
  // id is always included
  const opts = u.buildFieldList(params);

  // Specify the sort order. If defaultOrder is defined in props or sort value
  // then update sort order otherwise take value from model defination
  if ((params.sort && params.sort.value) || helper.defaultOrder) {
    opts.order = params.sort.value || helper.defaultOrder;
  }

  // handle limit
  if (params.limit && params.limit.value) {
    opts.limit = parseInt(params.limit.value, defaults.limit);
  }

  // handle offset
  if (params.offset && params.offset.value) {
    opts.offset = parseInt(params.offset.value, defaults.offset);
  }

  const filter = {};
  const keys = Object.keys(params);

  for (let i = ZERO; i < keys.length; i++) {
    const key = keys[i];
    const isFilterField = apiConstants.NOT_FILTER_FIELDS.indexOf(key) < ZERO;
    if (isFilterField && params[key].value !== undefined) {
      filter[key] = params[key].value;
    }
  }

  // in case of get by id, default param  key -> {name of sample} is present
  // hence, filter: { key: '___Subject1.___Subject3|___Aspect1' } }
  if (Object.keys(filter).length !== 0 && filter.constructor === Object) {
    opts.filter = filter;
  }

  return opts;
}


/**
 * Convert array strings to Json for sample and aspect, then attach aspect to
 * sample.
 * @param  {Object} sampleObj - Sample object from redis
 * @param  {Object} aspectObj - Aspect object from redis
 * @param  {String} method - Request method
 * @returns {Object} - Sample object with aspect attached
 */
function cleanAddAspectToSample(sampleObj, aspectObj, method) {
  if (!sampleObj || !aspectObj) {
    throw new redisErrors.ResourceNotFoundError({
      explanation: 'Sample or Aspect not present in Redis',
    });
  }

  let sampleRes = {};
  sampleRes = sampleStore.arrayStringsToJson(
    sampleObj, constants.fieldsToStringify.sample
  );

  const aspect = sampleStore.arrayStringsToJson(
    aspectObj, constants.fieldsToStringify.aspect
  );

  sampleRes.aspect = aspect;

  // add api links
  sampleRes.apiLinks = u.getApiLinks(
    sampleRes.name, helper, method
  );

  return sampleRes;
}

module.exports = {

  /**
   * Retrieves the sample from redis and sends it back in the response.
   *
   * @param {IncomingMessage} req - The request object
   * @param {ServerResponse} res - The response object
   * @param {Function} next - The next middleware function in the stack
   */
  getSampleFromRedis(req, res, next) {
    const opts = getOptionsFromReq(req.swagger.params);
    const resultObj = { reqStartTime: new Date() }; // for logging
    const sampleName = req.swagger.params.key.value.toLowerCase();
    const aspectName = sampleName.split('|')[ONE];
    const commands = [];
    let attrsToFilter;

    if (opts.attributes) {
      attrsToFilter = opts.attributes;
      const sKey = sampleStore.toKey(constants.objectType.sample, sampleName);
      const command = getCustomAttrCommand(attrsToFilter, sKey);

      // get sample
      commands.push(command);
    } else {
      // get sample
      commands.push([
        'hgetall',
        sampleStore.toKey(constants.objectType.sample, sampleName),
      ]);
    }

    // get aspect
    commands.push([
      'hgetall',
      sampleStore.toKey(constants.objectType.aspect, aspectName),
    ]);

    redisClient.batch(commands).execAsync()
    .then((responses) => {
      const sampleResponse = responses[ZERO];
      const aspectResponse = responses[ONE];

      resultObj.dbTime = new Date() - resultObj.reqStartTime; // log db time
      const sampleObj = sampObjFromRedis(attrsToFilter, sampleResponse);

      // clean and attach aspect to sample
      const sampleRes = cleanAddAspectToSample(
        sampleObj, aspectResponse, res.method
      );

      u.logAPI(req, resultObj, sampleRes); // audit log
      res.status(httpStatus.OK).json(sampleRes);
    })
    .catch((err) => u.handleError(next, err, helper.modelName));
  },

  /**
   * Finds zero or more samples from redis and sends them back in the response.
   *
   * @param {IncomingMessage} req - The request object
   * @param {ServerResponse} res - The response object
   * @param {Function} next - The next middleware function in the stack
   */
  findSamplesFromRedis(req, res, next) {
    const opts = getOptionsFromReq(req.swagger.params);
    const resultObj = { reqStartTime: new Date() }; // for logging
    const sampleCmds = [];
    const aspectCmds = [];
    const response = [];
    let attrsToFilter;

    // needed to iterate on when all promises are resolved
    let allSampleKeysInRedis;

    // get all Samples sorted lexicographically
    redisClient.sortAsync(constants.indexKey.sample, 'alpha')
    .then((allSampleKeys) => {
      allSampleKeysInRedis = allSampleKeys;
      if (opts.attributes) {
        attrsToFilter = opts.attributes;
        // add to commands to get specified sample attributes
        allSampleKeys.forEach((sampleName) => {
          const command = getCustomAttrCommand(attrsToFilter, sampleName);
          sampleCmds.push(command); // get sample
        });
      } else {
        // add to commands to get all sample fields
        allSampleKeys.forEach((sampleName) => {
          sampleCmds.push(
            ['hgetall', sampleName]
          );
        });
      }

      // get all aspect names
      return redisClient.smembersAsync(constants.indexKey.aspect);
    })
    .then((allAspectKeys) => {
      // add to commands to get aspect
      allAspectKeys.forEach((aspectName) => {
        aspectCmds.push(
          ['hgetall', aspectName]
        );
      });

      // get all samples and aspects
      return Promise.all([
        redisClient.batch(sampleCmds).execAsync(),
        redisClient.batch(aspectCmds).execAsync(),
      ]);
    })
    .then((sampleAndAspects) => {
      resultObj.dbTime = new Date() - resultObj.reqStartTime; // log db time
      const sampleResults = sampleAndAspects[ZERO];
      const aspects = sampleAndAspects[ONE];

      // we need to iterate on allSampleKeys because we need aspect name from
      // sample name
      for (let i = 0; i < allSampleKeysInRedis.length; i++) {
        const sampleKey = allSampleKeysInRedis[i];
        const sampleObj = sampObjFromRedis(attrsToFilter, sampleResults[i]);
        const sampleAspect = aspects.find((aspect) =>
          aspect.name.toLowerCase() === sampleKey.split('|')[ONE]
        );
        const resSampAsp = cleanAddAspectToSample(
          sampleObj, sampleAspect, res.method
        );
        response.push(resSampAsp); // add sample to response
      }
    })
    .then(() => {
      u.logAPI(req, resultObj, response); // audit log
      res.status(httpStatus.OK).json(response);
    })
    .catch((err) => u.handleError(next, err, helper.modelName));
  },
};
