import React, { PropTypes, Component } from 'react'
import classnames from 'classnames'
// import shallowEqual from 'fbjs/lib/shallowEqual'

export default class Form extends Component {

  static propTypes = {
    initialValues: PropTypes.object,
    // enforceInitialValues: PropTypes.bool.isRequired,
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
    this._handleInitialValues()
  }

  componentDidUpdate () {
    this._handleInitialValues()
  }

  componentWillUnmount () {
    this.mounted = false
  }

  _handleInitialValues () {
    // if ( shallowEqual( this.props.initialValues, this.state.initialValues ) ) {
      // Do not trigger stat changes since this is loaded before the render
      this.state.initialValues = this.props.initialValues
    // }
  }

  getChildContext () {
    const { registerComponent, setValue, getValue, getValues, getError, hasErrors } = this
    const { initialValues, loading } = this.props
    const { values, previousValues, errors, submitting } = this.state

    return {
      form: {
        registerComponent,
        values, previousValues, initialValues,
        errors, getValues, getValue, setValue,
        getError, hasErrors,
        submitting, loading
      }
    }
  }

  setValue = ( name, value, error ) => {
    // const { enforceInitialValues } = this.props

    this.setState(( oldState, { onChange, submitOnChange }) => {
      const { values, errors } = oldState
      const newState = {
        ...oldState,
        values: {
          ...values,
          [name]: value
        },
        errors: {
          ...errors,
          [name]: error
        }
      }

      if ( onChange ) {
        onChange( newState )
      }

      if ( submitOnChange ) {
        setImmediate(() => {
          this.onSubmit()
        })
      }

      // this was causing an input "flickering", by moving the cursor to the end everytime we needed to edit something
      // if ( enforceInitialValues ) {
      //   delete newState.values
      // }

      return newState
    })
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
        className={classnames( style.locals.Form, className )}
      />
    )
  }

  // Returns number of errors on state
  validate = ( fields, values ) => {
    const errors = {}
    const { components, getValues } = this

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

  ensureValidation = () => {
    const errors = this.validate()

    this.setState({
      ...this.state,
      errors
    })

    return errors
  }

  hasErrors = ( errors = this.state.errors ) => {
    if ( ! errors ) {
      errors = this.state.errors
    }

    return Object.keys( errors )
    .filter( field => !! errors[ field ] )
    .length
  }

  getError = ( field ) => {
    return this.state.errors[field]
  }

  onSubmit = async ( e ) => {

    if ( e && e.preventDefault ) {
      e.preventDefault()
    }

    const errors = this.ensureValidation()

    if ( this.hasErrors( errors ) ) {
      return
    }

    const { onSubmit } = this.props
    const { values, previousValues } = this.state

    this.setState({
      previousValues: { ...values },
      submitting: true
    })

    if ( onSubmit ) {
      await onSubmit( values, previousValues )
    }

    // Handle not submitting
    if ( this.mounted ) {
      this.setState({ submitting: false })
    }
  }

  registerComponent = ( name, component ) => {
    const components = this.components = this.components || {}
    components[ name ] = component
  }

}
