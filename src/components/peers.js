import React from 'react';

const Peers = ({stock}) => {
    return (
        <div className="peers">
            <h1 className="title">Top Peers</h1>
            <p>{stock.peers}</p>
        </div>
    )
}

export default Peers    