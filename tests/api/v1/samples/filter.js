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

describe(`api: FILTER ${path}`, () => {
  let sampleId;
  let token;
  const SPECIAL_INT = '3';
  const MESSAGE_CODE_1 = '12345';

  before((done) => {
    tu.createToken()
    .then((returnedToken) => {
      token = returnedToken;
      done();
    })
    .catch((err) => done(err));
  });

  /**
   * sets up an object with aspect id, subject id
   * @param {String} aspectName The name of the aspect
   * @param {String} subjectName The name of the subject
   * @returns {Object} contains aspect id, subject id
   */
  function doSetup(aspectName, subjectName) {
    const aspectToCreate = {
      isPublished: true,
      name: `${tu.namePrefix + aspectName}`,
      timeout: '30s',
    };

    const subjectToCreate = {
      isPublished: true,
      name: `${tu.namePrefix + subjectName}`,
    };

    return new tu.db.Sequelize.Promise((resolve, reject) => {
      const samp = {};
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
    });
  }

  before((done) => {
    doSetup('COFFEE', 'POTATO')
    .then((samp) => {
      return Sample.create(samp);
    })
    .then(() => doSetup('COLUMBIA', 'GELATO'))
    .then((samp) => {
      return Sample.create(samp);
    })
    .then(() => doSetup('UNIQUE', 'SPECIAL'))
    .then((samp) => {
      samp.value = SPECIAL_INT; // different from default
      samp.messageCode = MESSAGE_CODE_1; // the only one iwith with messageCode
      return Sample.create(samp);
    })
    .then((samp) => done())
    .catch((err) => done(err));
  });

  after(u.forceDelete);
  after(tu.forceDeleteUser);

  it('filter by name matches exactly', (done) => {
    api.get(path + '?name=UNIQUE|SPECIAL')
    .set('Authorization', token)
    .expect(constants.httpStatus.OK)
    .expect((res) => {
      expect(res.body.length).to.equal(1);
      // console.log(res.body)
    })
    .end((err /* , res */) => done(err));
  });

  //  /v1/samples?name=Foo*
  it('filter by name gets all names starting with CO.', (done) => {
    api.get(path + '?name=CO*')
    .set('Authorization', token)
    .expect(constants.httpStatus.OK)
    .expect((res) => {
      expect(res.body.length).to.equal(2);
      // console.log(res.body)
    })
    .end((err /* , res */) => done(err));
  });

  // /v1/samples?name=*|Bar
  it('filter by name gets all names ending with TO.', (done) => {
    api.get(path + '?name=*|TO')
    .set('Authorization', token)
    .expect(constants.httpStatus.OK)
    .expect((res) => {
      res.body.map((samp) => {
        console.log(samp.status)
      })
      expect(res.body.length).to.equal(2);
    })
    .end((err /* , res */) => done(err));
  });

  //
  it.only('filter by status', (done) => {
    api.get(path + '?status=Warning')
    .set('Authorization', token)
    .expect(constants.httpStatus.OK)
    .expect((res) => {
      expect(res.body.length).to.equal(1);
      expect(res.body.status).to.equal(constants.statuses.Warning);
    })
    .end((err /* , res */) => done(err));
  });

  // need update value, so its previousStatus differs from status
  // would update value here affect filter by value, and filter by state?
  it('filter by previousStatus');

  it('filter by value', (done) => {
    api.get(path + '?value=' + SPECIAL_INT)
    .set('Authorization', token)
    .expect(constants.httpStatus.OK)
    .expect((res) => {
      expect(res.body.length).to.equal(1);
      expect(res.body[0].value).to.equal(SPECIAL_INT);
    })
    .end((err /* , res */) => done(err));
  });

  it('filter by messageCode.', (done) => {
    api.get(path + '?messageCode=' + MESSAGE_CODE_1)
    .set('Authorization', token)
    .expect(constants.httpStatus.OK)
    .expect((res) => {
      expect(res.body.length).to.equal(1);
      expect(res.body[0].messageCode).to.equal(MESSAGE_CODE_1);
    })
    .end((err /* , res */) => done(err));
  });
});
