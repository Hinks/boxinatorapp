import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import { JSDOM } from 'jsdom';


Enzyme.configure({ adapter: new Adapter() });


const dom = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>');
const win = dom.window;

global.document = dom.window.document;
global.window = dom.window;

Object.keys(win).forEach(property => {
  if (typeof global[property] === 'undefined') {
    global[property] = win[property];
  }
});

global.navigator = {
  userAgent: 'node.js'
};
