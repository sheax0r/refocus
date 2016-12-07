/**
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or
 * https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * api/v1/controllers/userTokens.js
 */
'use strict';

const helper = require('../helpers/nouns/tokens');
const apiErrors = require('../apiErrors');
const doDelete = require('../helpers/verbs/doDelete');
const doFind = require('../helpers/verbs/doFind');
const doGet = require('../helpers/verbs/doGet');
const doPatch = require('../helpers/verbs/doPatch');
const doPost = require('../helpers/verbs/doPost');
const doPut = require('../helpers/verbs/doPut');
const u = require('../helpers/verbs/utils');
const httpStatus = require('../constants').httpStatus;

module.exports = {

  /**
   * DELETE /users/{key}/tokens/{tokenName}
   *
   * Deletes the token metadata record and sends it back in the response.
   *
   * @param {IncomingMessage} req - The request object
   * @param {ServerResponse} res - The response object
   * @param {Function} next - The next middleware function in the stack
   */
  deleteUserToken(req, res, next) {
    const user = req.swagger.params.key.value;
    const tokenName = req.swagger.params.tokenName.value;
    const whr = {
      'user.name': user,
      name: tokenName,
    };
    // doDelete(req, res, next, helper);
  },

  /**
   * GET /users/{key}/tokens/{tokenName}
   *
   * Retrieves the token metadata record and sends it back in the response.
   *
   * @param {IncomingMessage} req - The request object
   * @param {ServerResponse} res - The response object
   * @param {Function} next - The next middleware function in the stack
   */
  getUserToken(req, res, next) {
    const user = req.swagger.params.key.value;
    const tokenName = req.swagger.params.tokenName.value;
    const whr = {
      'user.name': user,
      name: tokenName,
    };
    // doGet(req, res, next, helper);
  },

  /**
   * GET /users/{key}/tokens
   *
   * Gets zero or more tokens for the specified user and sends them back in the
   * response.
   *
   * @param {IncomingMessage} req - The request object
   * @param {ServerResponse} res - The response object
   * @param {Function} next - The next middleware function in the stack
   */
  getUserTokens(req, res, next) {
    const user = req.swagger.params.key.value;
    const whr = {
      'user.name': user,
    };
    // doFind(req, res, next, helper);
  },

  /**
   * POST /users/{key}tokens/{tokenName}/restore
   *
   * Restore access for the specified token if access had previously been
   * revoked.
   *
   * @param {IncomingMessage} req - The request object
   * @param {ServerResponse} res - The response object
   * @param {Function} next - The next middleware function in the stack
   */
  restoreTokenByName(req, res, next) {
    const user = req.swagger.params.key.value;
    const tokenName = req.swagger.params.tokenName.value;
    const whr = {
      'user.name': user,
      name: tokenName,
    };
    helper.model.find(whr)
    .then((o) => {
      if (o.isRevoked === '0') {
        throw new apiErrors.InvalidTokenActionError();
      }

      return o.restore();
    })
    .then((o) => {
      const retval = u.responsify(o, helper, req.method);
      res.status(httpStatus.OK).json(retval);
    })
    .catch((err) => u.handleError(next, err, helper.modelName));
  },

  /**
   * POST /users/{key}tokens/{tokenName}/revoke
   *
   * Revoke access for the specified token.
   *
   * @param {IncomingMessage} req - The request object
   * @param {ServerResponse} res - The response object
   * @param {Function} next - The next middleware function in the stack
   */
  revokeTokenByName(req, res, next) {
    const user = req.swagger.params.key.value;
    const tokenName = req.swagger.params.tokenName.value;
    const whr = {
      'user.name': user,
      name: tokenName,
    };
    helper.model.find(whr)
    .then((o) => {
      if (o.isRevoked > '0') {
        throw new apiErrors.InvalidTokenActionError();
      }

      return o.revoke();
    })
    .then((o) => {
      const retval = u.responsify(o, helper, req.method);
      res.status(httpStatus.OK).json(retval);
    })
    .catch((err) => u.handleError(next, err, helper.modelName));
  },
}; // exports
