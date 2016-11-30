/**
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or
 * https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * tests/api/v1/samples/filter.js
 */

'use strict';

const expect = require('chai').expect;
const supertest = require('supertest');
const api = supertest(require('../../../../index').app);
const tu = require('../../../testUtils');
const u = require('./utils');
const constants = require('../../../../api/v1/constants');
const Aspect = tu.db.Aspect;
const Subject = tu.db.Subject;
const Sample = tu.db.Sample;
const path = '/v1/samples/upsert/bulk';

describe.only('api: POST ' + path, () => {
  let token;

  before((done) => {
    tu.createToken()
    .then((returnedToken) => {
      token = returnedToken;
      done();
    })
    .catch((err) => done(err));
  });

  before((done) => {
    Aspect.create({
      isPublished: true,
      name: `${tu.namePrefix}Aspect1`,
      timeout: '30s',
      valueType: 'NUMERIC',
      criticalRange: [0, 1],
    })
    .then(() => Aspect.create({
      isPublished: true,
      name: `${tu.namePrefix}Aspect2`,
      timeout: '10m',
      valueType: 'BOOLEAN',
      okRange: [10, 100],
    }))
    .then(() => Subject.create({
      isPublished: true,
      name: `${tu.namePrefix}Subject`,
    }))
    .then(() => api.post(path)
      .set('Authorization', token)
      .send([
        {
          name: `${tu.namePrefix}Subject|${tu.namePrefix}Aspect1`,
          value: '2',
        }, {
          name: `${tu.namePrefix}Subject|${tu.namePrefix}Aspect2`,
          value: '4',
        },
      ])
      .expect(200)
    )
    .then(() => done())
    .catch((err) => done(err));
  });

  after(u.forceDelete);
  after(tu.forceDeleteUser);

  it('all succeed', (done) => {

      done();
  });


  it('filtering by name matches exactly.');

  //  /v1/samples?name=Foo*
  it('filtering by name gets all names starting with Foo.');

  // /v1/samples?name=*|Bar
  it('filtering by name gets all names ending with Bar.');

  it('filtering by status');

  // need update sample, so its previousStatus differs from status
  it('filtering by previousStatus');

  it('filtering by value');

  it('filtering by messageCode.');

});
