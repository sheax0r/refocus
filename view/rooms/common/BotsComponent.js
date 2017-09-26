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
    this.state = {
      selectedBots: []
    };
  }

  render() {
    const { bots, selectedBots } = this.props;
    // this.setState({ selectedBots });
    // if (!bots.length) return (null);
    return (
      <table role='grid' className='slds-table slds-table_fixed-layout slds-table_bordered slds-table_resizable-cols slds-no-row-hover slds-scrollable_none'>
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
              <a className='slds-th__action slds-text-link_reset' href='javascript:void(0);' role='button' tabindex='-1'>
                <span className='slds-truncate' title='Product Code'>Active</span>
              </a>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr className='slds-hint-parent'>
            <td role='gridcell' className='slds-text-align_right' style={{width: '3.75rem;'}}>
              <div className='slds-checkbox_add-button'>
                <input type='checkbox' className='slds-assistive-text' id='add-checkbox-1' defaultChecked={true} tabindex='-1' value='on' />
                <label for='add-checkbox-1' className='slds-checkbox_faux'>
                </label>
              </div>
            </td>
            <th scope='row'>
              <div className='slds-truncate' title='commsBot'>Comms_Bot</div>
            </th>
            <td role='gridcell'>
              <div className='slds-truncate' title='commsBotLink'>https://git.soma/comms</div>
            </td>
            <td role='gridcell'>
              <div className='slds-truncate' title='commsBotActive'>true</div>
            </td>
          </tr>
          <tr className='slds-hint-parent'>
            <td role='gridcell' className='slds-text-align_right' style={{width: '3.75rem;'}}>
              <div className="slds-checkbox_add-button">
                <input type="checkbox" className="slds-assistive-text" id="add-checkbox-19" value="on" />
                <label for="add-checkbox-19" className="slds-checkbox_faux">
                  <span className="slds-assistive-text">Add product</span>
                </label>
              </div>
            </td>
            <th scope='row'>
              <div className='slds-truncate' title='commsBot'>Salesforce_Object_Bot</div>
            </th>
            <td role='gridcell'>
              <div className='slds-truncate' title='commsBotLink'>https://git.soma/sfdc</div>
            </td>
            <td role='gridcell'>
              <div className='slds-truncate' title='commsBotActive'>true</div>
            </td>
          </tr>
          <tr className='slds-hint-parent'>
            <td role='gridcell' className='slds-text-align_right' style={{width: '3.75rem;'}}>
              <div className='slds-checkbox_add-button'>
                <input type='checkbox' className='slds-assistive-text' id='add-checkbox-3' tabindex='-1' value='on' />
                <label for='add-checkbox-3' className='slds-checkbox_faux'>
                </label>
              </div>
            </td>
            <th scope='row'>
              <div className='slds-truncate' title='commsBot'>PagerDuty_Bot</div>
            </th>
            <td role='gridcell'>
              <div className='slds-truncate' title='commsBotLink'>https://git.soma/pd</div>
            </td>
            <td role='gridcell'>
              <div className='slds-truncate' title='commsBotActive'>true</div>
            </td>
          </tr>
        </tbody>
      </table>
    );
  }
}

BotsComponent.propTypes = {
  bots: PropTypes.array,
  selectedBots: PropTypes.array,
};

export default BotsComponent;
