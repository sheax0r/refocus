/**
 * Copyright (c) 2017, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or
 * https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * view/rooms/common/BotsComponent.js
 *
 * Manages Bots selectable list view page.
 */
import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

class BotsComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { bots, selectedBots } = this.props;
    // if (!bots.length) return (null);
    return (
      <section role='dialog' tabindex='-1' className='slds-list-builder'>
      <div className='slds-scrollable slds-grow'>
        <table
          role='grid'
          className='slds-table slds-table_fixed-layout slds-table_bordered
            slds-table_resizable-cols slds-no-row-hover slds-scrollable_none'>
          <thead>
            <tr className='slds-line-height_reset'>
              <th scope='col' style={{width: '3.75rem'}}></th>
              <th aria-label='Name' className='slds-text-title_caps' scope='col'>
                <span className='slds-truncate' title='Name'>Name</span>
              </th>
              <th aria-label='Link' className='slds-text-title_caps' scope='col'>
                <span className='slds-truncate' title='Product Code'>Link</span>
              </th>
              <th aria-label='Active' className='slds-text-title_caps' scope='col'>
                <a className='slds-th__action slds-text-link_reset'
                  href='javascript:void(0);'
                  role='button'
                  tabindex='-1'>
                  <span className='slds-truncate' title='Product Code'>Active</span>
                </a>
              </th>
            </tr>
          </thead>
          <tbody>
            {bots.map(bot => this.createRowForBot(bot, selectedBots))}
          </tbody>
        </table>
      </div>
      </section>
    );
  }

  createRowForBot(bot, selectedBots) {
    const iconState = bot.active ? 'positive' : 'negative';
    const selected = selectedBots.find(value => value === bot.name);
    return (
      <tr className='slds-hint-parent'>
        <td role='gridcell'
          className='slds-text-align_right'
          style={{width: '3.75rem;'}}>
          <label className='slds-checkbox_toggle slds-grid'>
            <input type='checkbox' name='checkbox'
              aria-describedby='toggle-desc'
              defaultChecked={selected}
              value='on' />
            <span id='toggle-desc' className='slds-checkbox_faux_container' aria-live='assertive'>
              <span className='slds-checkbox_faux'></span>
              <span className='slds-checkbox_on'>On</span>
              <span className='slds-checkbox_off'>Off</span>
            </span>
          </label>
        </td>
        <th scope='row'>
          <div className='slds-truncate' title={bot.name + 'Name'}>
            {bot.name}
          </div>
        </th>
        <td role='gridcell'>
          <div className='slds-truncate' title={bot.name +'Link'}>
            <a href={bot.url} target='_blank'>Bot Repo</a>
          </div>
        </td>
        <td role='gridcell'>
          <div className='slds-truncate' title={bot.name +'Active'}>
            <span data-slds-state={iconState} className='slds-icon-score' title='Active/Not Active'>
              <svg viewBox='0 0 5 5' className='slds-icon-score__positive' aria-hidden='true'>
                <circle cx='50%' cy='50%' r='1.875' />
              </svg>
              <svg viewBox='0 0 5 5' className='slds-icon-score__negative' aria-hidden='true'>
                <circle cx='50%' cy='50%' r='1.875' />
              </svg>
              <span className='slds-assistive-text'>Active/Not Active</span>
            </span>
          </div>
        </td>
      </tr>
    );
  }
}

BotsComponent.propTypes = {
  bots: PropTypes.array,
  selectedBots: PropTypes.array,
};

export default BotsComponent;
