import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Chart = ({ stock, updateChartRange }) => {

    const [colour, setColour] = useState(0);
    const [active, setActive] =useState('5y')

    const onClickHandler = event => {
        console.log("BUtton pressed")
        updateChartRange(event.target.value)
        setActive(event.target.value);
    }
    
    return (
        <div className="chart">
            <div className="chart-button__wrapper">
                <button className={active === '1d' ? 'active' : 'inactive'} onClick={onClickHandler} value='1d'>1D</button>
                <button className={active === '5d' ? 'active' : 'inactive'} onClick={onClickHandler} value='5d'>5D</button>
                <button className={active === '1m' ? 'active' : 'inactive'} onClick={onClickHandler} value='1m'>1M</button>
                <button className={active === '1y' ? 'active' : 'inactive'} onClick={onClickHandler} value='1y'>1Y</button>
                <button className={active === '5y' ? 'active' : 'inactive'} onClick={onClickHandler} value='5y'>5Y</button>
                <button className={active === 'max' ? 'active' : 'inactive'} onClick={onClickHandler} value='max'>MAX</button>
            </div>
            <ResponsiveContainer height='100%' width='100%'>
                <AreaChart data={stock}
                    margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis orientation='right' />
                    <Tooltip />
                    <Area type='monotone' dataKey='close' stroke='#8884d8' fill='#8884d8' />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}
export default Chart