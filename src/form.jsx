import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'

import { injectIntl } from 'react-intl'
import IntlError from 'intl-error'
import get from 'lodash/get'
import set from 'lodash/set'
import unset from 'lodash/unset'
import merge from 'lodash/merge'
import isEqual from 'lodash/isEqual'


export class Form extends PureComponent {

  static propTypes = {
    intl: PropTypes.object,
    initialValues: PropTypes.object,
    // enforceInitialValues: PropTypes.bool.isRequired,
    className: PropTypes.string,
    children: PropTypes.any,
    loading: PropTypes.bool.isRequired,
    onSubmit: PropTypes.func,
    onChange: PropTypes.func,
    submitOnChange: PropTypes.bool.isRequired,
    requiresParentRendering: PropTypes.bool.isRequired,
  }

  static defaultProps = {
    initialValues: {},
    // enforceInitialValues: false,
    loading: false,
    submitOnChange: false,
    requiresParentRendering: false,
  }

  static childContextTypes = {
    form: PropTypes.object.isRequired,
  }

  state = {
    values: {},
    previousValues: {},
    initialValues: {},
    errors: {},
    submitting: false
  }

  componentDidMount () {
    this.mounted = true
  }

  componentWillMount () {
    // we do not want to use setState here
    this.state.initialValues = merge({},this.props.initialValues) // eslint-disable-line
    this.state.values = merge({},this.props.initialValues) // eslint-disable-line
  }

  componentDidUpdate ({ initialValues }) {
    // check if the initialValues where updated. if yes we should force the update
    // and change those
    if ( ! isEqual(this.state.initialValues, initialValues) ) {
      // TODO: we need to remove the equal parts from the values in order to prevent
      // data sharing cross different data objects.

      // we need to check whats been changed
      this.setState({ initialValues })
    }
  }

  componentWillUnmount () {
    this.mounted = false
  }

  getChildContext () {
    const { registerComponent, unregisterComponent, setValue, getValue, getValues, getError, getFormattedError, hasErrors, isDirty } = this
    const { initialValues, loading } = this.props
    const { values, previousValues, errors, submitting } = this.state

    return {
      form: {
        registerComponent, unregisterComponent,
        values, previousValues, initialValues,
        errors, getValues, getValue, setValue,
        getError, hasErrors, getFormattedError,
        submitting, loading, isDirty
      }
    }
  }

  onChange = async ( newState ) => {
    const { props: { onChange, submitOnChange, requiresParentRendering } } = this

    if ( requiresParentRendering ) {
      this.state = newState
    } else {
      await this.setState(newState)
    }

    if ( onChange ) {
      await onChange( newState )
    }

    if ( submitOnChange ) {
      await this.onSubmit()
    }
  }

  unsetValue = async (name) => {
    const { state } = this

    const newState = {
      ...state,
      values: merge(state.values),
      errors: {...state.errors},
    }

    // set the value using the lodash setter (nested)
    unset( newState.values, name )

    // iterate over the errors in order to find exact or partial matches
    for ( let key of Object.keys(newState.errors) ) {
      if ( key === name || key.startsWith( name ) ) {
        delete newState.errors[key]
      }
    }

    await this.onChange(newState)
  }

  setValue = async ( name, value, error = null ) => {
    const { state } = this

    const newState = {
      ...state,
      values: merge(state.values),
      errors: {
        ...state.errors,
        [name]: error,
      },
    }

    // set the value using the lodash setter (nested)
    set( newState.values, name, value )

    // iterate over the errors in order to find exact or partial matches
    if ( ! error ) {
      for ( let key of Object.keys(newState.errors) ) {
        if ( key === name || key.startsWith( name ) ) {
          delete newState.errors[key]
        }
      }
    }

    await this.onChange(newState)
  }

  pushValue = async (name, value) => {
    let parent = this.getValue(name)
    if ( parent && ! Array.isArray(parent) ) {
      throw new Error('parent is not an array')
    }

    if ( ! parent ) {
      parent = []
    }

    // lets copy the parent
    parent = [ ...parent ]

    // push value into the array
    parent.push( value )

    // lets update the value
    await this.setValue( name, parent )
  }

  spliceValue = async (name, index, count = 1) => {
    let parent = this.getValue(name)
    if ( parent && ! Array.isArray(parent) ) {
      throw new Error('parent is not an array')
    }

    if ( ! parent ) {
      parent = []
    }

    // lets copy the parent
    parent = [ ...parent ]

    // push value into the array
    parent.splice( index, count )

    // lets update the value
    await this.setValue( name, parent )
  }

  getValue = ( name ) => {
    const { values } = this.state
    return get( values, name )
  }

  getValues = () => {
    const { initialValues } = this.props
    const { values } = this.state

    return {
      ...initialValues,
      ...values
    }
  }

  render () {
    const { children, className } = this.props

    return (
      <form
        children={children}
        onSubmit={this.onSubmit}
        className={className}
      />
    )
  }

  // Returns number of errors on state
  validate = ( fields, values ) => {
    const errors = {}
    const { components } = this

    if ( ! fields ) {
      fields = Object.keys( components )
    }

    for ( let name of fields ) {
      let component = components[ name ]

      const value = values ? values[ name ] : component.getRawValue()

      errors[ name ] = component.validate( value )
    }

    return errors
  }

  ensureValidation = async () => {
    const errors = this.validate()

    await this.setState({
      ...this.state,
      errors
    })

    return errors
  }

  hasErrors = ( errors = this.state.errors ) => {
    if ( ! errors ) {
      errors = this.state.errors
    }

    return Object.keys( errors ).filter( field => !! errors[ field ] ).length
  }

  getFormattedErrors = ( errors = this.state.errors ) => {
    const errs = []

    for ( let field in errors ) {
      const error = this.getFormattedError( field, errors )
      if ( error ) errs.push( error )
    }

    return errs
  }

  getFormattedError = ( field, errors = this.state.errors ) => {
    const error = errors[field]
    const { intl } = this.props

    return (
      error && error instanceof IntlError && error.formatMessage( intl ) ||
      error && error.message ||
      error
    )
  }

  getError = ( field, errors = this.state.errors ) => {
    return errors[field]
  }

  onSubmit = async ( e ) => {

    if ( e && e.preventDefault ) {
      e.preventDefault()
    }

    const errors = await this.ensureValidation()

    if ( this.hasErrors( errors ) ) {
      return
    }

    const { onSubmit } = this.props
    const { values } = this.state

    await this.setState({
      previousValues: merge({}, values),
      submitting: true
    })

    if ( onSubmit ) {
      await onSubmit( this.state )
    }

    // Handle not submitting
    if ( this.mounted ) {
      await this.setState({ submitting: false })
    }
  }

  isDirty = () => (
    ! isEqual(this.state.values, this.state.initialValues)
  )

  registerComponent = ( name, component ) => {
    const components = this.components = this.components || {}
    components[ name ] = component
  }

  unregisterComponent = ( name ) => {
    const components = this.components = this.components || {}
    delete components[ name ]
  }

}

export default injectIntl( Form )
