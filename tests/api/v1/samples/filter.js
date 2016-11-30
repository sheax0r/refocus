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

const supertest = require('supertest');
const api = supertest(require('../../../../index').app);
const constants = require('../../../../api/v1/constants');
const tu = require('../../../testUtils');
const u = require('./utils');
const Sample = tu.db.Sample;
const path = '/v1/samples';

describe.only(`api: FILTER ${path}`, () => {
  let sampleId;
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
    // TODO: move them to funcitons with name as input
    const aspectToCreate = {
      isPublished: true,
      name: `${tu.namePrefix}TEST_ASPECT`,
      timeout: '30s',
    };

    const subjectToCreate = {
      isPublished: true,
      name: `${tu.namePrefix}TEST_SUBJECT`,
    };

    new tu.db.Sequelize.Promise((resolve, reject) => {
      const samp = { value: '1' };
      tu.db.Aspect.create(aspectToCreate)
      .then((a) => {
        samp.aspectId = a.id;
        return tu.db.Subject.create(subjectToCreate);
      })
      .then((s) => {
        samp.subjectId = s.id;
        resolve(samp);
      })
      .catch((err) => reject(err));
    })
    .then((samp) => {
      // set sample props here
      console.log(samp)
      return Sample.create(samp);
    })
    .then((samp) => {
      sampleId = samp.id;
      done();
    })
    .catch((err) => done(err));
  });

  after(u.forceDelete);
  after(tu.forceDeleteUser);

  it('basic get', (done) => {
    api.get(path)
    .set('Authorization', token)
    .expect(constants.httpStatus.OK)
    .expect((res) => {
      if (tu.gotExpectedLength(res.body, 0)) {
        throw new Error('expecting sample');
      }

      // console.log(res.body)
    })
    .end((err /* , res */) => {
      if (err) {
        return done(err);
      }

      done();
    });
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
