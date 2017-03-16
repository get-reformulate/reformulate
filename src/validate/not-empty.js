import IntlError from 'intl-error'

const DEFAULT_OPTIONS = {
  forceString: false,
  forceArray: false,
}

export default function ({ forceString } = DEFAULT_OPTIONS) {
  return function ( value ) {
    if (
      ( forceString || typeof value == 'string' ) &&
        ! value.trim().replace(/ /g,'')

    ) {
      throw new IntlError({ id: "reformulate.validate_not_empty" })
    }
  }
}
