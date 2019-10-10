// Data feed imports
const { sectorInformation } = require("./components/sectorInformation");
const { topPeers } = require("./components/topPeers");
const { companyOverview } = require("./components/companyOverview");
const { latestNewsInterval } = require("./components/latestNewsInterval");
const { keyStats } = require("./components/keyStats");
const { stockTicker } = require("./components/stockTicker");

const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const axios = require("axios");
const port = process.env.PORT || 4000;
const index = require("./routes");
const app = express();
app.use(index);
const server = http.createServer(app);
const io = socketIo(server);

const oneDay = 24 * 60 * 60 * 1000;

io.on("connection", socket => {
  const timerIDs = {}
  const allSymbols = getCompanySymbols(socket);
  console.log("New client connected");
  socket.on("stockName", async (stockName, timeRange) => {
    if (stockName === "") { return false }
    console.log("Stock entered: ", stockName)

    Object.values(timerIDs).forEach(clearInterval);

    startIntervals(socket, stockName, timeRange);

    timerIDs.stockTicker = setInterval(() => {
      stockTicker(socket, stockName, HOST, TOKEN);
    }, 5000);
    timerIDs.keyStats = setInterval(() => {
      keyStats(socket, stockName, HOST, TOKEN);
    }, oneDay);
    timerIDs.latestNews = setInterval(() => {
      latestNewsInterval(socket, stockName, HOST, TOKEN);
    }, oneDay);
    timerIDs.companyOverview = setInterval(() => {
      companyOverview(socket, stockName, HOST, TOKEN);
    }, oneDay);
    timerIDs.topPeers = setInterval(() => {
      topPeers(socket, stockName, HOST, TOKEN);
    }, oneDay);
    timerIDs.chartData = setInterval(() => {
      chartDataInterval(socket, stockName, timeRange);
    }, oneDay);
    timerIDs.sectorInformation = setInterval(() => {
      sectorInformation(socket, stockName, HOST, TOKEN);
    }, oneDay);
  });

  socket.on('searchQuery', (inputQuery) => {
    searchQuery(socket, inputQuery, allSymbols);
  });

  socket.on('timeRange', (stockName, timeRange) => {
    chartDataInterval(socket, stockName, timeRange);
  });

  socket.on("disconnect", () => {
    Object.values(timerIDs).forEach(clearInterval);
    console.log("Client disconnected");
  });
});

server.listen(port, () => console.log(`Listening on port ${port}`));

const HOST = 'https://sandbox.iexapis.com/stable';
const TOKEN = 'Tsk_d2f1890612194476b41d39992a3ad835';

const startIntervals = (socket, stockName, timeRange) => {
  stockTicker(socket, stockName, HOST, TOKEN);
  keyStats(socket, stockName, HOST, TOKEN);
  latestNewsInterval(socket, stockName, HOST, TOKEN);
  companyOverview(socket, stockName, HOST, TOKEN);
  topPeers(socket, stockName, HOST, TOKEN);
  chartDataInterval(socket, stockName, timeRange);
  sectorInformation(socket, stockName, HOST, TOKEN);
}

const getCompanySymbols = async () => {
  try {
    const companySymbols = await axios.get(
      `${HOST}/ref-data/symbols?token=${TOKEN}`
    )

    return companySymbols.data.map(data => ({ symbol: data.symbol, name: data.name }))

  } catch (error) {
    console.error(`Error: ${error}`);
  }
};

const searchQuery = async (socket, inputQuery, allSymbols) => {
  try {
    const a = await allSymbols
    const b = a.map(data => ({ symbol: data.symbol, name: data.name }))
    const filteredData = b.filter(search => search.symbol.toLowerCase().indexOf(inputQuery.toLowerCase()) !== -1 || search.name.toLowerCase().indexOf(inputQuery.toLowerCase()) !== -1);


    const topTen = filteredData.slice(0, 10)
    socket.emit("companySymbols", topTen);
  } catch (error) {
    console.error(`Error: ${error}`);
  }
};

const chartDataInterval = async (socket, stockName, timeRange) => {
  try {
    const chart = await axios.get(
      `${HOST}/stock/${stockName}/chart/${timeRange}?token=${TOKEN}`
    );
    console.log(timeRange)
    const time = () => {
      if (timeRange === '1d') return chart.data.map(data => ({ close: data.close, date: data.minute }))
      else return chart.data.map(data => ({ close: data.close, date: data.date }))

    }
    const chartData = time(timeRange)
    socket.emit("chartData", chartData);
  } catch (error) {
    console.error(`Error: ${error}`);
  }
};
