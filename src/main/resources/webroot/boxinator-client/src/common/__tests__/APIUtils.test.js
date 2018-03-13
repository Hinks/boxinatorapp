import { postBox, getBoxes } from '../APIUtils.js'
var assert = require('assert')

describe("Dependency injection, post box to server", () => {


  it("calls fetch with correct url", () => {
    const fakeFetch = (url, init) => {
      assert.equal(url, "http://localhost:8080/api/savebox")
      return new Promise((resolve) => {})
    }
    postBox(fakeFetch, {})
  })


  it("calls fetch with correct init options", () => {
    const fakeBox = {
      receiver: "Sven Svensson",
      weight: 1.0,
      color: "#000000",
      destinationCountry: "Sweden"
    }
    const fakeFetch = (url, init) => {
      assert.equal(init.method, "POST")
      assert.equal(init.mode, "cors")
      assert.deepEqual(init.body, JSON.stringify(fakeBox))
      assert.deepEqual(init.headers, {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      })
      return new Promise((resolve) => {})
    }
    postBox(fakeFetch, fakeBox)
  })


  it("parses the response of fetch correctly", (done) => {
    const fakeFetch = (url, init) => {
      return Promise.resolve({
        json: () => Promise.resolve({
          data: {
            id: 1
          }
        })
      })
    }
    postBox(fakeFetch, {})
      .then(result => {
        assert.equal(result.id, 1)
        done()
      })
      .catch(done)
  })


  it("response with an error-field should be rejected and caught in .catch()", (done) => {
    const fakeFetch = (url, init) => {
      return Promise.resolve({
        json: () => Promise.resolve({
          error: {
            code: 400,
            message: "Box not saved due to incorrect structure or invalid fields."
          }
        })
      })
    }
    const promiseShouldFailAtErrorInResponse = (promise) => {
      return new Promise((success, failure) => {
        promise
          .then(() => {
            failure(new Error("should of failed"))
          })
          .catch((error) => {
            success(error);
          })
      })
    }
    promiseShouldFailAtErrorInResponse(postBox(fakeFetch))
      .then(error => {
        assert.equal(error.code, 400)
        assert.equal(error.message, "Box not saved due to incorrect structure or invalid fields.")
        done()
      })
      .catch(done)
  })
})




describe("Dependency injection, get boxes from the server.", () => {


  it("calls fetch with correct url", () => {
    const fakeFetch = (url, init) => {
      assert.equal(url, "http://localhost:8080/api/boxes")
      return new Promise((resolve) => {})
    }
    getBoxes(fakeFetch)
  })


  it("calls fetch with correct init options", () => {
    const fakeFetch = (url, init) => {
      assert.deepEqual(init, {mode: "cors"})
      return new Promise((resolve) => {})
    }
    getBoxes(fakeFetch)
  })


  it("parses the response of fetch correctly", (done) => {
    const fakeFetch = (url, init) => {
      return Promise.resolve({
        json: () => Promise.resolve({
          data: {
            boxes: ["box1", "box2"],
            totalShippingCost: 10,
            totalWeight: 5
          }
        })
      })
    }
    getBoxes(fakeFetch)
      .then(result => {
        assert.equal(result.boxes.length, 2)
        assert.equal(result.totalShippingCost, 10)
        assert.equal(result.totalWeight, 5)
        done()
      })
      .catch(done)
  })


  it("response with an error-field should be rejected and caught in .catch()", (done) => {
    const fakeFetch = (url, init) => {
      return Promise.resolve({
        json: () => Promise.resolve({
          error: {
            code: 404,
            message: "Resource not found"
          }
        })
      })
    }
    const promiseShouldFailAtErrorInResponse = (promise) => {
      return new Promise((success, failure) => {
        promise
          .then(() => {
            failure(new Error("should of failed"))
          })
          .catch((error) => {
            success(error);
          })
      })
    }
    promiseShouldFailAtErrorInResponse(getBoxes(fakeFetch))
      .then(error => {
        assert.equal(error.code, 404)
        assert.equal(error.message, "Resource not found")
        done()
      })
      .catch(done)
  })
})
