import IntlError from 'intl-error'

export default function ( maxDate ) {
  maxDate = (
    maxDate instanceof Date && maxDate ||
    new Date( maxDate )
  )

  if ( isNaN ( maxDate ) ) {
    throw new Error( "maxDate should be a valid date" )
  }

  return ( value ) => {
    if ( ! value ) return

    const date = (
      value instanceof Date && value ||
      new Date( value )
    )

    if ( isNaN( date ) ) {
      throw new IntlError({ id: "reform.validate_date_invalid" })
    }

    if ( date > maxDate ) {
      throw new IntlError({ id: "reform.validate_max_date" }, { date: maxDate.toString() } )
    }
  }
}
