export const SUPPORTED_COUNTRIES = ["Australia","Brazil","China","Sweden"]
export const ERROR_MESSAGES = {
  invalidName: "Name is not valid",
  invalidWeight: "Not a valid number",
  invalidRGBColor: "Invalid hex color",
  invalidBoxColor: "Any color of blue is disallowed",
  invalidDestinationCountry: (destinationCountry) => `Shipping to ${destinationCountry} is not supported`
}
