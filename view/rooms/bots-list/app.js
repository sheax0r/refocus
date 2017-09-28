/**
 * Copyright (c) 2017, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or
 * https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * view/rooms/bots/app.js
 *
 * Create a list of all the bots in refocus
 *
 */

import React from 'react';
import ReactDOM from 'react-dom';
import ListController from '../common/ListController';
import moment from 'moment';

const u = require('../../utils');
const uPage = require('./../utils/page');
const botsListContainer = document.getElementById('botsListContainer');
const GET_BOTS = '/v1/bots';

window.onload = () => {
  uPage.setBotsTab();
  u.getPromiseWithUrl(GET_BOTS)
  .then(res => {
    loadController(res.body);
  });
};

/**
 * Passes data on to Controller to pass onto renderers.
 *
 * @param {Object} values Data returned from AJAX.
 */
function loadController(bots) {
  uPage.setTitle('Refocus Bots');
  uPage.setSubtitle(`Number of bots: ${bots.length}`);

  const headers = ['ID', 'Name', 'Link', 'Active', 'Updated At'];
  const rows = bots.map(bot => {
    const { url } = bot;
    bot.link = `<a href=${url} target='_blank'>Bot Repo</a>`;
    bot.active = drawDynamicIcon(bot.active);
    bot.updatedAt = moment(bot.updatedAt).format('lll');
    return bot;
  });
  uPage.removeSpinner();
  ReactDOM.render(
    <ListController
      tableHeaders={ headers }
      tableRows={ rows }
    />,
    botsListContainer
  );
}

function drawDynamicIcon(state) {
  let iconState = state ? 'positive' : 'negative';
  return `
    <span data-slds-state=${iconState} class='slds-icon-score' title='Active/Not Active'>
      <svg viewBox='0 0 5 5' class='slds-icon-score__positive' aria-hidden='true'>
        <circle cx='50%' cy='50%' r='1.875' />
      </svg>
      <svg viewBox='0 0 5 5' class='slds-icon-score__negative' aria-hidden='true'>
        <circle cx='50%' cy='50%' r='1.875' />
      </svg>
      <span class='slds-assistive-text'>Active/Not Active</span>
    </span>
  `;
}