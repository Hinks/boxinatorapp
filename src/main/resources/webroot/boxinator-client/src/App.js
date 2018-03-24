import React from 'react'
import { HashRouter, Link, Route, Switch } from 'react-router-dom'
import { Provider } from 'react-redux'
import store from './store'
import BoxForm from './boxform'
import BoxList from './boxlist'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import './stylesheets/App.css'

const App = () => (
  <Provider store={store}>
    <HashRouter>
    <MuiThemeProvider>
      <div className="App">
        <Switch>
           <Route exact path='/' component={IndexPage} />
           <Route exact path='/addbox' render={ props => <BoxForm {...props} whichFetch={window.fetch}/> } />
           <Route exact path='/listboxes'  render={ props => <BoxList {...props} whichFetch={window.fetch}/> } />
           <Route component={NotFoundPage} />
        </Switch>
      </div>
      </MuiThemeProvider>
    </HashRouter>
  </Provider>
  
)

const IndexPage = () => {
  return (
    <ul>
      <li><Link to="/addbox">AddBox</Link></li>
      <li><Link to="/listboxes">ListBoxes</Link></li>
    </ul>
  )
}

const NotFoundPage = () => {
  return <div><h1>Page not found</h1></div>
}

export default App
