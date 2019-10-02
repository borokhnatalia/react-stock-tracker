import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateSearchQueryAction } from '../store/actions';

const Search = ({updateStock}) => {

    const dispatch = useDispatch()
    const state = useSelector((state) => state)
    const filteredSymbols = state.selectedCompanySymbols
    const [stock, setStock] = useState('');
    const [clickState, setClickState] = useState(false);
    const [searchBarState, setsearchBarState] = useState('');
    // const displayDropdown = (stock) => {display: stock.length > 0 ?'block':'none'}
    const onChange = event => {
        setStock(event.target.value)
        dispatch(updateSearchQueryAction(event.target.value))
    }

    const onSubmit = ({key, target}) => {
      console.log(target)
        if (key === 'Enter') {
          updateStock(target.value)
        }
      }
      
      const optionClick = data => {
        setStock(` ${data.name} (${data.symbol})`)
        updateStock(data.symbol)
        // setClickState(true)
    }

    const updateSeachBar = () => {
      console.log("Click state", clickState)
      console.log("Length", stock.length)
      if (!stock.length) {
        return {display: 'none'}
      }
      else if (stock.length > 0) {
        return {display: 'block'}
      }
      else if (stock.length > 0 && clickState === true) {
        return {display: 'none'}
      }
    }

    const options = filteredSymbols.map(data => {
      return (
        <li onClick={() => optionClick(data)} value={data.symbol} key={data.symbol}>
          {` ${data.name} (${data.symbol})`}
        </li>
      );
    });

    return (
        <>
        <div className="search-bar">
            <input type="text" placeholder="Search..." className="search-bar__input" value={stock} onChange={onChange} onKeyPress={onSubmit}/>
        </div>
        <ul name="search" className="search-bar__options" style={updateSeachBar()} >{options}</ul>
        </>
    )
}

export default Search;