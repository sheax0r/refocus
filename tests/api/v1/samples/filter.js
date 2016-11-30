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
const expect = require('chai').expect;

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

  function getAspectWithName(name) {
    return {
      isPublished: true,
      name,
      timeout: '30s',
    };
  }

  function getSubjectWithName(name) {
    return {
      isPublished: true,
      name,
    };
  }

  function makeSample(aspectName, subjectName) {
    const aspectToCreate = getAspectWithName(aspectName);
    const subjectToCreate = getSubjectWithName(subjectName);

    const obj = {};
    tu.db.Aspect.create(aspectToCreate)
    .then((a) => {
      obj.aspectId = a.id;
      return tu.db.Subject.create(subjectToCreate);
    })
    .then((s) => {
      obj.subjectId = s.id;
      console.log(obj)
      // set sample props here. samp contains aspectId, subjectId
      return Sample.create(obj);
    })
    .then((samp) => {
      console.log(samp)
      return samp
    })
    .catch((err) => {
      throw new Error(err)
    });
  }

  before((done) => {
    makeSample('COFEE', 'TEA')
    .then(() => makeSample('COFEE', 'GELATO'))
    .then(() => done())
    .catch((err) => done(err));
  });

  after(u.forceDelete);
  after(tu.forceDeleteUser);

  it('filter name matches exactly', (done) => {
    api.get(path + '?name=COFEE|TEA')
    .set('Authorization', token)
    .expect(constants.httpStatus.OK)
    .expect((res) => {
      expect(res.body.length).to.equal(1);
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
