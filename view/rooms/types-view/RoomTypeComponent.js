/**
 * Copyright (c) 2017, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or
 * https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * view/rooms/type/RoomTypeComponent.js
 *
 * Manages RoomType object page state.
 */
import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

class RoomTypeComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { readOnly: true };
    this.toggleEditMode = this.toggleEditMode.bind(this);
  }

  toggleEditMode(e) {
    e.preventDefault();
    this.setState({
      readOnly: !this.state.readOnly
    });
  }

  render() {
    const { roomType } = this.props;
    const { readOnly } = this.state;
    if (!roomType) return (null);
    return (
      <div className='slds-form slds-form_stacked slds-grow slds-scrollable_y'>
        { readOnly ? this.renderButtons() : this.renderEditButtons() }
        { readOnly ? this.renderPanel(roomType) : this.renderEditPanel(roomType) }
      </div>
    );
  }

  renderButtons() {
    return (
      <div className='slds-panel__section slds-border_bottom slds-border_top'>
        <div className='slds-media__body'>
          <div className='slds-button-group slds-m-top_small' role='group'>
            <button
              onClick={ this.toggleEditMode }
              className='slds-button slds-button_neutral'>
                Edit
              </button>
          </div>
        </div>
      </div>
    );
  }

  renderEditButtons() {
    return (
      <div className='slds-panel__section slds-border_bottom slds-border_top'>
        <div className='slds-media__body'>
          <div className='slds-button-group slds-m-top_small' role='group'>
            <button
              onClick={ this.toggleEditMode }
              className='slds-button slds-button_neutral'>
                Save
              </button>
          </div>
        </div>
      </div>
    );
  }

  renderPanel(roomType) {
    return (
      <div className='slds-panel__section'>
        <h3 className='slds-text-heading_small slds-m-bottom_medium'>Room Type Information</h3>
        <ul>
          {this.createPanelItem('Name', roomType.name)}
          {this.createPanelItem('Enabled', String(roomType.isEnabled))}
          {this.createPanelItem('Bots', String(roomType.bots))}
          {this.createPanelItem('Created At', moment(roomType.createdAt).format('LLL'))}
          {this.createPanelItem('Updated At', moment(roomType.updatedAt).format('LLL'))}
        </ul>
      </div>
    );
  }

  renderEditPanel(roomType) {
    return (
      <div className='slds-panel__section'>
        <h3 className='slds-text-heading_small slds-m-bottom_medium'>Room Type Edit</h3>
        <ul>
          {this.createPanelItem('Name', roomType.name)}
          {this.createCheckboxItem('Enabled', roomType.isEnabled)}
          {this.createMultiSelectItem('Bots', roomType.bots)}
        </ul>
      </div>
    );
  }

  createPanelItem(label, value) {
    return (<li className='slds-form-element slds-hint-parent slds-border_bottom'>
      <span className='slds-form-element__label'>{label}</span>
      <div className='slds-form-element__control'>
        <span className='slds-form-element__static'>{value}</span>
      </div>
    </li>);
  }

  createCheckboxItem(state) {
    return (
      <li className='slds-form-element slds-hint-parent slds-border_bottom'>
        <label className='slds-checkbox_toggle slds-grid'>
          <input type='checkbox' name='checkbox' aria-describedby='toggle-desc' value='on' />
          <span id='toggle-desc' className='slds-checkbox_faux_container' aria-live='assertive'>
            <span className='slds-checkbox_faux'></span>
            <span className='slds-checkbox_on'>Enabled</span>
            <span className='slds-checkbox_off'>Disabled</span>
          </span>
        </label>
      </li>);
  }

  createMultiSelectItem(label, selected) {
    return (<li className='slds-form-element slds-hint-parent slds-border_bottom'>
      <span className='slds-form-element__label'>{label}</span>
      <div className='slds-form-element__control'>
        <span className='slds-form-element__static'>{selected}</span>
      </div>
    </li>);
  }


}

RoomTypeComponent.propTypes = {
  roomType: PropTypes.object,
};

export default RoomTypeComponent;
