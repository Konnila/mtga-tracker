import React from 'react';
import ReactDOM from 'react-dom';
import './index.css'

Storage.prototype.setObject = function(key, value) {
  this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function(key) {
  var value = this.getItem(key);
  return value && JSON.parse(value);
}

const DeckEntry = ({ name, wins, losses, updateWinFn, updateLossFn, removeDeckFn }) => {
  const roundToTwo = (num) => {    
    return +(Math.round(num + "e+2")  + "e-2");
  }

  const winRate = () => {
    const wR = wins > 0 ? roundToTwo((wins / (wins + losses)) * 100) : 0

    return <span className={wR >= 50 ? 'positive-wr' : 'negative-wr'}>{wR}</span>
  }

  return (<li className="list-group-item">
    <div className="deck-data">
      {name} {wins} - {losses}, WR: {winRate()} %
    </div>
    <br />
    <button type="button" className="btn btn-success wr-button" onClick={() => updateWinFn(name)}>Win &nbsp;</button>
    <button type="button" className="btn btn-danger" onClick={() => updateLossFn(name)}>Loss &nbsp;</button>
    <br />
    <button type="button" className="btn btn-warning wr-button margin-t-1" onClick={() => updateWinFn(name, false)}>- Win</button>
    <button type="button" className="btn btn-warning margin-t-1" onClick={() => updateLossFn(name, false)}>- Loss</button>
    <button type="button" className="btn btn-danger float-right" onClick={() => removeDeckFn(name)}>
      Remove
    </button>
  </li>)
}

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      decks: [],
      newNameInput: ''
    }
    this.addDeck = this.addDeck.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.updateWin = this.updateWin.bind(this);
    this.updateLoss = this.updateLoss.bind(this);
    this.removeDeck = this.removeDeck.bind(this);
    this.updateLocalStorage = this.updateLocalStorage.bind(this);
  }

  componentDidMount() {
    //localstorage stuff
    if (typeof(Storage) !== "undefined") {
      const dex = localStorage.getObject('decks');
      if(dex)
        this.setState({decks: dex})

      console.log(dex);
    } else {
     alert("jäbäl ei oo localstorage toiminnassa selaimes :<")
    }
  }

  componentDidUpdate(prevP, prevS) {
    if(this.state.decks !== prevS.decks) {
      this.updateLocalStorage();
    }
  }

  addDeck(name) {
    this.setState({decks: [...this.state.decks, {name, wins: 0, losses: 0}]})
  }

  updateLocalStorage() {
    localStorage.setObject('decks', this.state.decks);
  }

  updateWin(name, isAddition = true) {
    let copyOfDecks = [...this.state.decks]
    const updateTargetIndex = copyOfDecks.findIndex(d => d.name === name);
    
    copyOfDecks[updateTargetIndex].wins = isAddition ? 
    copyOfDecks[updateTargetIndex].wins + 1 : 
    copyOfDecks[updateTargetIndex].wins > 0 ? copyOfDecks[updateTargetIndex].wins - 1 : 0; //dont allow go below 0

    this.setState({ decks: copyOfDecks })
  }

  updateLoss(name, isAddition = true) {
    const copyOfDecks = [...this.state.decks]
    const updateTargetIndex = copyOfDecks.findIndex(d => d.name === name);

    copyOfDecks[updateTargetIndex].losses = isAddition ? 
      copyOfDecks[updateTargetIndex].losses + 1 : 
      copyOfDecks[updateTargetIndex].losses > 0 ? copyOfDecks[updateTargetIndex].losses - 1 : 0; //dont allow go below 0
      
    this.setState({ decks: copyOfDecks })
  }

  removeDeck(name) {
    if(window.confirm("Ookkonää varma?")) {
      this.setState({ decks: this.state.decks.filter(d => d.name !== name)})
    }
  }

  handleKeyUp(event) {
    if (event.key === 'Enter') {
      this.addDeck(this.state.newNameInput);
      this.setState({newNameInput: ''});
    }
  }

  render() {
    const decks = this.state.decks;
    return (
      <div className="container">
        <div className="form-group">
          <label htmlFor="newDeck">New deck name</label>
          <input type="text" value={this.state.newNameInput} 
            onChange={e => this.setState({ newNameInput: e.target.value })} 
            onKeyUp={this.handleKeyUp}
            className="form-control"
             placeholder="name" />
        </div>
        <ul className="list-group">
          {decks.map(d => DeckEntry({...d, updateWinFn: this.updateWin, updateLossFn: this.updateLoss, removeDeckFn: this.removeDeck}))}
       </ul>
      </div>
    )
  }
}

export default App;

ReactDOM.render(
    <App />,
    document.getElementById('root')
)