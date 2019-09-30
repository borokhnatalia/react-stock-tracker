import { UPDATE_SELECTED_STOCK, UPDATE_CHART_RANGE, BOOTSTRAP, UPDATE_KEY_STATS, UPDATE_LATEST_NEWS, UPDATE_COMPANY_OVERVIEW, UPDATE_TOP_PEERS, UPDATE_SEARCH, UPDATE_COMPANY_SYMBOLS, UPDATE_QUOTES  } from './constants'
import { updateResponseAction, updateStockAction, updateChartDataAction, updateKeyStatsAction, updateLatestNewsAction,updateCompanyOverviewAction, updateTopPeersAction, updateSearchAction,updateCompanySymbolsAction, updateStockTickerAction,  } from './actions'

const io = require('socket.io-client')

const HOST = 'http://localhost'
const PORT = 4000
const SERVER = `${HOST}:${PORT}`

const socket = io(SERVER);


export const startupMiddleware = store => next => action => {

    if (action.type === BOOTSTRAP) {

        socket.on('chartData', (payload) => {
            store.dispatch(updateChartDataAction(payload))
        });
        socket.on('keyStats', (payload) => {
            store.dispatch(updateKeyStatsAction(payload))
            console.log("key stats recieved", payload)
        });
        socket.on('latestNews', (payload) => {
            store.dispatch(updateLatestNewsAction(payload))
        });
        socket.on('companyOverview', (payload) => {
            store.dispatch(updateCompanyOverviewAction(payload))
        });
        socket.on('topPeers', (payload) => {
            store.dispatch(updateTopPeersAction(payload))
        });
        socket.on('sectorInformation', (payload) => {
            store.dispatch(updateSearchAction(payload))
        });
        socket.on('companySymbols', (payload) => {
            store.dispatch(updateCompanySymbolsAction(payload))
        });
        socket.on('stockTicker', (payload) => {
            store.dispatch(updateStockTickerAction(payload))
        });
        console.info('Application has been bootstrapped')
    }

    return next(action)
}


export const stockMiddleware = store => next => action => {
    if (action.type === UPDATE_SELECTED_STOCK) {
        socket.emit('stockName', action.payload, store.getState().selectedChartRange)
    }
    else if (action.type === UPDATE_CHART_RANGE) {
        socket.emit ('timeRange' , store.getState().selectedStock,action.payload)
    }
    return next(action)
}