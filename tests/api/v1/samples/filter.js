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

describe('sample api: FILTER' + path, () => {
  let sampleId;
  let token;
  let SPECIAL_SAMPLE_ID;
  const THREE = '3';
  const ONE = '1';
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
   * Sets up an object with aspect id, subject id
   *
   * @param {String} aspectName The name of the aspect
   * @param {String} subjectName The name of the subject
   * @returns {Object} contains aspect id, subject id
   */
  function doSetup(aspectName, subjectName) {
    const aspectToCreate = {
      isPublished: true,
      name: `${tu.namePrefix + aspectName}`,
      timeout: '30s',
      criticalRange: [3, 3],
      okRange: [5, 5],
      valueType: 'NUMERIC',
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
    doSetup('POTATO', 'COFFEE')
    .then((obj) => {
      return Sample.create(obj);
    })
    .then(() => doSetup('GELATO', 'COLUMBIA'))
    .then((obj) => {
      obj.value = THREE; // different from default
      return Sample.create(obj);
    })
    .then(() => doSetup('SPECIAL', 'UNIQUE'))
    .then((obj) => {
      obj.value = THREE; // different from default
      obj.messageCode = MESSAGE_CODE_1;
      return Sample.create(obj);
    })
    .then((samp) => { // to test previousStatus
      SPECIAL_SAMPLE_ID = samp.id;
      return samp.update({ value: ONE });
    })
    .then(() => { // sample updated
      done();
    })
    .catch((err) => done(err));
  });

  after(u.forceDelete);
  after(tu.forceDeleteUser);

  describe('regular tests', () => {

    it('no asterisk is treated as "equals"', (done) => {
      const NAME = tu.namePrefix + 'COFFEE|' + tu.namePrefix + 'POTATO';
      api.get(path + '?name=' + NAME)
      .set('Authorization', token)
      .expect(constants.httpStatus.OK)
      .expect((res) => {
        expect(res.body.length).to.equal(1);
        expect(res.body[0].name).to.equal(NAME);
      })
      .end((err /* , res */) => done(err));
    });

    it('trailing asterisk is treated as "starts with"', (done) => {
      api.get(path + '?name=' + tu.namePrefix + '*')
      .set('Authorization', token)
      .expect(constants.httpStatus.OK)
      .expect((res) => {
        expect(res.body.length).to.equal(3);
        res.body.map((sample) => {
          expect(sample.name.slice(0, 3)).to.equal(tu.namePrefix);
        })
      })
      .end((err /* , res */) => done(err));
    });

    it('leading asterisk is treated as "ends with"', (done) => {
      api.get(path + '?name=*O')
      .set('Authorization', token)
      .expect(constants.httpStatus.OK)
      .expect((res) => {
        expect(res.body.length).to.equal(2);
        res.body.map((sample) => {
          expect(sample.name.slice(-2)).to.equal('TO');
        });
      })
      .end((err /* , res */) => done(err));
    });

    it('leading and trailing asterisks are treated as "contains"',
      (done) => {
      api.get(path + '?name=*ATO*')
      .set('Authorization', token)
      .expect(constants.httpStatus.OK)
      .expect((res) => {
        res.body.map((sample) => {
          expect(sample.name).to.contain('ATO');
        });
      })
      .end((err /* , res */) => done(err));
    });

    it('filter by value', (done) => {
      api.get(path + '?value=' + ONE)
      .set('Authorization', token)
      .expect(constants.httpStatus.OK)
      .expect((res) => {
        expect(res.body.length).to.equal(1);
        expect(res.body[0].value).to.equal(ONE);
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

  it('filter by status', (done) => {
    api.get(path + '?status=Critical')
    .set('Authorization', token)
    .expect(constants.httpStatus.OK)
    .expect((res) => {
      expect(res.body.length).to.equal(1);
      expect(res.body[0].status).to.equal('Critical');
    })
    .end((err /* , res */) => done(err));
  });

  it('filter by previousStatus', (done) => {
      api.get(path + '?previousStatus=Critical')
      .set('Authorization', token)
      .expect(constants.httpStatus.OK)
      .expect((res) => {
        expect(res.body.length).to.equal(1);
        expect(res.body[0].previousStatus).to.equal('Critical');
        expect(res.body[0].status).to.equal('Invalid');
      })
      .end((err /* , res */) => done(err));
  });
});
