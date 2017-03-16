import React, { PropTypes, Component } from 'react'

export default class FieldComponent extends Component {

  static contextTypes = {
    form: PropTypes.object
  }

  static propTypes = {
    name: PropTypes.string.isRequired,
    onChange: PropTypes.func,
    required: PropTypes.bool,
    defaultValue: PropTypes.any,
    initialValue: PropTypes.any,
    validate: PropTypes.func,
  }

  constructor ( props, context, engine ) {
    super( props, context, engine )

    context.form.registerComponent( props.name, this )
  }

  validate = ( newValue ) => {
    const { validate } = this.props
    const { getValues } = this.context.form
    let hasError

    try {
      if ( validate ) {
        validate( newValue, getValues() )
      }
    } catch ( error ) {
      hasError = error
    }

    return hasError
  }

  setValue = async ( newValue ) => {
    const { name, initialValue } = this.props

    const hasError = this.validate( newValue )

    await this.context.form.setValue(
      // query name
      name,
      // value
      newValue,
      // error
      hasError || null,
      // changed
      typeof initialValue !== 'undefined'
    )
  }

  getValue = () => {
    const { name } = this.props
    const { getValue } = this.context.form

    return getValue( name )
  }

  // Empty Raw Value is set out of this function to allow its definition on
  // a class extension
  getEmptyRawValue = () => ''

  getRawValue = () => {
    const { rels } = this

    if ( rels && rels.field ) {
      return rels.field.value
    }

    const value = this.getValue()

    if ( typeof value != 'undefined' ) {
      return value
    }

    return this.getEmptyRawValue()
  }

  invalidate = ( error ) => {
    const { setValue } = this.context.form
    const { name } = this.props
    const value = this.getValue()

    setValue( name, value, error )
  }

  hasError = () => {
    return !! this.context.form.getError( this.props.name )
  }

  getError = () => {
    return this.context.form.getError( this.props.name )
  }

  getFormattedError = () => {
    return this.context.form.getFormattedError( this.props.name )
  }

  isBeingSubmitted = () => {
    return this.context.form.submitting
  }

  shouldBeDisabled = () => {
    const { loading, submitting } = this.context.form
    return loading || submitting
  }

  render () {
    const { required } = this.props
    const error = this.getError()

    console.log( 'render', this.getValue() )

    return (
      <input
        rel="field"
        {...{ name, required }}
        className={ error ? 'has-error' : ''}
        onChange={this.onChange}
        value={this.getValue()}
      />
    )
  }

  // To be used to pass properties to input
  onChange = async ({ target }) => {
    const { onChange } = this.props

    const value = target.type === 'checkbox' ? target.checked || false : target.value || ''

    await this.setValue( value )

    if ( onChange ) {
      onChange( value, this, this.context.form )
    }
  }

}
