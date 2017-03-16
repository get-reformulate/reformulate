import React, { PropTypes, Component } from 'react'
import { injectIntl } from 'react-intl'
import IntlError from 'intl-error'

@injectIntl
export default class Form extends Component {

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
  }

  static defaultProps = {
    initialValues: {},
    // enforceInitialValues: false,
    loading: false,
    submitOnChange: false
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
    this._handleInitialValues()
  }

  componentWillUpdate () {
    this._handleInitialValues()
  }

  componentWillUnmount () {
    this.mounted = false
  }

  _handleInitialValues () {
    // we do not want to use setState here
    this.state.initialValues = this.props.initialValues
  }

  getChildContext () {
    const { registerComponent, setValue, getValue, getValues, getError, getFormattedError, hasErrors } = this
    const { initialValues, loading } = this.props
    const { values, previousValues, errors, submitting } = this.state

    return {
      form: {
        registerComponent,
        values, previousValues, initialValues,
        errors, getValues, getValue, setValue,
        getError, hasErrors, getFormattedError,
        submitting, loading
      }
    }
  }

  setValue = async ( name, value, error ) => {
    const { props: { onChange, submitOnChange }, state: { values, errors } } = this

    console.log( 'setting', name, value, error )

    const newState = {
      ...this.state,
      values: {
        ...values,
        [name]: value
      },
      errors: {
        ...errors,
        [name]: error
      }
    }

    await this.setState(newState)

    if ( onChange ) {
      await onChange( newState )
    }

    if ( submitOnChange ) {
      this.onSubmit()
    }
  }

  getValue = ( name ) => {
    const { initialValues } = this.props
    const { values } = this.state

    if ( typeof values[ name ] !== 'undefined' ) {
      return values[ name ]
    }

    if ( typeof initialValues[ name ] !== 'undefined' ) {
      return initialValues[ name ]
    }

    return undefined
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
      previousValues: { ...values },
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

  registerComponent = ( name, component ) => {
    const components = this.components = this.components || {}
    components[ name ] = component
  }

}
