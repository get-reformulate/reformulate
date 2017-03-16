import React, { PropTypes, Component } from 'react'

export default class ButtonComponent extends Component {

  static contextTypes = {
    form: PropTypes.object
  }

  static propTypes = {
    ensureFields: PropTypes.array
  }

  shouldBeDisabled = () => {
    const { form } = this.context
    return !! ( form.hasErrors() || form.submitting || form.loading || ! this.ensured() )
  }

  ensured = () => {
    const { form } = this.context
    const { ensureFields } = this.props

    if ( ! ensureFields ) {
      return true
    }

    for ( let i in ensureFields ) {
      let key = ensureFields[i]

      if( ! form.getValue( key ) ) {
        return false
      }
    }

    return true
  }

  isBeingSubmitted = () => {
    return this.context.form.submitting
  }

  render () {
    const error = this.getError()

    return (
      <button
        type="submit"
        className={ error ? 'has-error' : ''}
      />
    )
  }

}
