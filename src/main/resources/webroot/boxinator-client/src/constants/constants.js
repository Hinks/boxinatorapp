export const SUPPORTED_COUNTRIES = ["Australia","Brazil","China","Sweden"]
export const ERROR_MESSAGES = {
  INVALID_NAME: "Name is not valid",
  INVALID_WEIGHT: "Not a valid number",
  INVALID_RGB_COLOR: "Invalid hex color",
  INVALID_DESTINATION_COUNTRY: (destinationCountry) => `Shipping to ${destinationCountry} is not supported`
}
